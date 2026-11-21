# Castle board numerical bonuses

## Scope and evidence model

This report covers Magic and Rare nodes on `Paragon_Paladin_01` (Castle, board SNO `2436511`) at DiabloTools/d4data revision `75e619f0d90a0951945747f45feef59c076a5db0`.

The implementation distinguishes three evidence levels:

- **Direct in-game:** the identical node SNO was already observed on Board 00.
- **Formula-derived:** the pinned `AttributeFormulas.gam.json` coefficient is evaluated with a shared multiplier calibrated from multiple direct Board 00 observations in this same revision. This is evidence-supported but is not a direct Castle tooltip observation.
- **Unresolved:** either the relevant shared multiplier or the runtime threshold input/semantics is not established.

The calibrated results are internally cross-checked rather than inferred from one formula: Magic Offensive `2.5` reproduces observed Magic Damage `2 × 2.5 = 5` and Damage to Elites `3 × 2.5 = 7.5`; Magic Defensive `2` reproduces Maximum Life `1 × 2 = 2` and Armor `0.75 × 2 = 1.5`; Rare Major Offensive `5` reproduces observed `2 × 5 = 10` and `3 × 5 = 15`; Rare Major Defensive `4` reproduces Tenacity's observed `1 × 4 = 4`; Rare Minor Defensive `4` reproduces Brawn's observed `1 × 4 = 4` and Tenacity's `0.5 × 4 = 2`. Rare Minor Offensive has no matching direct observation and remains unresolved.

## Magic nodes

| Definition / SNO | Attribute and pinned formula | Result | Confidence |
|---|---|---:|---|
| `Generic_Magic_Armor` / `671247` | Total Armor; `0.75 × MagicDefensive` | +1.5% | Direct in-game; identical Board 00 SNO |
| `Generic_Magic_ArmorPercent` / `2127186` | Total Armor; `0.75 × MagicDefensive` | +1.5% | Formula-derived |
| `Generic_Magic_BlockChance` / `2063114` | Block Chance; `1 × MagicDefensive` | +2% | Formula-derived |
| `Generic_Magic_DamagePhysical` / `678822` | Physical Damage; `2 × MagicOffensive` | +5% | Formula-derived |
| `Generic_Magic_DamageToCC` / `678792` | Damage to Crowd Controlled; `3.5 × MagicOffensive` | +8.75% | Formula-derived |
| `Generic_Magic_HPPercent` / `679184` | Maximum Life; `1 × MagicDefensive` | +2% | Direct in-game; identical Board 00 SNO |
| `Generic_Magic_ResistanceAll` / `678750` | Resistance to All Elements; `1.5 / 2 × MagicDefensive` | +1.5% | Formula-derived |
| `Generic_Magic_Str`, `_Int`, `_Will` | Core attribute; pinned constant `7` | +7 | Verified pinned formula; previously implemented |

No Castle Magic definition remains numerically unresolved under this calibrated same-revision model. Physical Damage remains a separate total and is not merged into generic Damage.

## Rare nodes

The Castle names below are the localized names already resolved in `node-data-01.json`. A marked attribute is the slot listed in `ptBonusAttributeIndices`; the existing directly observed rare-node pattern adds a second copy of that attribute when its threshold is active. The amount is recorded, but Castle activation is not performed while the runtime threshold is unresolved.

