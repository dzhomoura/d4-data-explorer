import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateParagonBonuses } from "../paragon-visual/paragon-calculator.js";
import { mergeSharedNodeDefinitions } from "../paragon-visual/shared-node-definitions.js";
import { normalizeLegendaryScenario } from "../paragon-visual/legendary-board-nodes.js";

const revision = "75e619f0d90a0951945747f45feef59c076a5db0";
const identities = [
  [2436511, 320, 2437020, 2488259, "Castle", "Castle", 1],
  [2436844, 198, 2438097, 2489348, "Shield Bearer", "Phalanx", 1],
  [2438913, 216, 2438099, 2490466, "Fervent", "Fervent", 2],
  [2438973, 325, 2438101, 2490759, "Preacher", "Fervent", 2],
  [2438992, 80, 2438120, 2493403, "Divinity", "Divinity", 1],
  [2439024, 136, 2438118, 2493521, "Relentless", "Relentless", 2],
  [2439031, 260, 2438124, 2493735, "Sentencing", "Sentencing", 1],
  [2439033, 374, 2438126, 2494628, "Endure", "Endure", 1],
  [2439035, 283, 2438128, 2494939, "Beacon", "Beacon", 1]
];
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const resources = await Promise.all(identities.map(async (_, offset) => {
  const suffix = String(offset + 1).padStart(2, "0");
  return {
    board: await read(`../paladin-board-${suffix}.json`),
    database: mergeSharedNodeDefinitions(await read(`../paragon-visual/node-data-${suffix}.json`))
  };
}));

