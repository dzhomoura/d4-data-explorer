import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAmplificationGlyph } from "../paragon-visual/glyph-amplification.js";
import { evaluateGlyphEffects } from "../paragon-visual/glyph-effects.js";
import { evaluatePrimaryGlyph } from "../paragon-visual/glyph-primary.js";
import { paladinGlyphCatalogue } from "../paragon-visual/paladin-glyph-catalogue.js";

const revision = "75e619f0d90a0951945747f45feef59c076a5db0";
const board = { nWidth: 13, arEntries: Array.from({ length: 169 }, () => ({ name: "Node" })) };
const socket = 84;
board.arEntries[socket] = { __raw__: 681756, name: "Generic_Socket" };
const otherBoard = "other";
const instanceId = "fixture";
const purchase = (nodeIndex, attributes = [], { allocated = true, instance = instanceId, kind = "normal" } = {}) =>
  ({ instanceId: instance, nodeIndex, allocated, kind, attributes });
const core = (attributeId, unconditional) =>
  ({ attributeIndex: 0, attributeId, attributeParam: -1, unconditional, conditional: 1000 });
const run = (snoId, level, nodeEvaluations = [purchase(socket)], configured = true, sourceRevision = revision) => {
  const input = { board, instanceId, sourceRevision, configuration: { snoId, level }, nodeEvaluations };
  const primary = evaluateAmplificationGlyph(input) ?? evaluatePrimaryGlyph(input);
  return { primary, ...evaluateGlyphEffects(input, primary, configured) };
};

// Stage 6A in-game tooltip checkpoints. Primary values are coefficients; this table
// supplies no new measurements of effective node, socket, character or combat contributions.
const observations = [
  [2478580, 1, "1.0", "5.5", 1025642, 2478578, ["15%x"]],
  [2478242, 1, "1.5", "6.6", 1025646, 2478240, ["3%x", "18% cap"]],
  [1029487, 1, "1.0", "5.5", 1025647, 1029529, ["1%x", "15% cap", "15s duration"]],
  [2073373, 31, "44.3", "8.6", 1025642, 2072755, ["18%x"]],
  [2506071, 140, "11.3", "14.4", 1025646, 1029523, ["1%x", "15% cap", "15s duration"]],
  [1029491, 1, "1.5", "8.6", 1025647, 1026863, ["10%x", "20%x alternative"]],
  [2479306, 1, "25.0", "5.5", 1025642, 1217020, ["15% DR"]],
  [2506132, 1, "1.0", "5.5", 1025647, 1026847, ["3s", "5s cooldown"]],
  [2478571, 1, "1.5", "5.5", 1025646, 2478570, ["5%x"]],
  [2477896, 139, "22.0", "18.7", 1025647, 2477895, ["1 Faith"]],
  [1071719, 1, "1.3", "6.6", 1025646, 1026746, ["5%x", "20% cap", "5%+", "20% cap"]],
  [2478561, 1, "1.5", "5.5", 1025647, 2478560, ["20%x"]],
  [2478228, 1, "1.0", "5.5", 1025642, 2478227, ["15%x", "5s duration"]],
  [2506253, 142, "377.5", "17.0", 1025642, 1028530, ["20%x"]],
  [2478548, 24, "99.0", "5.5", 1025642, 2478547, ["2s"]],
  [2617836, 1, "20.0", "5.5", 1025642, 2617848, ["10%x", "50%+"]],
  [2120405, 1, "20.0", "5.5", 1025647, 1027323, ["1%x", "15% cap", "10s duration"]],
  [2477888, 140, "14.8", "16.8", 1025642, 2477887, ["1.5%x"]],
  [2506810, 143, "23.1", "19.2", 1025646, 1028531, ["3%x", "12% cap", "20s duration"]],
  [2506847, 1, "0.7", "6.6", 1025642, 1026839, ["15% DR"]],
  [1027096, 1, "1.0", "5.5", 1025646, 1027324, ["15% cap"]]
];

function readParameters(effects) {
  const percent = value => Number((100 * value).toFixed(6));
  return effects.flatMap(({ type, magnitude, unit, cap, alternative, durationSeconds, cooldownSeconds }) => [
    ...(magnitude === null ? [] : [unit === "fraction"
      ? percent(magnitude) + ({ "additive-modifier": "%+", "damage-reduction": "% DR" }[type] ?? "%x")
      : unit === "Faith" ? `${magnitude} Faith` : `${magnitude}s`]),
    ...(cap === undefined ? [] : [`${percent(cap)}% cap`]),
    ...(alternative ? [`${percent(alternative.magnitude)}%x alternative`] : []),
    ...(durationSeconds === undefined ? [] : [`${durationSeconds}s duration`]),
    ...(cooldownSeconds === undefined ? [] : [`${cooldownSeconds}s cooldown`])
  ]);
}

