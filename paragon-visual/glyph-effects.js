import { getPaladinGlyph, paladinGlyphCatalogue } from "./paladin-glyph-catalogue.js";
import { getGlyphProgression, LEGENDARY_GLYPH_LEVEL } from "./glyph-progression.js";
import { getGlyphRadiusMembership } from "./glyph-spatial.js";

const { affixes, powers, thresholds } = paladinGlyphCatalogue;
// Stage 6A tooltip calibration. The runtime intrinsic binding remains unresolved.
const T = 0.10;

const effect = (type, magnitude, unit, scope, details = {}) => ({ type, magnitude, unit, scope, ...details });
const damage = (magnitude, scope, details) => effect("damage-multiplier", magnitude, "fraction", scope, details);
const debuff = (magnitude, scope, trigger, increments, durationSeconds) =>
  effect("target-damage-amplification", magnitude, "fraction", scope,
    { trigger, cap: magnitude * increments, durationSeconds });

// Keyed by the pinned passive power SNO. Magnitudes follow the script and localization expressions.
const passives = {
  2478578: [damage(0.15, "Disciple skill damage", { predicate: "Vulnerable enemy" })],
  2478240: [damage(0.03, "damage", { predicate: "Arbiter form", per: "second in form", cap: 0.03 * 6 })],
  1029529: [debuff(0.1 * T, "Non-Physical damage from you to the affected enemy", "Non-Physical damage", 150 * T, 15)],
  2072755: [damage(0.18, "damage", { predicate: "Elite enemy" })],
  1029523: [debuff(0.1 * T, "all damage from you to the affected enemy", "Physical damage", 150 * T, 15)],
  1026863: [damage(T, "damage", {
    predicate: "Slowed or Chilled enemy",
    alternative: { magnitude: 2 * T, predicate: "Stunned or Frozen enemy" }
  })],
  1217020: [effect("damage-reduction", 1.5 * T, "fraction", "incoming Physical damage", { predicate: "Vulnerable attacker" })],
  1026847: [effect("apply-vulnerable", 30 * T, "seconds", "affected enemy",
    { trigger: "Damage dealt", cooldownSeconds: 5, cooldownScope: "per enemy" })],
  2478570: [damage(0.05, "damage", { per: "Fervor stack" })],
  2477895: [effect("resource-generation", 1, "Faith", "caster", { trigger: "Skill critically strikes" })],
  1026746: [
    damage(0.05, "damage", { per: "missing Healing Potion", cap: 0.20 }),
    effect("additive-modifier", 0.5 * T, "fraction", "Potion Healing", { per: "missing Healing Potion", cap: 0.20 })
  ],
  2478560: [damage(0.20, "Non-Physical damage", { predicate: "Elite enemy" })],
  2478227: [effect("target-damage-amplification", 0.15, "fraction", "damage from you to the affected enemy",
    { trigger: "Judging an enemy", durationSeconds: 5 })],
  1028530: [damage(2 * T, "Physical damage", { predicate: "Non-Elite or Boss enemy" })],
  2478547: [effect("cooldown-event", 2, "seconds", "each active non-Aura skill cooldown", { trigger: "Aura skill cast" })],
  2617848: [damage(0.10, "Retribution damage"), effect("additive-modifier", 0.50, "fraction", "Retribution size")],
  1027323: [debuff(0.1 * T, "all damage from you to the affected enemy", "Thorns damage", 15, 10)],
  2477887: [damage(0.015, "damage", { per: "Resolve stack", authoredStackLimit: 22 })],
  1028531: [debuff(0.3 * T, "damage from you to the affected enemy", "Critical Strike", 40 * T, 20)],
  1026839: [effect("damage-reduction", 1.5 * T, "fraction", "incoming damage", { predicate: "Close attacker" })],
  1027324: [effect("damage-reduction", null, "fraction", "incoming damage",
    { predicate: "Fortify", cap: 1.5 * T, scalingStatus: "unresolved" })]
};

const legendaryScopes = {
  "253:-1": "damage from skills",
  "255:0": "Physical damage",
  "255:1": "Fire damage",
  "255:6": "Holy damage",
  "257:-1": "Non-Physical damage",
  "289:-1": "Critical Strike Damage",
  "737:-1": "damage to Vulnerable enemies",
  "954:-1": "damage to Elites",
  "960:-1": "damage to Crowd Controlled enemies",
  "1106:-1": "damage to Close enemies",
  "1124:-1": "damage while Healthy"
};

