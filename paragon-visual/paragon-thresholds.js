// Extracted from json/base/meta/ParagonThreshold at DiabloTools/d4data revision
// 75e619f0d90a0951945747f45feef59c076a5db0. Entries contain SNO, arUsableByClass[6], and formulas.
const SELECTORS = new Map([
  ["StrengthMain1", [1015345, true, [[18, "630 + (455 * ParagonBoardEquipIndex)"]]]],
  ["StrengthMain2", [1015344, true, [[18, "760 + (455 * ParagonBoardEquipIndex)"]]]],
  ["StrengthMain3", [1015346, true, [[18, "890 + (455 * ParagonBoardEquipIndex)"]]]],
  ["IntelligenceSide1", [1015350, true, [[19, "190 + (75 * ParagonBoardEquipIndex)"]]]],
  ["IntelligenceSide2", [1015351, true, [[19, "210 + (75 * ParagonBoardEquipIndex)"]]]],
  ["IntelligenceSide3", [1015352, true, [[19, "230 + (75 * ParagonBoardEquipIndex)"]]]],
  ["WillPowerSide1", [1015310, true, [[20, "190 + (75 * ParagonBoardEquipIndex)"]]]],
  ["WillPowerSide2", [1015277, true, [[20, "210 + (75 * ParagonBoardEquipIndex)"]]]],
  ["WillPowerSide3", [1015322, true, [[20, "230 + (75 * ParagonBoardEquipIndex)"]]]],
  ["Paladin_Strength+Willpower", [2504901, true, [
    [18, "700 + (455 * ParagonBoardEquipIndex)"],
    [20, "190 + (70 * ParagonBoardEquipIndex)"]
  ]]],
  ["Paladin_Strength+Intelligence", [2504903, true, [
    [18, "700 + (455 * ParagonBoardEquipIndex)"],
    [19, "190 + (70 * ParagonBoardEquipIndex)"]
  ]]],
  ["StrengthSide1", [1015341, false, [[18, "190 + (75 * ParagonBoardEquipIndex)"]]]],
  ["WillpowerMain1", [1068425, false, [[20, "630 + (455 * ParagonBoardEquipIndex)"]]]],
  ["Druid_Willpower+Dexterity", [1023894, false, [
    [20, "700 + (455 * ParagonBoardEquipIndex)"],
    [21, "190 + (70 * ParagonBoardEquipIndex)"]
  ]]]
]);

const TOTAL_ATTRIBUTES = Object.freeze({ 18: "Strength", 19: "Intelligence", 20: "Willpower", 21: "Dexterity" });
const PLACEMENT_EXPRESSION = /^(\d+) \+ \((\d+) \* ParagonBoardEquipIndex\)$/;
const PALADIN_SELECTOR_CHOICES = new Map([
  [675186, { name: "StrengthMain1", provenance: "direct-in-game" }], // Tenacity on Starting.
  [680037, { name: "WillPowerSide2", provenance: "direct-tooltip-supported" }] // Restorative.
]);

export function resolvePlacedRareThreshold(definition, placementIndex) {
  const eligible = new Map();
  for (const reference of definition.thresholdReferences) {
    const selector = SELECTORS.get(reference.name);
    const [snoId, usableByPaladin, entries] = selector ?? [];
    if (!selector || (reference.snoId !== undefined && reference.snoId !== snoId)
      || reference.target !== `base/meta/ParagonThreshold/${reference.name}.pth`) {
      return { reason: "Threshold reference does not match a supported pinned selector." };
    }
    if (usableByPaladin) eligible.set(reference.name, { snoId, entries });
  }
  const choice = PALADIN_SELECTOR_CHOICES.get(definition.snoId);
  const name = choice?.name ?? (eligible.size === 1 ? eligible.keys().next().value : null);
  const selected = eligible.get(name);
  if (!selected?.entries.length) {
    return { reason: "No unique supported Paladin threshold selector is available for this node." };
  }
  const requirements = [];
  for (const [requiredAttributeId, formula] of selected.entries) {
    const requiredAttribute = TOTAL_ATTRIBUTES[requiredAttributeId];
    const match = PLACEMENT_EXPRESSION.exec(formula);
    if (!match || !requiredAttribute) {
      return { reason: "Pinned threshold uses an unsupported attribute or placement expression." };
    }
    const requiredValue = Number(match[1]) + Number(match[2]) * placementIndex;
    if (!Number.isSafeInteger(requiredValue)) {
      return { reason: "Pinned threshold did not produce a valid integer requirement." };
    }
    requirements.push({ requiredAttribute, requiredAttributeId, requiredValue, formula });
  }
  return {
    name,
    selectorSnoId: selected.snoId,
    placementIndex,
    provenance: "formula-derived",
    ...(choice && { selectorProvenance: choice.provenance }),
    ...(requirements.length === 1 ? requirements[0] : { combination: "all", requirements })
  };
}
