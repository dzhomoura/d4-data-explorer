import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildBoardInstanceLayout, calculateConnectedBonuses } from "../paragon-visual/connected-boards.js";
import { calculateParagonBonuses } from "../paragon-visual/paragon-calculator.js";
import { resolvePlacedRareThreshold } from "../paragon-visual/paragon-thresholds.js";
import { mergeSharedNodeDefinitions } from "../paragon-visual/shared-node-definitions.js";

const zero = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const boards = new Map();
for (let catalogIndex = 0; catalogIndex <= 9; catalogIndex++) {
  const suffix = String(catalogIndex).padStart(2, "0");
  const nodeFile = catalogIndex === 0 ? "node-data.json" : `node-data-${suffix}.json`;
  boards.set(`board${suffix}`, {
    board: await readJson(`../paladin-board-${suffix}.json`),
    database: mergeSharedNodeDefinitions(await readJson(`../paragon-visual/${nodeFile}`))
  });
}

// Expected requirements in placement order, independently transcribed from the pinned-source audit.
const requirementsBySelector = new Map([
  ["StrengthMain1", [["Strength", [630, 1085, 1540, 1995, 2450]]]],
  ["StrengthMain2", [["Strength", [760, 1215, 1670, 2125, 2580]]]],
  ["StrengthMain3", [["Strength", [890, 1345, 1800, 2255, 2710]]]],
  ["IntelligenceSide1", [["Intelligence", [190, 265, 340, 415, 490]]]],
  ["IntelligenceSide2", [["Intelligence", [210, 285, 360, 435, 510]]]],
  ["IntelligenceSide3", [["Intelligence", [230, 305, 380, 455, 530]]]],
  ["WillPowerSide1", [["Willpower", [190, 265, 340, 415, 490]]]],
  ["WillPowerSide2", [["Willpower", [210, 285, 360, 435, 510]]]],
  ["WillPowerSide3", [["Willpower", [230, 305, 380, 455, 530]]]],
  ["Paladin_Strength+Willpower", [
    ["Strength", [700, 1155, 1610, 2065, 2520]], ["Willpower", [190, 260, 330, 400, 470]]
  ]],
  ["Paladin_Strength+Intelligence", [
    ["Strength", [700, 1155, 1610, 2065, 2520]], ["Intelligence", [190, 260, 330, 400, 470]]
  ]]
]);

function requirementsOf(threshold) {
  return (threshold.requirements ?? [threshold]).map(({ requiredAttribute, requiredValue }) =>
    [requiredAttribute, requiredValue]
  );
}

function nodeAt(result, index) {
  return result.nodeEvaluations.find(node => node.nodeIndex === index);
}

function magnitudes(node) {
  return node.attributes.map(({ unconditional, conditional, provenance, category }) =>
    [unconditional, conditional, provenance, category]
  );
}

