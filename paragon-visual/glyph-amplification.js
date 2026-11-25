import { getPaladinGlyph, paladinGlyphCatalogue } from "./paladin-glyph-catalogue.js";
import { getGlyphProgression } from "./glyph-progression.js";
import { getGlyphRadiusMembership } from "./glyph-spatial.js";

// ParagonGlyphAdditive_Rare_BonusToNodes in the pinned AttributeFormulas table.
export const AMPLIFICATION_BUDGET_GBID = 2549607169;
export const AMPLIFICATION_BUDGET = 0.001;
const TARGET_KINDS = { 1: "normal", 2: "magic", 3: "rare" };

export function evaluateAmplificationGlyph({ board, instanceId, sourceRevision, configuration, nodeEvaluations }) {
  const glyph = getPaladinGlyph(configuration?.snoId);
  const progression = getGlyphProgression(configuration?.level);
  const affix = paladinGlyphCatalogue.affixes[glyph?.bonuses.primary];
  if (!progression || affix?.operation !== 1) return null;

  const { level, radius } = progression;
  const { startingScalar, addedScalarPerLevel, budgetFormulaGbid } = affix.scaling;
  const membership = getGlyphRadiusMembership(board, instanceId, radius);
  const targetKind = TARGET_KINDS[affix.affectedNodeRarity];
  const record = {
    kind: "amplification", instanceId, socketSourceIndex: membership?.socket.sourceIndex ?? null,
    glyphSnoId: glyph.snoId, glyphName: glyph.displayName, affixSnoId: affix.snoId, level, radius,
    targetKind, startingScalar, addedScalarPerLevel, budgetFormulaGbid, evidence: glyph.primaryEvidence
  };
  if (sourceRevision !== paladinGlyphCatalogue.sourceRevision || !membership || !targetKind
    || budgetFormulaGbid !== AMPLIFICATION_BUDGET_GBID || affix.affectedNodeAttributes.length) {
    return { ...record, status: "unresolved", reason: "The source, target, filter or budget lacks a supported amplification mapping." };
  }

  const scalar = startingScalar + addedScalarPerLevel * (level - 1);
  const fraction = AMPLIFICATION_BUDGET * scalar;
  const byIndex = new Map(nodeEvaluations.filter(node => node.instanceId === instanceId)
    .map(node => [node.nodeIndex, node]));
  const socket = byIndex.get(membership.socket.sourceIndex);
  const eligibleNodes = [];
  if (socket?.allocated) {
    for (const { sourceIndex, distance } of membership.nodes) {
      const node = byIndex.get(sourceIndex);
      if (node?.allocated && node.kind === targetKind) eligibleNodes.push({ node, sourceIndex, distance });
    }
  }
  const contributions = [];
  const unresolvedLines = [];
  const deltasByAttribute = new Map();
  for (const { node, sourceIndex, distance } of eligibleNodes) {
    for (const attribute of node.attributes) {
      const { attributeIndex, attributeId, attributeParam, attributeName, category, units, aggregationOperator, unconditional } = attribute;
      const identity = { instanceId, sourceIndex, nodeId: node.nodeId ?? sourceIndex, distance,
        attributeIndex, attributeId, attributeParam, attributeName, category, units, aggregationOperator };
      if (!Number.isFinite(unconditional)) {
        unresolvedLines.push(identity);
        continue;
      }
      const baseAmplificationDelta = unconditional * fraction;
      contributions.push({ ...identity, nativeBase: unconditional, baseAmplificationDelta,
        effectiveBase: unconditional + baseAmplificationDelta });
      const key = `${attributeId}:${attributeParam}`;
      const aggregate = deltasByAttribute.get(key) ?? { attributeId, attributeParam, attributeName, category, units, aggregationOperator, delta: 0 };
      aggregate.delta += baseAmplificationDelta;
      deltasByAttribute.set(key, aggregate);
    }
  }

  return {
    ...record, status: socket?.allocated ? "active" : "unpurchased",
    scalar, fraction, percentagePoints: fraction * 100, contributions, unresolvedLines,
    affectedNodeIndices: eligibleNodes.map(({ sourceIndex }) => sourceIndex),
    conditionalAmplificationPending: eligibleNodes.some(({ node }) => node.ptBonusAttributeIndices?.length > 0),
    deltasByAttribute: [...deltasByAttribute.values()]
  };
}

export function evaluateAmplificationAdditional(primary, board, nodeEvaluations) {
  if (primary?.status !== "active") return null;
  const affix = paladinGlyphCatalogue.affixes[getPaladinGlyph(primary.glyphSnoId).bonuses.additional];
  const requirements = affix.thresholdSnoIds.flatMap(id => paladinGlyphCatalogue.thresholds[id].requirements);
  if (!requirements.length) return null;

  const membership = getGlyphRadiusMembership(board, primary.instanceId, primary.radius);
  const byIndex = new Map(nodeEvaluations.filter(node => node.instanceId === primary.instanceId)
    .map(node => [node.nodeIndex, node]));
  const effectiveBases = new Map(primary.contributions.map(line => [`${line.sourceIndex}:${line.attributeIndex}`, line.effectiveBase]));
  const evaluated = requirements.map(({ attribute, amount }) => {
    let native = 0;
    let effective = 0;
    let resolved = Number.isFinite(amount);
    for (const { sourceIndex } of membership.nodes) {
      const node = byIndex.get(sourceIndex);
      if (!node?.allocated) continue;
      for (const line of node.attributes) {
        if (line.attributeId !== attribute.id || line.attributeParam !== attribute.parameter) continue;
        if (!Number.isFinite(line.unconditional)) {
          resolved = false;
          continue;
        }
        native += line.unconditional;
        effective += effectiveBases.get(`${sourceIndex}:${line.attributeIndex}`) ?? line.unconditional;
      }
    }
    return { attribute, required: amount, native, effective, resolved, satisfied: resolved ? effective >= amount : null };
  });
  const resolved = evaluated.every(requirement => requirement.resolved);
  return { affixSnoId: affix.snoId, requirements: evaluated, resolved,
    satisfied: resolved ? evaluated.every(requirement => requirement.satisfied) : null };
}
