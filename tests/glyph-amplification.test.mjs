import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluateAmplificationAdditional, evaluateAmplificationGlyph } from "../paragon-visual/glyph-amplification.js";
import { formatAmplifiedCore } from "../paragon-visual/glyph-picker.js";
import { calculateParagonBonuses } from "../paragon-visual/paragon-calculator.js";
import { mergeSharedNodeDefinitions } from "../paragon-visual/shared-node-definitions.js";
import { paladinGlyphCatalogue } from "../paragon-visual/paladin-glyph-catalogue.js";

const { sourceRevision } = paladinGlyphCatalogue;
const context = { instanceId: "experiment" };
const zero = { Strength: 0, Dexterity: 0, Intelligence: 0, Willpower: 0 };
const attributes = {
  Strength: [9, "Strength_Core", "Generic_Normal_Str", 678769],
  Intelligence: [10, "Intelligence_Core", "Generic_Normal_Int", 678776],
  Dexterity: [12, "Dexterity_Core", "Generic_Normal_Dex", 678775]
};
const socket = 72;
const strengthCells = [71, 73, 59, 85, 70];
const close = (value, expected, tolerance = 0.000001) => assert.ok(Math.abs(value - expected) < tolerance, `${value} ≈ ${expected}`);

function experiment(count = 2, { dexterity = true, intelligence = true } = {}) {
  const board = { nWidth: 13, arEntries: Array(169).fill(null) };
  const definitions = [];
  const allocated = new Set();
  function add(index, name, snoId, kind, lines = []) {
    board.arEntries[index] = { name, __raw__: snoId };
    allocated.add(index);
    if (!definitions.some(definition => definition.name === name)) {
      definitions.push({ kind, name, snoId, attributes: lines, thresholdReferences: [], ptBonusAttributeIndices: [] });
    }
  }
  const core = (index, stat) => {
    const [id, name, internal, snoId] = attributes[stat];
    add(index, internal, snoId, "normal", [{ id, name, param: -1, formulaReference: "ParagonNodeCoreStat_Normal",
      formulaValue: 5, verifiedBonus: 5 }]);
  };
  for (const cell of strengthCells.slice(0, count)) core(cell, "Strength");
  if (dexterity) core(74, "Dexterity");
  if (intelligence) core(76, "Intelligence");
  add(socket, "Generic_Socket", 681756, "socket");
  // Use the pinned Starting Rare definition and registry for the +10 non-targeted line.
  const rawPower = resources.board00.database.nodes.find(node => node.snoId === 2549802);
  board.arEntries[46] = { name: rawPower.name, __raw__: rawPower.snoId };
  board.__snoID__ = resources.board00.board.__snoID__;
  definitions.push(rawPower);
  allocated.add(46);
  const db = { source: resources.board00.database.source, nodes: definitions };
  return { board, db, allocated };
}

const resources = {};
for (const suffix of ["00", "01", "02", "06", "09"]) {
  const board = JSON.parse(await readFile(new URL(`../paladin-board-${suffix}.json`, import.meta.url)));
  const file = suffix === "00" ? "node-data.json" : `node-data-${suffix}.json`;
  const database = mergeSharedNodeDefinitions(JSON.parse(await readFile(new URL(`../paragon-visual/${file}`, import.meta.url))));
  resources[`board${suffix}`] = { board, database };
}

test("all six source-derived coefficient rows use the authored operation-1 records", () => {
  const { board } = experiment();
  const cases = [
    [2073373, 2073360, "normal", 200, 8.085000038146973, [20, 27.2765, 39.404, 59.6165, 60.425, 100.0415, 140.4665]],
    [2478548, 1224822, "magic", 300, 30, [30, 57, 102, 177, 180, 327, 477]],
    [2479306, 751203, "rare", 250, 25, [25, 47.5, 85, 147.5, 150, 272.5, 397.5]],
    [2506253, 751203, "rare", 250, 25, [25, 47.5, 85, 147.5, 150, 272.5, 397.5]],
    [2617836, 1475148, "rare", 200, 20, [20, 38, 68, 118, 120, 218, 318]],
    [2120405, 1475148, "rare", 200, 20, [20, 38, 68, 118, 120, 218, 318]]
  ];
  for (const [snoId, affix, kind, start, slope, predictions] of cases) {
    [1, 10, 25, 50, 51, 100, 150].forEach((level, index) => {
      const result = evaluateAmplificationGlyph({ board, ...context, sourceRevision, configuration: { snoId, level }, nodeEvaluations: [] });
      assert.deepEqual([result.affixSnoId, result.targetKind, result.startingScalar, result.addedScalarPerLevel, result.budgetFormulaGbid],
        [affix, kind, start, slope, 2549607169]);
      assert.equal(result.status, "unpurchased");
      close(result.percentagePoints, predictions[index]);
      assert.equal(result.evidence, snoId === 2073373 ? "experimentally-supported-amplification" : "source-derived-extrapolation");
    });
  }
});