test("all Rare cells use the pinned requirements at every legal placement", () => {
  const seenNodes = new Set();
  const seenSelectors = new Set();
  const comparedContexts = new Set();
  const historical = { matching: 0, different: 0, outsideLegalRange: 0 };
  let cases = 0;
  for (const [catalogIndex, { board, database }] of [...boards.values()].entries()) {
    const raresBySno = new Map(database.nodes.filter(node => node.kind === "rare").map(node => [node.snoId, node]));
    for (const [index, entry] of board.arEntries.entries()) {
      const definition = raresBySno.get(entry?.__raw__);
      if (!definition) continue;
      const allocated = new Set([index]);
      const legacy = calculateParagonBonuses(board, database, allocated, zero, { boardEquipIndex: catalogIndex });
      const legacyNode = nodeAt(legacy, index);
      const [slot] = legacyNode.ptBonusAttributeIndices;
      const oldAttribute = legacyNode.attributes[slot];
      const selector = oldAttribute.thresholdReference;
      const vectors = requirementsBySelector.get(selector);
      assert.ok(vectors, definition.name);
      seenNodes.add(definition.snoId);
      seenSelectors.add(selector);
      const key = `${catalogIndex}:${definition.snoId}`;
      if (!comparedContexts.has(key)) {
        comparedContexts.add(key);
        const oldValues = requirementsOf(oldAttribute.threshold);
        const referencePlacement = catalogIndex === 0 ? 0 : 1;
        assert.deepEqual(oldValues, vectors.map(([name, values]) => [name, values[referencePlacement]]));
        const comparison = catalogIndex > 4 ? "outsideLegalRange"
          : catalogIndex > 1 ? "different" : "matching";
        if (comparison === "different") {
          assert.notDeepEqual(oldValues, vectors.map(([name, values]) => [name, values[catalogIndex]]));
        }
        historical[comparison]++;
      }

      for (const placementIndex of catalogIndex === 0 ? [0] : [1, 2, 3, 4]) {
        cases++;
        const calculate = attributes =>
          calculateParagonBonuses(board, database, allocated, attributes, { placementIndex });
        const initial = calculate(zero);
        const initialNode = nodeAt(initial, index);
        const expected = vectors.map(([name, values]) => [name, values[placementIndex]]);
        assert.deepEqual(requirementsOf(initialNode.attributes[slot].threshold), expected, `${definition.name} @ ${placementIndex}`);
        assert.deepEqual(magnitudes(initialNode), magnitudes(legacyNode));
        assert.deepEqual(initial.verifiedParagonBonuses, legacy.verifiedParagonBonuses);
        assert.equal(initial.unresolvedBonusCount, 0);

        const exact = { ...zero };
        for (const [name, required] of expected) exact[name] = required - initial.totalAttributes[name];
        const check = (external, active) => {
          const result = calculate(external);
          const marked = nodeAt(result, index).attributes[slot];
          const raw = result.verifiedParagonBonuses.rawBonuses[marked.category];
          assert.ok(marked.threshold.resolved);
          assert.equal(marked.threshold.satisfied, active);
          assert.equal(marked.conditionalApplied, active);
          assert.equal(raw.unconditional, initial.verifiedParagonBonuses.rawBonuses[marked.category].unconditional);
          assert.equal(raw.conditional, active ? oldAttribute.conditional : 0);
          assert.equal(result.conditionalBonuses.length, 1);
        };
        check(exact, true);
        check({ ...exact, ...Object.fromEntries(expected.map(([name]) => [name, exact[name] + 1])) }, true);
        for (const [name] of expected) check({ ...exact, [name]: exact[name] - 1 }, false);
      }
    }
  }
  assert.equal(seenNodes.size, 44);
  assert.deepEqual(seenSelectors, new Set(requirementsBySelector.keys()));
  assert.equal(cases, 220);
  assert.deepEqual(historical, { matching: 10, different: 18, outsideLegalRange: 29 });
});

test("placement preserves non-Rare bonus amounts and unresolved Legendary powers", () => {
  for (const [catalogIndex, { board, database }] of [...boards.values()].entries()) {
    const definitionsBySno = new Map(database.nodes.map(node => [node.snoId, node]));
    const indices = board.arEntries.flatMap((entry, index) =>
      entry && definitionsBySno.get(entry.__raw__).kind !== "rare" ? [index] : []
    );
    const allocated = new Set(indices);
    const legacy = calculateParagonBonuses(board, database, allocated, zero, { boardEquipIndex: catalogIndex });
    for (const placementIndex of catalogIndex === 0 ? [0] : [1, 2, 3, 4]) {
      const placed = calculateParagonBonuses(board, database, allocated, zero, { placementIndex });
      assert.deepEqual(placed.verifiedParagonBonuses, legacy.verifiedParagonBonuses);
      assert.equal(placed.unresolvedBonusCount, legacy.unresolvedBonusCount);
      for (const node of placed.nodeEvaluations.filter(node => allocated.has(node.nodeIndex))) {
        assert.deepEqual(magnitudes(node), magnitudes(nodeAt(legacy, node.nodeIndex)));
      }
    }
  }
});