export function evaluateAdditionalRequirements({ membership, instanceId, nodeEvaluations, affix, primary, validSource }) {
  const byIndex = new Map(nodeEvaluations.filter(node => node.instanceId === instanceId)
    .map(node => [node.nodeIndex, node]));
  const effectiveBases = new Map((primary?.kind === "amplification" ? primary.contributions ?? [] : [])
    .map(line => [`${line.sourceIndex}:${line.attributeIndex}`, line.effectiveBase]));
  const requirements = affix.thresholdSnoIds.flatMap(selectorSnoId => {
    const selector = thresholds[selectorSnoId];
    return selector.requirements.map(({ attribute, amount }) => {
      let native = 0;
      let effective = 0;
      let resolved = validSource && Number.isFinite(amount);
      for (const { sourceIndex } of membership?.nodes ?? []) {
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
      return { selectorSnoId, sourcePath: selector.sourcePath, attribute, required: amount, native, effective,
        resolved, satisfied: resolved ? effective >= amount : null };
    });
  });
  const resolved = requirements.length > 0 && requirements.every(requirement => requirement.resolved);
  return { affixSnoId: affix.snoId, requirements, resolved,
    satisfied: resolved ? requirements.every(requirement => requirement.satisfied) : null };
}

export function evaluateGlyphEffects(input, primary, configured = true) {
  const { board, instanceId, sourceRevision, configuration, nodeEvaluations } = input;
  const glyph = getPaladinGlyph(configuration?.snoId);
  const progression = getGlyphProgression(configuration?.level);
  if (!glyph || !progression) return null;

  const membership = getGlyphRadiusMembership(board, instanceId, progression.radius);
  const socketSourceIndex = membership?.socket.sourceIndex ?? null;
  const purchased = nodeEvaluations.some(node => node.instanceId === instanceId
    && node.nodeIndex === socketSourceIndex && node.allocated);
  const validSource = sourceRevision === paladinGlyphCatalogue.sourceRevision && Boolean(membership);
  const ownership = { instanceId, socketSourceIndex, glyphSnoId: glyph.snoId, glyphName: glyph.displayName,
    level: progression.level, sourceRevision, glyphSourcePath: glyph.sourcePath };

  const additional = affixes[glyph.bonuses.additional];
  const power = powers[additional.passivePowerSnoId];
  const effects = passives[power.snoId];
  const requirement = evaluateAdditionalRequirements({
    membership, instanceId, nodeEvaluations, affix: additional, primary,
    validSource: validSource && !(purchased && primary?.kind === "amplification" && primary.status === "unresolved")
  });
  const additionalStatus = !validSource || !effects ? "unresolved" : !purchased ? "unpurchased"
    : !requirement.resolved ? "unresolved" : !requirement.satisfied ? "unmet" : configured ? "granted" : "preview";
  const additionalEffect = {
    ...ownership, ...requirement, status: additionalStatus, purchased, configured,
    passivePowerSnoId: power.snoId, affixSourcePath: additional.sourcePath, powerSourcePath: power.sourcePath,
    tooltipSourcePath: additional.localization.sourcePath,
    evidence: "player-observed-tooltip", runtimeStatus: "unresolved",
    parameterEvidence: power.scriptFormulas.some(formula => formula.includes("ParagonPowerBudgetMultiplierGlyphThresholdBonusRare()"))
      ? "tooltip-calibrated-intrinsic" : "authored-literal",
    effects: structuredClone(effects ?? [])
  };

  const legendary = affixes[glyph.bonuses.legendary];
  const { startingScalar, addedScalarPerLevel } = legendary.scaling;
  const effectiveLevel = Math.max(LEGENDARY_GLYPH_LEVEL, progression.level);
  const fraction = startingScalar + addedScalarPerLevel * (effectiveLevel - 1);
  const validDestinations = legendary.bonusAttributes.length > 0
    && legendary.bonusAttributes.every(({ id, parameter }) => legendaryScopes[`${id}:${parameter}`]);
  const legendaryStatus = !validSource || !validDestinations || legendary.operation !== 4 || legendary.requiredRarity !== 2
    ? "unresolved" : progression.rarity !== "Legendary" ? "locked" : !purchased ? "unpurchased" : configured ? "applied" : "preview";
  const legendaryRecord = {
    ...ownership, affixSnoId: legendary.snoId, affixSourcePath: legendary.sourcePath,
    tooltipSourcePath: legendary.localization.sourcePath, requiredRarity: legendary.requiredRarity,
    effectiveLevel, startingScalar, addedScalarPerLevel, purchased, configured, status: legendaryStatus,
    evidence: "tooltip-supported-scaling", runtimeStatus: "unresolved"
  };
  const destinations = legendaryStatus === "unresolved" ? [] : legendary.bonusAttributes.map(destination => ({
    destination, aggregationOperator: 7, magnitude: fraction, fraction, unit: "fraction",
    scope: legendaryScopes[`${destination.id}:${destination.parameter}`]
  }));
  return {
    additionalEffect,
    legendaryPreview: legendaryStatus === "applied" ? null : { ...legendaryRecord, destinations },
    legendaryModifiers: legendaryStatus === "applied" ? destinations.map(destination => ({ ...legendaryRecord, ...destination })) : []
  };
}