function run(boardNumber, legendaryScenario, allocated = true) {
  const { board, database } = resources[boardNumber - 1];
  const index = identities[boardNumber - 1][1];
  return calculateParagonBonuses(board, database, new Set(allocated ? [index] : []), undefined,
    { boardEquipIndex: boardNumber, instanceId: "fixture", legendaryScenario });
}
const effects = (...args) => run(...args).legendaryNodeEffects;
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} ≠ ${expected}`);
const display = fraction => (fraction * 100).toFixed(1);

test("all nine pinned Legendary identities emit once per component and previews grant nothing", () => {
  const components = new Set();
  for (const [offset, identity] of identities.entries()) {
    const [board, index, node, power, name, label, count] = identity;
    for (const allocated of [false, true]) {
      const result = run(offset + 1, {}, allocated);
      assert.equal(result.legendaryNodeEffects.length, count);
      assert.equal(result.unresolvedBonusCount, 0);
      assert.deepEqual(result.effectiveNodeContributions, []);
      for (const effect of result.legendaryNodeEffects) {
        assert.deepEqual([effect.boardSnoId, effect.sourceIndex, effect.nodeSnoId, effect.powerSnoId, effect.nodeName,
          effect.passiveLabel], [board, index, node, power, name, label]);
        assert.equal(effect.sourceRevision, revision);
        assert.equal(effect.instanceId, "fixture");
        assert.equal(effect.grantStatus, allocated ? "granted" : "unallocated");
        assert.equal(effect.unit, "fraction");
        assert.equal(effect.runtimeStatus, "unresolved");
        assert.ok(effect.formula && effect.assumptions.length > 0);
        assert.equal(Object.hasOwn(effect, "destination") || Object.hasOwn(effect, "aggregationOperator"), false);
        if (!allocated) assert.equal(effect.currentMagnitude, null);
        else {
          assert.ok(!components.has(effect.componentId));
          components.add(effect.componentId);
        }
      }
    }
  }
  assert.equal(components.size, 12);
});

test("Castle uses resolved Armor DR, preserves the authored clamp and allows independent display rounding", () => {
  const bonus = armorDamageReduction => effects(1, { armorDamageReduction })[0];
  close(bonus(0.059).currentMagnitude, 0.07375);
  assert.equal(display(bonus(0.059).currentMagnitude), "7.4");
  close(bonus(0.307).currentMagnitude, 0.38375);
  // A hypothetical internal value reproduces both B displays. The internal value was never measured.
  assert.equal(display(0.3066), "30.7");
  assert.equal(display(bonus(0.3066).currentMagnitude), "38.3");
  close(bonus(0.90).currentMagnitude, 1.125);
  close(bonus(1.4).currentMagnitude, 1.50);
  assert.equal(bonus(1.4).authoredCap, 1.50);
  assert.equal(bonus(0).currentMagnitude, 0);
  assert.equal(effects(1)[0].magnitude, null);
  assert.equal(effects(1)[0].eligibilityStatus, "unknown");
});

test("Shield Bearer uses total Block Chance with a 100% input cap", () => {
  for (const [blockChance, expected] of [[0.2, 0.22], [0.246, 0.2706], [1, 1.10], [1.25, 1.10]]) {
    const [effect] = effects(2, { blockChance });
    assert.deepEqual(effect.requiredInputs, ["blockChance"]);
    close(effect.currentMagnitude, expected);
  }
  assert.equal(display(effects(2, { blockChance: 0.246 })[0].currentMagnitude), "27.1");
  assert.equal(effects(2, { blockChance: 0.246 }, false)[0].currentMagnitude, null);
});

test("Fervent keeps both linear components even beyond three stacks", () => {
  for (const [fervorStacks, damage, chance] of [[0, 0, 0], [1, 0.35, 0.03], [3, 1.05, 0.09], [4, 1.4, 0.12]]) {
    const [critDamage, critChance] = effects(3, { fervorStacks });
    close(critDamage.magnitude, damage);
    close(critChance.magnitude, chance);
    if (fervorStacks) close(critDamage.currentMagnitude, damage);
    else assert.equal(critDamage.currentMagnitude, null);
    assert.equal(critDamage.eligibilityStatus, fervorStacks ? "satisfied" : "not-satisfied");
    assert.deepEqual([critDamage.notation, critChance.notation], ["multiplicative", "additive"]);
    assert.deepEqual(critDamage.consumer.formulaIndices, [15, 16, 17]);
  }
  assert.equal(effects(3)[0].perStack, 0.35);
  assert.equal(effects(3)[0].magnitude, null);
});

test("Preacher's Zealot modifier stays separate from the resolved conversion input", () => {
  const [zealot, conversion] = effects(4, { bonusAttackSpeed: 0.50 });
  close(zealot.currentMagnitude, 0.15);
  close(conversion.currentMagnitude, 0.325);
  assert.equal(zealot.applicability.skillTag.gbid, 3900331213);
  assert.equal(conversion.notation, "unspecified");
  assert.equal(effects(4)[0].currentMagnitude, 0.15);
  assert.equal(effects(4)[1].currentMagnitude, null);
});

test("Divinity and Relentless use the node budget with independent predicates", () => {
  for (const inArbiter of [true, false]) for (const targetVulnerable of [true, false]) {
    const [divinity] = effects(5, { inArbiter, targetVulnerable });
    close(divinity.magnitude, 0.90);
    if (inArbiter && targetVulnerable) close(divinity.currentMagnitude, 0.90);
    else assert.equal(divinity.currentMagnitude, null);
    assert.equal(divinity.evidence, "tooltip-calibrated");
  }
  assert.equal(effects(5, { inArbiter: true })[0].eligibilityStatus, "unknown");
  assert.equal(effects(5, { inArbiter: false })[0].eligibilityStatus, "not-satisfied");
  for (const [input, expected] of [[{ moving: true }, "satisfied"], [{ moving: false, secondsSinceStopped: 1 }, "satisfied"],
    [{ moving: false, secondsSinceStopped: 2 }, "satisfied"], [{ moving: false, secondsSinceStopped: 2.001 }, "not-satisfied"],
    [{ moving: false }, "unknown"], [{}, "unknown"]]) {
    const [damage, cdr] = effects(6, input);
    assert.equal(damage.eligibilityStatus, expected);
    assert.equal(cdr.eligibilityStatus, expected);
    assert.equal(damage.gracePeriodSeconds, 2);
    close(damage.magnitude, 0.80);
    close(cdr.magnitude, 0.30);
    assert.equal(cdr.type, "cooldown-reduction");
    assert.equal(cdr.unit, "fraction");
  }
});

test("Sentencing, Endure and Beacon preserve target ownership, explicit state and occupancy", () => {
  for (const [input, expected] of [[{ targetJudgedByPlayer: true, targetAlive: true }, "satisfied"],
    [{ targetJudgedByPlayer: false, targetAlive: true }, "not-satisfied"],
    [{ targetJudgedByPlayer: true, targetAlive: false }, "not-satisfied"], [{ targetAlive: true }, "unknown"]]) {
    const [sentencing] = effects(7, input);
    assert.equal(sentencing.eligibilityStatus, expected);
    assert.equal(sentencing.magnitude, 0.90);
    assert.deepEqual([sentencing.trigger, sentencing.owner, sentencing.lifetime], ["judging", "applying-player", "until-target-death"]);
    assert.equal(sentencing.currentMagnitude, expected === "satisfied" ? 0.90 : null);
  }
  for (const [fortified, expected] of [[true, "satisfied"], [false, "not-satisfied"], [undefined, "unknown"]]) {
    const [endure] = effects(8, { fortified });
    assert.equal(endure.eligibilityStatus, expected);
    assert.equal(endure.currentMagnitude, fortified === true ? 0.90 : null);
  }
  for (const count of [0, 1, 3, 9]) {
    const [beacon] = effects(9, { qualifyingAuraOccupants: count });
    assert.equal(beacon.currentMagnitude, count ? 0.90 : null);
  }
  assert.equal(effects(9)[0].eligibilityStatus, "unknown");
});

test("scenario validation rejects bad units without coalescing known zero and false with unknown", () => {
  assert.deepEqual(normalizeLegendaryScenario({ fortified: false, targetAlive: null, blockChance: 0, moving: undefined }),
    { fortified: false, blockChance: 0 });
  for (const invalid of [null, [], { armor: 500 }, { blockChance: "20%" }, { fortified: 1 },
    { secondsSinceStopped: -1 }, { bonusAttackSpeed: Infinity }, { fervorStacks: 1.5 }, { qualifyingAuraOccupants: -1 }]) {
    assert.throws(() => normalizeLegendaryScenario(invalid), TypeError);
  }
  const { board, database } = resources[0];
  const swappedPower = { ...database, nodes: database.nodes.map(node => node.snoId === 2437020
    ? { ...node, passivePower: { ...node.passivePower, snoId: 1 } } : node) };
  const opts = { boardEquipIndex: 1, legendaryScenario: { armorDamageReduction: 0.90 } };
  const badSource = { ...database, source: { ...database.source, commit: "other-revision" } };
  for (const data of [swappedPower, badSource]) {
    const result = calculateParagonBonuses(board, data, new Set([320]), undefined, opts);
    assert.equal(result.legendaryNodeEffects, undefined);
    assert.equal(result.unresolvedBonusCount, 1);
  }
});