test("Restorative retains both authored references and uses the tooltip-supported Willpower selector per cell", () => {
  const { board, database } = boards.get("board08");
  const definition = database.nodes.find(node => node.snoId === 680037);
  assert.deepEqual(definition.thresholdReferences.map(reference => reference.name), ["WillPowerSide2", "IntelligenceSide2"]);
  const calculate = (attributes, allocated = new Set([158, 326])) =>
    calculateParagonBonuses(board, database, allocated, attributes, { placementIndex: 2 });
  const below = calculate({ ...zero, Intelligence: 1000, Willpower: 359 });
  assert.deepEqual(below.verifiedParagonBonuses.rawBonuses.maximumLifePercent, { unconditional: 8, conditional: 0, total: 8 });
  const exact = calculate({ ...zero, Willpower: 360 });
  assert.deepEqual(exact.verifiedParagonBonuses.rawBonuses.maximumLifePercent, { unconditional: 8, conditional: 8, total: 16 });
  assert.deepEqual(exact.conditionalBonuses.map(bonus => bonus.nodeIndex), [158, 326]);
  for (const bonus of exact.conditionalBonuses) {
    assert.deepEqual(requirementsOf(bonus.threshold), [["Willpower", 360]]);
    assert.equal(bonus.threshold.selectorSnoId, 1015277);
    assert.equal(bonus.threshold.selectorProvenance, "direct-tooltip-supported");
  }
  const one = calculate({ ...zero, Willpower: 360 }, new Set([158]));
  assert.deepEqual(one.verifiedParagonBonuses.rawBonuses.maximumLifePercent, { unconditional: 4, conditional: 4, total: 8 });
});

test("class-ineligible references are excluded and Tenacity retains its verified Strength condition", () => {
  for (const [boardId, name] of [
    ["board00", "StrengthSide1"], ["board00", "WillpowerMain1"], ["board04", "Druid_Willpower+Dexterity"]
  ]) {
    const { database } = boards.get(boardId);
    const reference = database.nodes.flatMap(node => node.thresholdReferences).find(selector => selector.name === name);
    const result = resolvePlacedRareThreshold({ thresholdReferences: [reference] }, 1);
    assert.match(result.reason, /No unique supported Paladin/);
  }
  const { board, database } = boards.get("board00");
  for (const Strength of [629, 630]) {
    for (const Willpower of [189, 190]) {
      const result = calculateParagonBonuses(board, database, new Set([239]), { ...zero, Strength, Willpower }, {
        placementIndex: 0
      });
      const marked = nodeAt(result, 239).attributes[0];
      assert.equal(marked.conditionalApplied, Strength >= 630);
      assert.equal(marked.threshold.selectorProvenance, "direct-in-game");
    }
  }
});

test("invalid placement contexts and unsupported pinned selector identities are rejected", () => {
  for (const [boardId, badIndices] of [["board00", [1, -1, undefined]], ["board01", [0, 5, 1.5, "1", null]]]) {
    const { board, database } = boards.get(boardId);
    for (const placementIndex of badIndices) {
      assert.throws(() => calculateParagonBonuses(board, database, new Set(), zero, { placementIndex }), /Invalid placement index/);
    }
    assert.throws(() => calculateParagonBonuses(board, database, new Set(), zero, {
      placementIndex: 0, boardEquipIndex: 0
    }), /either a placement index or a legacy/);
  }
  const { board, database } = boards.get("board01");
  const high = { Strength: 10000, Intelligence: 10000, Willpower: 10000, Dexterity: 10000 };
  for (const badReference of [
    { name: "UnknownSelector", target: "base/meta/ParagonThreshold/UnknownSelector.pth" },
    { name: "Paladin_Strength+Willpower", snoId: 2504903, target: "base/meta/ParagonThreshold/Paladin_Strength+Willpower.pth" },
    { name: "Paladin_Strength+Willpower", snoId: 2504901, target: "bad/path.pth" },
    { name: "IntelligenceSide1", snoId: 1015350, target: "base/meta/ParagonThreshold/IntelligenceSide1.pth" }
  ]) {
    const altered = {
      ...database,
      nodes: database.nodes.map(node => node.snoId === 2449723
        ? { ...node, thresholdReferences: [...node.thresholdReferences, badReference] }
        : node)
    };
    const result = calculateParagonBonuses(board, altered, new Set([57]), high, { placementIndex: 1 });
    const knight = nodeAt(result, 57);
    assert.equal(knight.thresholds[0].resolved, false);
    assert.match(knight.thresholds[0].reason, /pinned selector|unique supported Paladin threshold selector/i);
    assert.deepEqual(result.verifiedParagonBonuses.rawBonuses.physicalDamage, { unconditional: 10, conditional: 0, total: 10 });
    assert.equal(result.unresolvedBonusCount, 1);
  }
});

