# Paragon bonuses and thresholds

## Scope and source revision

This report prioritizes the local [`paladin-board-00.json`](../paladin-board-00.json) and reuses the node findings in [`paragon-node-structure.md`](./paragon-node-structure.md). The accessible comparison source is `blizzhackers/d4data` at `master`, commit [`9cb0119029d79bdb57fb1d8012f19f298a035baa`](https://github.com/blizzhackers/d4data/tree/9cb0119029d79bdb57fb1d8012f19f298a035baa). An accessible public `DiabloTools/d4data` repository was not found, so a direct repository-to-repository comparison is not possible.

The only supporting definition assets fetched for this pass were the referenced `AttributeFormulas.gam.json` and four `ParagonThreshold` JSON files; the node findings were reused. The local board is `Paragon_Paladin_00.pbd` (`__snoID__: 2436481`). Its three references with local SNO values `2126168` (`Barbarian_Rare_039`), `2549802` (`Generic_Rare_118`), and `2436489` (`StartNodePaladin`) are absent from the accessible archive. Its expected board path, `json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`, is absent there as well.

The 14 other distinct node references available in the archive have `__snoID__` values matching the local entries' `__raw__` values. This supports consistency for those shared assets, but does not make the archive equivalent to the local Paladin board or validate missing Paladin-era assets.

## VERIFIED — GameBalance formulas

The source is [`json/base/meta/GameBalance/AttributeFormulas.gam.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/GameBalance/AttributeFormulas.gam.json). It is a `GameBalanceDefinition` (`__snoID__: 201912`, `eGameBalanceType: 22`). Entries are in `ptData` → `tEntries`; each `AttributeFormulaEntry` has `tHeader.szName` and `szNameGBIDHash`, plus `arRanges[].tFormula.value` and `compiled`. Each formula below has one range covering `tValueRange` 0–99999.

| GBID formula | Stored expression | What the source establishes |
|---|---|---|
| `ParagonNodeCoreStat_Normal` | `5` | Constant value 5 for the normal core-stat formula. This resolves the formula value used by `Generic_Normal_Str` and the normal core-stat nodes. |
| `ParagonNodeArmorBonusFlat_Magic` | `25 * 100 * ParagonPowerBudgetMultiplierNodeMagicDefensive()` | Expression only; multiplier is not defined in this formula entry. |
| `ParagonNodeDamageBonus_Magic` | `1 * ParagonPowerBudgetMultiplierNodeMagicOffensive()` | Expression only; multiplier unresolved. |
| `ParagonNodeHPMaxBonus_Magic` | `1 * ParagonPowerBudgetMultiplierNodeMagicDefensive()` | Expression only; multiplier unresolved. |
| `ParagonNodeDamageBonusToElite_Magic` | `1.6 * ParagonPowerBudgetMultiplierNodeMagicOffensive()` | Expression only; multiplier unresolved. The node also has `szAttributeFormula.value: "0.05"`; these fields alone do not establish how to combine that literal with the GBID formula. |
| `ParagonNodeDamageBonus_RareMajor` | `1 * ParagonPowerBudgetMultiplierNodeRareMajorOffensive()` | Expression only; multiplier unresolved. |

The expressions call `ParagonPowerBudgetMultiplier...()` functions; this table contains their call sites, not their definitions. Its `compiled` fields are present but do not by themselves establish the runtime function results. Therefore only the normal-stat formula resolves to a standalone numerical value here. The other expressions must not be reported as final character-sheet bonuses.

## VERIFIED — Rare threshold assets

The available rare node definitions ([`Barbarian_Rare_015.pgn.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json) and [`Barbarian_Rare_022.pgn.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json)) reference these assets through `arThresholdSelector`. Each threshold source is a `ParagonThresholdDefinition`; its condition is in `ptThresholds[].tThresholdAttribute` and `tThresholdValueFormula.value`. All four have `nParam: -1`.

| Source path | Attribute | Threshold formula | `arUsableByClass` |
|---|---|---|---|
| [`json/base/meta/ParagonThreshold/StrengthMain1.pth.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonThreshold/StrengthMain1.pth.json) | `Strength_Total` | `200 + (130 * ParagonBoardEquipIndex)` | `[0,0,1,0,0]` |
| [`json/base/meta/ParagonThreshold/StrengthSide1.pth.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonThreshold/StrengthSide1.pth.json) | `Strength_Total` | `160 + (90 * ParagonBoardEquipIndex)` | `[0,0,0,1,0]` |
| [`json/base/meta/ParagonThreshold/WillpowerMain1.pth.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonThreshold/WillpowerMain1.pth.json) | `Willpower_Total` | `200 + (130 * ParagonBoardEquipIndex)` | `[0,1,0,0,0]` |
| [`json/base/meta/ParagonThreshold/WillPowerSide1.pth.json`](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonThreshold/WillPowerSide1.pth.json) | `Willpower_Total` | `160 + (90 * ParagonBoardEquipIndex)` | `[1,0,1,0,1]` |

The formulas yield 200 for a main threshold and 160 for a side threshold only if `ParagonBoardEquipIndex` is 0; those are conditional arithmetic results, not verified values for the local Paladin board. The node JSONs also contain major/minor bonus `ptAttributes` and threshold-selector references. This suggests thresholds gate an additional rare-node bonus, but these files do not explicitly map each selector to an attribute entry or define the runtime activation rule.

## INFERRED

- The constant `ParagonNodeCoreStat_Normal` expression yields +5 for a normal core-stat node when that GBID is consumed as its attribute value. The GBID name/hash in the source matches the node reference; the `+5` formula itself is verified.
- `arThresholdSelector` likely supplies conditions for activating a rare node's additional bonus. Do not implement the exact activation behavior from this inference alone.
- The five-element `arUsableByClass` arrays indicate class applicability, but their index-to-class mapping is not established here. They cannot safely identify Paladin applicability.

## UNRESOLVED and safe calculator inputs

- The exact final values for magic Armor, Damage, HP, Damage-vs-Elites, and rare-major Damage remain unresolved until the relevant power-budget functions and their runtime inputs are sourced.
- The 5% node literal for `Generic_Magic_DamageToElite` must not be treated as its final bonus without resolving its relationship to `gbidFormula`.
- The threshold expressions depend on `ParagonBoardEquipIndex`; its assignment for this board, class-mask mapping, and the specific threshold-to-bonus activation rule are not established by the archived files.
- `Generic_Rare_118`, `Barbarian_Rare_039`, and `StartNodePaladin` mechanics remain unknown. Do not substitute similarly named or older definitions.
- Safe inputs for future work: the local board's node identities and positions; matching shared-node SNO IDs; the exact formula strings and numeric constant `5`; and the four archived threshold attribute/formula strings as source-revision evidence. Keep unresolved expressions and Paladin applicability as unknown rather than inventing values.