test("all 21 Stage 6A tooltip fixtures exercise pinned Primary, Additional and Legendary values", () => {
  assert.equal(paladinGlyphCatalogue.sourceRevision, revision);
  assert.deepEqual(new Set(observations.map(([snoId]) => snoId)), new Set(paladinGlyphCatalogue.glyphs.map(glyph => glyph.snoId)));
  const affixIds = new Set();
  const families = new Set();
  let calibrated = 0;
  for (const [snoId, level, primaryDisplay, legendaryDisplay, selector, power, parameters] of observations) {
    const { primary, additionalEffect, legendaryPreview, legendaryModifiers } = run(snoId, level);
    assert.equal((primary.perFive ?? primary.percentagePoints).toFixed(1), primaryDisplay, primary.glyphName);
    assert.deepEqual(readParameters(additionalEffect.effects), parameters, primary.glyphName);
    assert.equal(additionalEffect.passivePowerSnoId, power);
    assert.equal(additionalEffect.requirements[0].selectorSnoId, selector);
    assert.equal(additionalEffect.runtimeStatus, "unresolved");
    assert.equal(additionalEffect.status, "unmet");
    if (additionalEffect.parameterEvidence === "tooltip-calibrated-intrinsic") calibrated++;
    const destinations = legendaryPreview?.destinations ?? legendaryModifiers;
    const record = legendaryPreview ?? legendaryModifiers[0];
    assert.ok(destinations.length > 0);
    for (const modifier of destinations) {
      assert.equal((100 * modifier.fraction).toFixed(1), legendaryDisplay, primary.glyphName);
      assert.equal(modifier.aggregationOperator, 7);
    }
    assert.equal(record.status, level < 51 ? "locked" : "applied");
    assert.equal(record.effectiveLevel, Math.max(51, level));
    assert.equal(legendaryModifiers.length > 0, level >= 51);
    assert.equal(record.sourceRevision, revision);
    affixIds.add(record.affixSnoId);
    families.add(`${record.startingScalar}/${record.addedScalarPerLevel}`);
  }
  assert.equal(calibrated, 11);
  assert.equal(affixIds.size, 10);
  assert.equal(families.size, 3);
});

test("all three selectors compare full-precision local base attributes at the exact boundary", () => {
  for (const [snoId, id, required] of [[2478580, 9, 40], [1029487, 10, 25], [2478242, 11, 25]]) {
    for (const value of [required - 0.0000001, required, required + 0.0000001]) {
      const nodes = [
        purchase(socket, [core(id, 1000)]),
        purchase(83, [core(id, value)]),
        purchase(85, [core(id, 1000)], { instance: otherBoard }),
        purchase(85, [core(id, 1000)], { allocated: false }),
        purchase(78, [core(id, 1000)]),
        purchase(97, [{ ...core(id, 1000), attributeParam: 2 }])
      ];
      const { additionalEffect } = run(snoId, 50, nodes);
      const [requirement] = additionalEffect.requirements;
      assert.deepEqual([requirement.native, requirement.effective, requirement.required, requirement.satisfied],
        [value, value, required, value >= required]);
      assert.equal(additionalEffect.status, value >= required ? "granted" : "unmet");
    }
  }
});