| Name / definition / SNO | Base bonuses | Additional marked bonus | Confidence |
|---|---|---|---|
| Defiance / `Paladin_Rare_005` / `2449713` | +3% Total Armor; +3% All Resistance | +3% Total Armor | Formula-derived; activation unresolved |
| Grappler / `Paladin_Rare_006` / `2449715` | +10% Physical Damage; Damage to Crowd Controlled unresolved | +10% Physical Damage | Physical formula-derived; Rare Minor Offensive attribute unresolved; activation unresolved |
| Ironclad / `Paladin_Rare_007` / `2449717` | +10 Strength; +2% Total Armor | +2% Total Armor | Pinned constant/formula-derived; activation unresolved |
| Stalwart / `Paladin_Rare_008` / `2449719` | Block Chance unresolved; +15% Block Damage Bonus | Block Chance amount unresolved | Rare Minor Offensive attribute unresolved; block-damage value formula-derived |
| Insulate / `Paladin_Rare_009` / `2449721` | +10% Damage to Crowd Controlled; +3% All Resistance | +10% Damage to Crowd Controlled | Formula-derived; activation unresolved |
| Knight / `Paladin_Rare_010` / `2449723` | +10% Physical Damage; +10 Strength | +10% Physical Damage | Pinned constant/formula-derived; activation unresolved |

`ParagonNodeCoreStat_RareMajor` and `ParagonNodeCoreStat_RareMinor` are both the pinned constant `10`. Knight's Rare Minor Strength also matches the already observed +10 result for two Board 00 definitions using that formula.

## Paladin selectors and unresolved runtime thresholds

Each Castle rare definition has one selector, and every referenced selector marks class index 6 usable. The class-order investigation independently established index 6 as Paladin for this revision, so selector eligibility is not ambiguous here.

| Node(s) | Selector | Pinned threshold expression |
|---|---|---|
| Defiance | `StrengthMain3` | Strength `890 + (455 × ParagonBoardEquipIndex)` |
| Grappler, Ironclad | `IntelligenceSide1` | Intelligence `190 + (75 × ParagonBoardEquipIndex)` |
| Stalwart | `WillPowerSide3` | Willpower `230 + (75 × ParagonBoardEquipIndex)` |
| Insulate, Knight | `Paladin_Strength+Willpower` | Strength `700 + (455 × ParagonBoardEquipIndex)` and Willpower `190 + (70 × ParagonBoardEquipIndex)` |

Castle's source suffix `_01` is a board asset identifier, not evidence that runtime `ParagonBoardEquipIndex` equals 1. That index depends on placement order, while attachment and order are deliberately not modeled. The composite Paladin selector also contains two threshold entries, but the pinned data does not by itself establish their runtime aggregation semantics. Consequently, the calculator exposes the conditional magnitude and formula but leaves activation unresolved and does not add the conditional amount at any entered attribute value.

Evidence that would settle activation is either runtime evaluator evidence or controlled in-game Castle tests that record its actual placement index and test each requirement immediately below/at its calculated boundary. The composite selector requires four-state isolation of Strength and Willpower, analogous to the Tenacity experiment.

## Remaining unresolved bonuses

- Grappler's `ParagonNodeCritDamageToCC_RareMinor` is `2 × ParagonPowerBudgetMultiplierNodeRareMinorOffensive()`; the multiplier has no verified value.
- Stalwart's `ParagonNodeBlockChance_RareMinor` is `0.5 × ParagonPowerBudgetMultiplierNodeRareMinorOffensive()`; its base/additional amount has no verified value.
- Activation of all Castle rare conditional bonuses: runtime `ParagonBoardEquipIndex` is not modeled.
- Whether `Paladin_Strength+Willpower` requires both entries, either entry, or another runtime combination.
- Legendary Castle power and glyph effects remain out of scope.

A targeted audit found 53 formula-table call sites for `ParagonPowerBudgetMultiplierNodeRareMinorOffensive()` but zero formula-table entries defining the intrinsic itself. The Castle node literals for the two affected attributes are `"0"`, so they do not supply final values. The pinned data establishes a 4:1 ratio between Grappler's and Stalwart's coefficients, but not either absolute bonus. Reusing the Rare Major Offensive multiplier would be an unsupported assumption.

Threshold selector choice is otherwise structurally unambiguous: each Castle rare node references exactly one selector, and that selector marks Paladin class index 6 usable. No first-eligible-selector rule is needed for these definitions. What remains unresolved is evaluation of that chosen selector—particularly the runtime equip index and the two-entry composite semantics—not which selector asset belongs to the node.

