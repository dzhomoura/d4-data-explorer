# Barbarian_Rare_022 threshold investigation

## Scope and pinned source

All definitions below are from DiabloTools/d4data commit [`75e619f0d90a0951945747f45feef59c076a5db0`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0), matching the local Paladin board's verified source revision. The prior `200 + (130 * ParagonBoardEquipIndex)` StrengthMain1 formula came from the older `blizzhackers/d4data` snapshot; it does not match this pinned definition.

## VERIFIED — Node JSON

Source: [`json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json)

- `__snoID__`: `675448`; type: `ParagonNodeDefinition`; `eRarityOverride: 3`.
- `ptAttributes[0]`: `Damage_Percent_All_From_Skills` (`eAttribute: 252`, `nParam: -1`), with empty `szAttributeFormula.value`, `gbidFormula.name: ParagonNodeDamageBonus_RareMajor`, and `szFlatAttribLevelFormula.value: "0"`.
- `ptAttributes[1]`: `Hitpoints_Max_Percent_Bonus` (`eAttribute: 142`, `nParam: -1`), with empty `szAttributeFormula.value`, `gbidFormula.name: ParagonNodeHPMaxBonus_RareMinor`, and `szFlatAttribLevelFormula.value: "0"`.
- `ptBonusAttributeIndices` is `[0]`: the node explicitly marks attribute slot 0 as a bonus attribute. `arThresholdSelector` contains exactly one reference, `StrengthMain1` (SNO `1015345`).
- No separate per-attribute threshold field appears in either `AttributeSpecifier`. The explicit index list, rather than attribute order alone, identifies Damage from Skills as the threshold bonus. Maximum Life is slot 1 and is not in that list.

**Interpretation:** The data strongly indicates Damage from Skills is conditional on the selected threshold, while Maximum Life is the node's unconditional attribute. The JSON expresses this through `ptBonusAttributeIndices: [0]` alongside the sole `StrengthMain1` selector. It does not include runtime evaluator code or an explicit selector-to-index pair record, so this is a data-supported interpretation rather than a directly observed runtime execution.

As a same-revision cross-check, [`Generic_Rare_118.pgn.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json) also has `ptBonusAttributeIndices: [0]`, a single threshold selector, and its Damage-from-Skills attribute at slot 0. This supports the field's intended role but does not replace runtime validation.

## VERIFIED — StrengthMain1 threshold

Source: [`json/base/meta/ParagonThreshold/StrengthMain1.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthMain1.pth.json)

- `__snoID__`: `1015345`; type: `ParagonThresholdDefinition`.
- `ptThresholds` has one entry. Its `tThresholdAttribute` is `Strength_Total` (`eAttribute: 18`, `nParam: -1`).
- `tThresholdValueFormula.value` is `630 + (455 * ParagonBoardEquipIndex)`. It depends on `ParagonBoardEquipIndex`; for example, the expression evaluates to 630 at index 0 and 1085 at index 1.
- `compiled` contains a serialized formula representation, but the JSON does not define the runtime value of `ParagonBoardEquipIndex` for this node.
- `arUsableByClass` is `[0, 0, 1, 0, 0, 0, 1, 0]`. Its class-index mapping is not established by this investigation, so these flags do not independently prove whether the selector applies to a Paladin.

The threshold asset therefore verifies the attribute being tested and the index-dependent required value. Reading this as `Strength_Total >= 630 + (455 * ParagonBoardEquipIndex)` is the natural threshold interpretation, but the comparator and the assignment of the runtime board index are not explicitly encoded in this JSON.

## VERIFIED — GameBalance formulas and dependencies

Source: [`json/base/meta/GameBalance/AttributeFormulas.gam.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json), `__snoID__: 201912`. Formula entries are in `ptData[0].tEntries`; each relevant entry has one `arRanges` item covering `tValueRange` 0–99999.

| GBID formula | Stored expression | Result |
|---|---|---|
| `ParagonNodeDamageBonus_RareMajor` | `2 * ParagonPowerBudgetMultiplierNodeRareMajorOffensive()` | Coefficient `2` is present; final bonus unresolved because the multiplier function's value is not defined here. |
| `ParagonNodeHPMaxBonus_RareMinor` | `1 * ParagonPowerBudgetMultiplierNodeRareMinorDefensive()` | Coefficient `1` is present; final bonus unresolved because the multiplier function's value is not defined here. |

Both names match the `gbidFormula.name` references in `Barbarian_Rare_022`. The matching formula table has no entries whose `tHeader.szName` defines either `ParagonPowerBudgetMultiplier...` function. A targeted listing of the pinned `GameBalance` directory found no separately named `PowerBudget` asset. These data establish the dependency chain only as far as the function calls; they do not establish the functions' implementation, inputs, or numeric results. The formulas' `compiled` fields do not by themselves resolve those runtime function values.

Consequently, neither the Damage-from-Skills amount nor the Maximum-Life amount can be safely reported as a final numerical bonus from these extracted definitions alone. The node's `"0"` flat-attribute-level formulas and empty `szAttributeFormula` strings are not replacements for the unresolved GBID formulas.

## INFERRED — Runtime interpretation

- When the node is active and `Strength_Total` meets the `StrengthMain1` requirement, the explicitly marked slot 0 (Damage from Skills) is expected to activate.
- The unmarked Maximum-Life slot 1 is expected to apply without that threshold.
- Whether a particular threshold selector is selected or usable for a class, the precise comparison behavior, and the runtime `ParagonBoardEquipIndex` value require game/runtime evidence beyond these JSON definitions.

## UNRESOLVED — Calculator boundary

The files identify the candidate conditional attribute and provide the current threshold expression, but they do not define the threshold evaluator or the two power-budget functions. They also do not establish the class-index mapping or board index assigned at runtime. Therefore the extracted data is not sufficient to implement fully accurate rare-node activation or final numerical Damage/Maximum-Life values.

## Recommendation

The calculator can safely represent `StrengthMain1` as an unresolved, index-dependent condition and mark Damage from Skills as its likely conditional attribute using `ptBonusAttributeIndices: [0]`. Keep both RareMajor Damage and RareMinor Maximum Life amounts unresolved, and do not activate the damage bonus until the threshold selector's runtime semantics, class applicability, and `ParagonBoardEquipIndex` assignment are verified.