test("Challenger reproduces full-precision predictions and records all observed integer results independently", () => {
  // The 44.3% rank and final unamplified global baseline are inferred.
  const cases = [
    [1, 2, 2, 2, 22, null, 20],
    [10, 2, 2.72765, 3, 23, [114, 116], 27.3],
    [25, 2, 3.9404, 3, 23, null, 39.4],
    [31, 2, 4.4255, 4, 24, [114, 118], 44.3],
    [31, 3, 6.63825, 6, 31, [119, 125], 44.3],
    [31, 4, 8.851, 8, 38, [124, 132], 44.3],
    [31, 5, 11.06375, 11, 46, [129, 140], 44.3]
  ];
  for (const [level, count, expected, observedSocket, observedLocal, global, observedCoefficient] of cases) {
    const { board, db, allocated } = experiment(count);
    // The separate captured 44.3% INT baseline includes the purchased radius-four node.
    const external = { Strength: (global?.[0] ?? 114) - (count * 5 + 10), Dexterity: 87, Intelligence: 96, Willpower: 86 };
    const native = calculateParagonBonuses(board, db, allocated, external, context);
    const result = calculateParagonBonuses(board, db, allocated, external, { ...context, glyph: { snoId: 2073373, level } });
    const [glyph] = result.glyphEvaluations;
    const strengthDelta = glyph.deltasByAttribute.find(line => line.attributeId === 9).delta;
    close(strengthDelta, expected);
    assert.equal(Number(glyph.percentagePoints.toFixed(1)), observedCoefficient);
    const expectedResidual = level === 10 ? -1 : 0;
    assert.equal(formatAmplifiedCore(strengthDelta) - observedSocket, expectedResidual);
    const [requirement] = glyph.additional.requirements;
    close(requirement.effective, count * 5 + 10 + expected);
    assert.equal(formatAmplifiedCore(requirement.effective) - observedLocal, expectedResidual);
    close(result.totalAttributes.Strength - native.totalAttributes.Strength, expected);
    if (global) assert.deepEqual([native.totalAttributes.Strength, formatAmplifiedCore(result.totalAttributes.Strength)], global);

    const dex = glyph.deltasByAttribute.find(line => line.attributeId === 12).delta;
    assert.equal(formatAmplifiedCore(dex), level < 31 ? 1 : 2);
    if (level === 10 || level === 31) assert.deepEqual([native.totalAttributes.Dexterity, formatAmplifiedCore(result.totalAttributes.Dexterity)], [92, level === 10 ? 93 : 94]);
    const int = glyph.deltasByAttribute.find(line => line.attributeId === 10);
    if (level >= 25) assert.equal(formatAmplifiedCore(int.delta), level === 25 ? 1 : 2);
    else assert.equal(int, undefined);
    if (level === 31) {
      assert.deepEqual([native.totalAttributes.Intelligence, formatAmplifiedCore(result.totalAttributes.Intelligence)], [101, 103]);
      assert.equal(formatAmplifiedCore(glyph.contributions.find(line => line.attributeId === 9).effectiveBase), 7);
    }
    assert.equal(result.totalAttributes.Willpower, 86);
    if (count === 5) {
      close(glyph.fraction, 0.44255);
      assert.equal(requirement.native, 35);
      assert.equal(requirement.required, 40);
      assert.ok(requirement.native < requirement.required && glyph.additional.satisfied);
      assert.equal(formatAmplifiedCore(requirement.effective), 46);
      assert.deepEqual(result.verifiedParagonBonuses.rawBonuses.damageToElites, native.verifiedParagonBonuses.rawBonuses.damageToElites);
    }
  }
});

test("rarity, special nodes, instance, distance, purchase, and unresolved values govern eligibility", () => {
  const { board } = experiment(5);
  const line = { attributeIndex: 0, attributeId: 9, attributeParam: -1, unconditional: 5 };
  const native = { instanceId: context.instanceId, allocated: true, attributes: [line] };
  const socketNode = { ...native, nodeIndex: socket, kind: "socket" };
  const nodeEvaluations = [
    socketNode, { ...native, nodeIndex: 71, kind: "normal" }, { ...native, nodeIndex: 73, kind: "gate" },
    { ...native, nodeIndex: 59, kind: "start" }, { ...native, nodeIndex: 85, kind: "legendary" },
    { ...native, nodeIndex: 70, kind: "normal", allocated: false },
    { ...native, nodeIndex: 74, kind: "normal", attributes: [{ ...line, unconditional: null }] },
    { ...native, nodeIndex: 76, kind: "normal" }, { ...native, nodeIndex: 71, instanceId: "elsewhere", kind: "magic" }
  ];
  const run = (level, nodes = nodeEvaluations) => evaluateAmplificationGlyph({
    board, ...context, sourceRevision, configuration: { snoId: 2073373, level }, nodeEvaluations: nodes
  });
  assert.deepEqual(run(24).contributions.map(node => node.sourceIndex), [71]);
  assert.deepEqual(run(25).contributions.map(node => node.sourceIndex), [71, 76]);
  assert.deepEqual(run(24).unresolvedLines.map(node => node.sourceIndex), [74]);
  const inactive = run(25, [{ ...socketNode, allocated: false }, ...nodeEvaluations.slice(1)]);
  assert.equal(inactive.status, "unpurchased");
  assert.equal(inactive.contributions.length, 0);
  assert.equal(evaluateAmplificationAdditional(inactive, board, nodeEvaluations), null);
  assert.equal(evaluateAmplificationAdditional(run(25), board, nodeEvaluations).satisfied, null);
});

