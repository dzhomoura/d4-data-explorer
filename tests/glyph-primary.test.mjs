import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePrimaryGlyph } from "../paragon-visual/glyph-primary.js";
import { formatGlyphPrimary } from "../paragon-visual/glyph-picker.js";
import { getPaladinGlyph, paladinGlyphCatalogue } from "../paragon-visual/paladin-glyph-catalogue.js";

const socketIndex = 40;
const sourceIndices = [39, 41, 31, 49];
const board = { nWidth: 9, arEntries: Array(81).fill(null) };
board.arEntries[socketIndex] = { __raw__: 681756, name: "Generic_Socket" };
for (const index of sourceIndices) board.arEntries[index] = { name: "Core node" };

function evaluate(snoId, level, pool) {
  const { source } = paladinGlyphCatalogue.affixes[getPaladinGlyph(snoId).bonuses.primary].attributeMappings[0];
  const nodeEvaluations = [{ nodeIndex: socketIndex, allocated: true, attributes: [] }];
  pool.forEach((value, index) => nodeEvaluations.push({
    nodeIndex: sourceIndices[index], allocated: true,
    attributes: [{ attributeId: source.id, attributeName: source.name, category: "coreAttribute", unconditional: value, conditional: 80 }]
  }));
  return evaluatePrimaryGlyph({
    board, instanceId: "fixture", sourceRevision: paladinGlyphCatalogue.sourceRevision,
    configuration: { snoId, level }, nodeEvaluations
  });
}

const observations = [
  [1029487, [[1, [5], "1.0"], [6, [5], "1.4"], [9, [5], "1.6"], [25, [7], "3.9"],
    [100, [5, 5, 7], "28.4"], [150, [5], "12.1"], [150, [7], "16.9"],
    [150, [5, 5], "24.1"], [150, [5, 5, 7], "41.0"]]],
  [2506847, [[100, [5], "5.6"], [100, [5, 5], "11.1"], [100, [5, 5, 5], "16.7"]]],
  [2506810, [[100, [5], "17"], [100, [5, 5], "33"], [100, [5, 5, 5], "50"]]]
];

test("calibration reproduces all fifteen original socket readings", () => {
  for (const [snoId, cases] of observations) {
    for (const [level, pool, expected] of cases) {
      const result = evaluate(snoId, level, pool);
      assert.equal(formatGlyphPrimary(result.percentagePoints, result.destination), `+${expected}%`);
      assert.equal(result.evidence, "calibrated-with-in-game-observations");
    }
  }
});

test("post-calibration Canny level 150 at 22 Intelligence displays 53.0%", () => {
  const result = evaluate(1029487, 150, [5, 5, 5, 7]);
  assert.equal(result.localAttribute, 22);
  assert.equal(formatGlyphPrimary(result.percentagePoints, result.destination), "+53.0%");
  assert.ok(Math.abs(result.percentagePoints - 53.0343) < 0.000003);
  assert.equal(result.kind, "additive");
  assert.equal(result.fraction, result.percentagePoints / 100);
});

test("per-five descriptions and individual Canny tooltip readings match observations", () => {
  for (const [snoId, level, expected] of [[1029487, 25, "2.8"], [1029487, 100, "8.3"],
    [1029487, 150, "12.1"], [2506847, 100, "5.6"], [2506810, 100, "16.7"]]) {
    assert.equal(evaluate(snoId, level, [5]).perFive.toFixed(1), expected);
  }
  for (const [level, points, expected] of [[25, 7, "+3.9%"], [150, 7, "+16.9%"], [150, 5, "+12.1%"]]) {
    const result = evaluate(1029487, level, [points]);
    assert.equal(formatGlyphPrimary(result.contributions[0].percentagePoints, result.destination), expected);
  }
  const result = evaluate(1029487, 150, [5, 5]);
  const expected = 0.99 * (1 + 0.07500000298023224 * 149);
  assert.equal(result.perFive, expected);
  assert.equal(result.contributions[0].percentagePoints, expected);
  assert.equal(result.percentagePoints, expected * 2);
  assert.equal(formatGlyphPrimary(result.percentagePoints, result.destination), "+24.1%");
});

test("all fifteen Primary glyphs preserve their authored selectors and typed destinations", () => {
  const cases = [
    [2478580, 9, 259, -387701], [2478242, 11, -2147483454, -1], [1029487, 10, 256, -1],
    [2506071, 11, 254, 0], [1029491, 10, 959, -1], [2506132, 10, 736, -1],
    [2478571, 11, 259, -394636083], [2477896, 10, 288, -1], [1071719, 11, 1123, -1],
    [2478561, 10, 259, -1250119683], [2478228, 9, 984, 2263340], [2477888, 9, 259, -1936853670],
    [2506810, 11, 288, -1], [2506847, 9, 1105, -1], [1027096, 11, 748, -1]
  ];
  for (const [snoId, source, destination, parameter] of cases) {
    const result = evaluate(snoId, 150, [7]);
    assert.deepEqual([result.source.id, result.destination.id, result.destination.parameter], [source, destination, parameter]);
    assert.equal(result.localAttribute, 7);
    assert.equal(result.normalization, source === 9 ? 0.66 : 0.99);
    assert.equal(result.budgetFormulaGbid, source === 9 ? 379537727 : 379761887);
    assert.equal(result.percentagePoints, result.perFive * 1.4);
  }
  assert.equal(cases.filter(([id]) => getPaladinGlyph(id).primaryEvidence === "source-derived-extrapolation").length, 12);
});
