import { getPaladinGlyph, paladinGlyphCatalogue } from "./paladin-glyph-catalogue.js";
import { getGlyphProgression } from "./glyph-progression.js";
import { getGlyphRadiusMembership } from "./glyph-spatial.js";
import { PRIMARY_GLYPH_DESTINATIONS } from "./paragon-bonus-registry.js";

// Source-aligned calibration for 3.2.4.74043. The runtime intrinsic binding remains unresolved.
export const PRIMARY_GLYPH_BUDGET = 0.033;
const BUDGET_WEIGHTS = new Map([[379537727, 0.04], [379761887, 0.06]]);

export function evaluatePrimaryGlyph({ board, instanceId, sourceRevision, configuration, nodeEvaluations }) {
  const glyph = getPaladinGlyph(configuration?.snoId);
  const progression = getGlyphProgression(configuration?.level);
  const affix = paladinGlyphCatalogue.affixes[glyph?.bonuses.primary];
  if (!progression || affix?.operation !== 2) return null;

  const { level, radius } = progression;
  const membership = getGlyphRadiusMembership(board, instanceId, radius);
  const { startingScalar, addedScalarPerLevel, budgetFormulaGbid } = affix.scaling;
  const { source, destination } = affix.attributeMappings[0];
  const record = {
    instanceId, socketSourceIndex: membership?.socket.sourceIndex ?? null,
    glyphSnoId: glyph.snoId, glyphName: glyph.displayName, affixSnoId: affix.snoId, level, radius,
    source, destination, startingScalar, addedScalarPerLevel, budgetFormulaGbid,
    evidence: glyph.primaryEvidence
  };
  const weight = BUDGET_WEIGHTS.get(budgetFormulaGbid);
  const destinationRecord = PRIMARY_GLYPH_DESTINATIONS[`${destination.id}:${destination.parameter}`];
  if (sourceRevision !== paladinGlyphCatalogue.sourceRevision || !membership || !weight || !destinationRecord || source.parameter !== -1) {
    return { ...record, status: "unresolved", reason: "The board, source, budget or destination lacks a supported Primary glyph mapping." };
  }

  const [category, label] = destinationRecord;
  // 500 converts the budget-scaled coefficient from a fraction per point to percentage points per five.
  const normalization = 500 * weight * PRIMARY_GLYPH_BUDGET;
  const perFive = normalization * (startingScalar + addedScalarPerLevel * (level - 1));
  const byIndex = new Map(nodeEvaluations.filter(node =>
    node.nodeId === undefined || node.nodeId === `${instanceId}:${node.nodeIndex}`).map(node => [node.nodeIndex, node]));
  const socket = byIndex.get(membership.socket.sourceIndex);
  const contributions = [];
  for (const { sourceIndex, distance } of membership.nodes) {
    const node = byIndex.get(sourceIndex);
    if (!node?.allocated) continue;
    const matching = node.attributes.filter(attribute => attribute.attributeId === source.id
      && attribute.attributeName === source.name && attribute.category === "coreAttribute");
    if (matching.some(attribute => !Number.isFinite(attribute.unconditional))) {
      return { ...record, status: "unresolved", reason: "An allocated core attribute has no resolved unamplified value." };
    }
    const attributeValue = matching.reduce((sum, attribute) => sum + attribute.unconditional, 0);
    if (attributeValue) {
      const percentagePoints = attributeValue / 5 * perFive;
      contributions.push({
        instanceId, sourceIndex, nodeId: node.nodeId ?? sourceIndex, distance, attributeValue,
        percentagePoints, fraction: percentagePoints / 100
      });
    }
  }
  const localAttribute = contributions.reduce((sum, contribution) => sum + contribution.attributeValue, 0);
  const percentagePoints = contributions.reduce((sum, contribution) => sum + contribution.percentagePoints, 0);
  return {
    ...record, category, label, kind: "additive", normalization, perFive, localAttribute, contributions,
    status: socket?.allocated ? "active" : "unpurchased",
    percentagePoints, fraction: percentagePoints / 100
  };
}