test("pinned Magic and Rare lines preserve flat, percentage-point and parameter identities", () => {
  const cases = [
    ["board01", [120, 78], 2478548, 1, 78, [10, -1, 0, "flat", 7, 9.1]],
    ["board09", [136, 117], 2478548, 1, 117, [161, 9, 0, "flat", 2, 2.6]],
    ["board06", [262, 266], 2478548, 25, 266, [237, -1, 6, "percentage-points", 1, 2.02]],
    ["board01", [120, 57], 2479306, 1, 57, [254, 0, 0, "percentage-points", 10, 12.5]],
    ["board02", [264, 261], 2506253, 1, 261, [373, -1, 0, "flat", 150, 187.5]],
    ["board02", [264, 261], 2617836, 1, 261, [373, -1, 0, "flat", 150, 180]],
    ["board02", [264, 261], 2120405, 1, 261, [373, -1, 0, "flat", 150, 180]]
  ];
  for (const [key, indices, snoId, level, sourceIndex, expected] of cases) {
    const { board, database } = resources[key];
    const allocated = new Set(indices);
    const run = (Willpower, placementIndex = 1) => calculateParagonBonuses(board, database, allocated, { ...zero, Willpower },
      { placementIndex, glyph: { snoId, level } });
    const result = run(0);
    const line = result.effectiveNodeContributions.find(entry => entry.sourceIndex === sourceIndex && entry.attributeId === expected[0]);
    assert.deepEqual([line.attributeId, line.attributeParam, line.aggregationOperator, line.units, line.nativeBase], expected.slice(0, 5));
    close(line.effectiveAmount, expected[5]);
    assert.deepEqual(result.glyphEvaluations[0].affectedNodeIndices, [sourceIndex]);
    if (snoId === 2506253) {
      assert.equal(line.nativeConditional, 150);
      assert.equal(line.conditionalAmplificationDelta, null);
      assert.equal(line.activeNativeConditional, 0);
      const met = run(305);
      const thorns = met.effectiveNodeContributions.find(line => line.attributeId === 373);
      assert.equal(thorns.activeNativeConditional, 150);
      assert.equal(thorns.effectiveAmount, 337.5);
      assert.equal(met.verifiedParagonBonuses.rawBonuses.thorns.total, 337.5);
      assert.equal(met.nodeEvaluations.find(node => node.nodeIndex === 261).thresholds[0].requiredValue, 305);
      const later = run(305, 2);
      assert.equal(later.nodeEvaluations.find(node => node.nodeIndex === 261).thresholds[0].requiredValue, 380);
      assert.equal(later.verifiedParagonBonuses.rawBonuses.thorns.total, 187.5);
    }
  }
});

test("allocated conditional core writers are rejected even when the native formula is unresolved", () => {
  const { board, db, allocated } = experiment();
  const nodes = db.nodes.map(node => node.name === "Generic_Normal_Str"
    ? { ...node, attributes: node.attributes.map(line => ({ ...line, verifiedBonus: null })) } : node);
  const result = calculateParagonBonuses(board, { ...db, nodes }, allocated, zero, { glyph: { snoId: 2073373, level: 31 } });
  assert.equal(result.glyphEvaluations[0].unresolvedLines.length, 2);
  assert.equal(result.glyphEvaluations[0].additional.satisfied, null);
  assert.equal(result.verifiedParagonBonuses.coreAttributes.Strength, 10);
  const conditionalCore = nodes.map(node => node.name === "Generic_Normal_Str" ? { ...node, ptBonusAttributeIndices: [0] } : node);
  assert.throws(() => calculateParagonBonuses(board, { ...db, nodes: conditionalCore }, allocated, zero), /conditional core/);
  assert.throws(() => calculateParagonBonuses(board, db, allocated, { ...zero, Strength: 0.2 }), /non-negative whole number/);
});
