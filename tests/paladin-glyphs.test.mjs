import assert from "node:assert/strict";
import test from "node:test";
import {
  getPaladinGlyph, GLYPH_LEVEL_INPUT, isGlyphConfiguration, paladinGlyphCatalogue
} from "../paragon-visual/paladin-glyph-catalogue.js";
import { getGlyphProgression } from "../paragon-visual/glyph-progression.js";
import { getGlyphRadiusMembership, manhattanDistance } from "../paragon-visual/glyph-spatial.js";

test("the pinned catalogue has each of the 21 eligible identities and class masks", () => {
  const { glyphs, sourceRevision, classMaskOrder } = paladinGlyphCatalogue;
  assert.equal(sourceRevision, "75e619f0d90a0951945747f45feef59c076a5db0");
  assert.deepEqual(glyphs.map(({ snoId, displayName }) => [snoId, displayName]), [
    [2478580, "Apostle"], [2478242, "Arbiter"], [1029487, "Canny"], [2073373, "Challenger"],
    [2506071, "Chip"], [1029491, "Control"], [2479306, "Diminish"], [2506132, "Exploit"],
    [2478571, "Feverous"], [2477896, "Honed"], [1071719, "Imbiber"], [2478561, "Judicator"],
    [2478228, "Law"], [2506253, "Outmatch"], [2478548, "Resplendence"], [2617836, "Retribution"],
    [2120405, "Revenge"], [2477888, "Sentinel"], [2506810, "Spirit"], [2506847, "Turf"], [1027096, "Undaunted"]
  ]);
  const sharedMasks = {
    Canny: "00010110", Challenger: "00100010", Control: "00010010", Imbiber: "10101010",
    Revenge: "00000110", Undaunted: "00101010"
  };
  assert.deepEqual(classMaskOrder, ["Sorcerer", "Druid", "Barbarian", "Rogue", "Necromancer", "Spiritborn", "Paladin", "Warlock"]);
  assert.equal(new Set(glyphs.map(glyph => glyph.internalName)).size, 21);
  for (const glyph of glyphs) {
    const { classMask, classes } = glyph.eligibility;
    assert.equal(classMask.join(""), sharedMasks[glyph.displayName] ?? "00000010");
    assert.deepEqual(classes, classMaskOrder.filter((_, index) => classMask[index]));
    assert.equal(glyph.group, 111);
    assert.equal(glyph.rarity, 1);
    assert.equal(glyph.iconHandles.length, 3);
    assert.equal(glyph.iconHandles[0], 0);
    assert.ok(glyph.iconHandles[1] && glyph.iconHandles[2]);
    assert.equal(getPaladinGlyph(glyph.snoId), glyph);
  }
  assert.deepEqual(glyphs.filter(glyph => glyph.starter).map(glyph => glyph.displayName), ["Challenger"]);
  assert.equal(getPaladinGlyph(2479231), undefined);
});

test("all authored bonus and formula references resolve without calculating glyph effects", () => {
  const { glyphs, affixes, thresholds, powers, budgetFormulas, recipes } = paladinGlyphCatalogue;
  assert.deepEqual([affixes, thresholds, powers, budgetFormulas, recipes].map(data => Object.keys(data).length), [50, 3, 21, 3, 4]);
  for (const glyph of glyphs) {
    const { primary, additional, legendary } = glyph.bonuses;
    assert.ok([1, 2].includes(affixes[primary].operation));
    assert.ok(budgetFormulas[affixes[primary].scaling.budgetFormulaGbid].ranges[0].expression);
    assert.equal(affixes[additional].operation, 5);
    assert.equal(affixes[additional].thresholdSnoIds.length, 1);
    assert.ok(thresholds[affixes[additional].thresholdSnoIds[0]].requirements[0].amount);
    assert.ok(powers[affixes[additional].passivePowerSnoId].scriptFormulas.length);
    assert.equal(affixes[legendary].operation, 4);
    assert.equal(affixes[legendary].requiredRarity, 2);
    assert.ok(affixes[legendary].bonusAttributes.length);
    for (const id of Object.values(glyph.bonuses)) {
      assert.ok(affixes[id].localization.text);
      assert.ok(affixes[id].description);
    }
    assert.equal(recipes[glyph.upgradeRecipeSnoId].ingredients[0].quantity, 15000);
  }
  const bonus = (id, role) => affixes[getPaladinGlyph(id).bonuses[role]];
  assert.equal(bonus(2477896, "primary").attributeMappings[0].source.id, 10);
  assert.equal(bonus(2478571, "primary").attributeMappings[0].source.id, 11);
  assert.equal(recipes[getPaladinGlyph(2506071).upgradeRecipeSnoId].ingredients[0].item.snoId, 1623153);
  assert.deepEqual(bonus(2478561, "legendary").bonusAttributes.map(attribute => attribute.parameter), [6, 1]);
});

test("planner levels accept only whole numbers within the sourced planning range", () => {
  const { min, max } = GLYPH_LEVEL_INPUT;
  assert.deepEqual([min, max], [1, 150]);
  const snoId = 2073373;
  for (const level of [min, 25, 50, 51, max]) assert.ok(isGlyphConfiguration({ snoId, level }));
  for (const level of [0, 151, -1, 2.5, "25", "", NaN, Infinity, undefined]) {
    assert.equal(isGlyphConfiguration({ snoId, level }), false);
    assert.equal(getGlyphProgression(level), null);
  }
});

test("every valid level derives radius, rarity, next expansion and maximum status", () => {
  for (const [first, last, radius, rarity, nextRadiusLevel] of [
    [1, 24, 3, "Rare", 25], [25, 50, 4, "Rare", 51], [51, 150, 5, "Legendary", null]
  ]) {
    for (let level = first; level <= last; level++) {
      assert.deepEqual(getGlyphProgression(level), { level, radius, rarity, nextRadiusLevel, atMaxLevel: level === 150 });
    }
  }
});

test("Manhattan diamonds include exact boundaries and omit the origin and unoccupied cells from the node list", () => {
  const width = 13;
  const index = (x, y) => (6 + y) * width + 6 + x;
  const board = { nWidth: width, arEntries: Array(width * width).fill({ name: "Node" }) };
  board.arEntries[index(0, 0)] = { __raw__: 681756, name: "Generic_Socket" };
  assert.equal(manhattanDistance({ x: 3, y: 4 }, { x: 1, y: 1 }), 5);
  for (const [radius, size] of [[3, 25], [4, 41], [5, 61]]) {
    const { socket, nodes } = getGlyphRadiusMembership(board, "first", radius);
    assert.deepEqual(socket, { instanceId: "first", sourceIndex: index(0, 0), x: 6, y: 6 });
    const members = new Set(nodes.map(node => node.sourceIndex));
    assert.equal(members.size + 1, size);
    for (const [x, y] of [[radius, 0], [0, -radius], [2, radius - 2], [-1, 1]]) assert.ok(members.has(index(x, y)));
    for (const [x, y] of [[0, 0], [radius + 1, 0], [2, radius - 1], [radius, radius]]) assert.ok(!members.has(index(x, y)));
  }
  board.arEntries[index(1, 0)] = null;
  const { nodes } = getGlyphRadiusMembership(board, "second", 3);
  assert.equal(nodes.length, 23);
  assert.ok(nodes.every(node => node.instanceId === "second"));
  assert.ok(nodes.some(node => node.sourceIndex === index(2, 0) && node.distance === 2));
});