function pathTo(layout, target) {
  const previous = new Map([[layout.root, null]]);
  const queue = [layout.root];
  for (let i = 0; i < queue.length && !previous.has(target); i++) {
    for (const next of layout.graph.get(queue[i])) {
      if (previous.has(next)) continue;
      previous.set(next, queue[i]);
      queue.push(next);
    }
  }
  assert.ok(previous.has(target), target);
  const path = new Set();
  for (let id = target; id !== null; id = previous.get(id)) path.add(id);
  return path;
}

test("Knight follows the directly observed placements after swapping Shield Bearer and Fervent", () => {
  const observed = new Map([[1, [1155, 260]], [2, [1610, 330]], [3, [2065, 400]]]);
  for (const [shieldPlacement, ferventPlacement] of [[2, 3], [3, 2]]) {
    const layout = buildBoardInstanceLayout(boards, [
      { instanceId: "start", boardId: "board00", placementIndex: 0, rotation: 0, incoming: null },
      { instanceId: "castle", boardId: "board01", placementIndex: 1, rotation: 0,
        incoming: { parentInstanceId: "start", parentGateIndex: 10, entryGateIndex: 430 } },
      { instanceId: "shield", boardId: "board02", placementIndex: shieldPlacement, rotation: 0,
        incoming: { parentInstanceId: "castle", parentGateIndex: 230, entryGateIndex: 210 } },
      { instanceId: "fervent", boardId: "board03", placementIndex: ferventPlacement, rotation: 0,
        incoming: { parentInstanceId: "castle", parentGateIndex: 210, entryGateIndex: 230 } }
    ]);
    for (const [id, index, placement] of [["castle", 57, 1], ["shield", 201, shieldPlacement], ["fervent", 178, ferventPlacement]]) {
      const target = `${id}:${index}`;
      const allocated = pathTo(layout, target);
      const initial = calculateConnectedBonuses(layout, allocated, zero);
      const node = result => result.nodeEvaluations.find(evaluation => evaluation.nodeId === target);
      const [strength, willpower] = observed.get(placement);
      assert.deepEqual(requirementsOf(node(initial).thresholds[0]), [["Strength", strength], ["Willpower", willpower]]);
      const exact = {
        ...zero,
        Strength: strength - initial.totalAttributes.Strength,
        Willpower: willpower - initial.totalAttributes.Willpower
      };
      assert.ok(exact.Strength < strength && exact.Willpower < willpower);
      assert.equal(node(calculateConnectedBonuses(layout, allocated, exact)).attributes[0].conditionalApplied, true);
      assert.equal(node(calculateConnectedBonuses(layout, allocated, { ...exact, Willpower: exact.Willpower - 1 }))
        .attributes[0].conditionalApplied, false);
      const local = layout.boards.find(instance => instance.instanceId === id);
      const localAllocation = new Set([...allocated].filter(nodeId => nodeId.startsWith(`${id}:`))
        .map(nodeId => layout.nodes.get(nodeId).sourceIndex));
      const localResult = calculateParagonBonuses(local.board, local.database, localAllocation, exact, { placementIndex: placement });
      assert.equal(nodeAt(localResult, index).attributes[0].conditionalApplied, false);
    }
  }
});