test("Additional reads only eligible unconditional lines across radius, amplification and resolution changes", () => {
  const nodes = [
    purchase(socket),
    purchase(83, [core(9, 20)]),
    purchase(85, [core(9, 10)], { kind: "rare" }),
    purchase(80, [core(9, 6)]),
    purchase(79, [core(9, 9)])
  ];
  for (const [level, native, amplifiedCore] of [[24, 30, 20], [25, 36, 26], [50, 36, 26], [51, 45, 35]]) {
    const { primary, additionalEffect } = run(2073373, level, nodes);
    const [requirement] = additionalEffect.requirements;
    assert.equal(requirement.native, native);
    assert.ok(Math.abs(requirement.effective - (native + amplifiedCore * primary.fraction)) < 1e-12);
  }
  const unresolved = run(2073373, 51, [...nodes, purchase(97, [core(9, null)])]);
  assert.equal(unresolved.additionalEffect.status, "unresolved");
  assert.equal(unresolved.additionalEffect.satisfied, null);
  assert.equal(unresolved.legendaryModifiers[0].status, "applied");
  const withoutSocket = run(2073373, 51, [purchase(socket, [], { instance: otherBoard }), ...nodes.slice(1)]);
  assert.equal(withoutSocket.additionalEffect.status, "unpurchased");
  assert.equal(withoutSocket.additionalEffect.requirements[0].effective, 45);
  assert.equal(withoutSocket.legendaryPreview.status, "unpurchased");
  assert.deepEqual(withoutSocket.legendaryModifiers, []);
  const unsaved = run(2073373, 51, nodes, false);
  assert.equal(unsaved.additionalEffect.status, "preview");
  assert.equal(unsaved.legendaryPreview.status, "preview");
  assert.deepEqual(unsaved.legendaryModifiers, []);
  const unpinned = run(2073373, 51, nodes, true, "other-revision");
  assert.equal(unpinned.additionalEffect.status, "unresolved");
  assert.equal(unpinned.legendaryPreview.status, "unresolved");
  assert.deepEqual(unpinned.legendaryModifiers, []);
});

test("Legendary gating preserves exact fractions and independent authored destinations", () => {
  const rare = run(2478561, 50);
  const promoted = run(2478561, 51);
  assert.equal(rare.legendaryPreview.status, "locked");
  assert.deepEqual(rare.legendaryModifiers, []);
  assert.equal(promoted.additionalEffect.status, "unmet");
  assert.equal(promoted.legendaryPreview, null);
  assert.deepEqual(promoted.legendaryModifiers.map(line => [line.destination.id, line.destination.parameter]), [[255, 6], [255, 1]]);
  assert.deepEqual(promoted.legendaryModifiers.map(line => line.fraction), rare.legendaryPreview.destinations.map(line => line.fraction));
  const max = run(2478228, 150).legendaryModifiers[0];
  assert.equal(max.fraction, 0.004999999888241291 + 149 * 0.0010000000474974513);
  assert.deepEqual([max.destination.id, max.destination.parameter, max.aggregationOperator, max.scope], [253, -1, 7, "damage from skills"]);
  const challenger = run(2073373, 51, [purchase(socket), purchase(83, [core(9, 40)])]);
  assert.equal(challenger.additionalEffect.status, "granted");
  assert.equal(challenger.additionalEffect.effects[0].magnitude, 0.18);
  assert.equal(challenger.legendaryModifiers[0].destination.id, 954);
  assert.notEqual(challenger.legendaryModifiers[0].affixSnoId, challenger.additionalEffect.affixSnoId);
  assert.ok(!("destination" in challenger.additionalEffect.effects[0]));
  assert.ok(!("aggregationOperator" in challenger.additionalEffect.effects[0]));
});

test("passive effect types keep trigger, condition, scope, unit and unresolved cap semantics", () => {
  const effects = snoId => run(snoId, 51).additionalEffect.effects;
  const [canny] = effects(1029487), [chip] = effects(2506071);
  assert.deepEqual([canny.trigger, canny.scope], ["Non-Physical damage", "Non-Physical damage from you to the affected enemy"]);
  assert.deepEqual([chip.trigger, chip.scope], ["Physical damage", "all damage from you to the affected enemy"]);
  const [control] = effects(1029491);
  assert.equal(control.alternative.predicate, "Stunned or Frozen enemy");
  assert.equal(control.predicate, "Slowed or Chilled enemy");
  assert.deepEqual(effects(2477896).map(effect => [effect.type, effect.unit]), [["resource-generation", "Faith"]]);
  assert.deepEqual(effects(2478548).map(effect => [effect.type, effect.unit]), [["cooldown-event", "seconds"]]);
  assert.deepEqual(effects(2617836).map(effect => [effect.type, effect.scope]),
    [["damage-multiplier", "Retribution damage"], ["additive-modifier", "Retribution size"]]);
  assert.deepEqual(effects(1071719).map(effect => [effect.type, effect.scope]),
    [["damage-multiplier", "damage"], ["additive-modifier", "Potion Healing"]]);
  assert.equal(effects(2506132)[0].cooldownScope, "per enemy");
  assert.equal(effects(1027096)[0].scalingStatus, "unresolved");
  assert.equal(effects(2477888)[0].authoredStackLimit, 22);
  assert.equal(effects(2477888)[0].cap, undefined);
});
