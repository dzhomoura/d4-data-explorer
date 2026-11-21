# Paladin Paragon raw bonuses

## Scope and provenance

The calculator uses the local [`paladin-board-00.json`](../paladin-board-00.json) and [`node-data.json`](../paragon-visual/node-data.json), pinned to DiabloTools/d4data commit `75e619f0d90a0951945747f45feef59c076a5db0`. The evidence registry is [`paragon-bonus-registry.js`](../paragon-visual/paragon-bonus-registry.js); it keys each observation by node SNO, attribute index/ID, and matching formula reference, rather than display name alone.

The supplied Magic and rare-node numbers are recorded as **direct in-game observations**. No unamplified planner values or formula-derived raw power-budget values are used. The calculator applies no glyph amplification. The existing normal/magic core-stat values remain separately attributed to verified GameBalance formulas.

The node source paths and original formula findings are preserved in [`paragon-formula-resolution.md`](./paragon-formula-resolution.md) and [`rare-node-threshold-investigation.md`](./rare-node-threshold-investigation.md). The registry records the pinned ParagonNode path for each observed definition.

## VERIFIED IN-GAME — Raw node values

All percentages below are raw additive attribute values shown by the node tooltips, not damage multipliers. Base values remain active whenever their node is allocated; conditional values are added only when the registered threshold is met.

| Node / SNO | Attribute identifier (ID) | Base | Additional threshold bonus |
|---|---|---:|---:|
| `Generic_Magic_Damage` / `678754` | `Damage_Percent_All_From_Skills` (252) | Damage +5% | — |
| `Generic_Magic_DamageToElite` / `678842` | `Damage_Percent_Bonus_Vs_Elites` (953) | Damage to Elites +7.5% | — |
| `Generic_Magic_HPPercent` / `679184` | `Hitpoints_Max_Percent_Bonus` (142) | Maximum Life +2% | — |
| `Generic_Magic_Armor` / `671247` | `Armor_Percent` (482) | Total Armor +1.5% | — |
| Brawn — `Barbarian_Rare_022` / `675448` | `Damage_Percent_All_From_Skills` (252) | Damage +10% | Damage +10% |
| Brawn — `Barbarian_Rare_022` / `675448` | `Hitpoints_Max_Percent_Bonus` (142) | Maximum Life +4% | — |
| Tenacity — `Barbarian_Rare_015` / `675186` | `Hitpoints_Max_Percent_Bonus` (142) | Maximum Life +4% | Maximum Life +4% |
| Tenacity — `Barbarian_Rare_015` / `675186` | `Armor_Percent` (482) | Total Armor +2% | — |
| Raw Power — `Generic_Rare_118` / `2549802` | `Damage_Percent_All_From_Skills` (252) | Damage +10% | Damage +10% |
| Raw Power — `Generic_Rare_118` / `2549802` | `Strength_Core` (9) | Strength +10 | — |
| Iron Strength — `Barbarian_Rare_039` / `2126168` | `Damage_Percent_Bonus_Vs_Elites` (953) | Damage to Elites +15% | Damage to Elites +15% |
| Iron Strength — `Barbarian_Rare_039` / `2126168` | `Strength_Core` (9) | Strength +10 | — |

For Brawn, the user directly observed base Damage +10%, Maximum Life +4%, and an additional conditional Damage +10%; at 2,932 Strength, the tooltip showed +20% Damage and +4% Maximum Life. The baseline Damage component is recorded as observed even though the node JSON has only one Damage attribute record and does not explain that separate baseline.

## VERIFIED — Thresholds used on the starting board

The selected threshold reference is validated against each node's `arThresholdSelector` in the matching pinned definition. `ptBonusAttributeIndices` is copied into the evidence registry from those definitions and checked against the registered attribute index before a conditional value can apply.

| Reference | Required attribute | Starting-board requirement | Source formula in pinned data | Nodes using it |
|---|---|---:|---|---|
| [`StrengthMain1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthMain1.pth.json) (SNO `1015345`) | `Strength_Total` (18) | 630 | `630 + (455 * ParagonBoardEquipIndex)` | Brawn, Tenacity |
| [`IntelligenceSide2`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/IntelligenceSide2.pth.json) (SNO `1015351`) | `Intelligence_Total` (19) | 210 | `210 + (75 * ParagonBoardEquipIndex)` | Raw Power |
| [`WillPowerSide1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/WillPowerSide1.pth.json) (SNO `1015310`) | `Willpower_Total` (20) | 190 | `190 + (75 * ParagonBoardEquipIndex)` | Iron Strength |

The observed starting-board values match each formula at `ParagonBoardEquipIndex = 0`. The implementation uses these values only for board SNO `2436481` and the pinned revision; it does not calculate thresholds for other boards. Thresholds compare against `external attribute + verified Paragon core-attribute bonuses` using `>=`.

The rare definitions mark attribute slot `[0]` in `ptBonusAttributeIndices`, matching the conditional Damage, Maximum Life, or Damage-to-Elites attribute in each registered node. The other rare attribute slots are unconditional. Tenacity's source definition also lists `StrengthSide1`, `WillpowerMain1`, and `WillPowerSide1`; only its user-observed `StrengthMain1` condition is registered. The other selectors are shown as not evaluated, not guessed.

## VERIFIED FROM GAME DATA — Formula resolution status

The pinned [`AttributeFormulas.gam.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json) expresses the affected formulas through power-budget function calls. Direct in-game values now resolve the **observed outputs for the listed node definitions on this board**, but not the functions' general return values:

| Formula references | Dependency function | Observed node outputs now registered | Still unresolved |
|---|---|---|---|
| `ParagonNodeDamageBonus_Magic`, `ParagonNodeDamageBonusToElite_Magic` | `ParagonPowerBudgetMultiplierNodeMagicOffensive()` | Magic Damage +5%; Magic Damage to Elites +7.5% | The multiplier implementation/value and its application to any unobserved node. |
| `ParagonNodeHPMaxBonus_Magic`, `ParagonNodeArmorBonus_Magic` | `ParagonPowerBudgetMultiplierNodeMagicDefensive()` | Magic Maximum Life +2%; Magic Total Armor +1.5% | The multiplier implementation/value and its application to any unobserved node. |
| `ParagonNodeDamageBonus_RareMajor`, `ParagonNodeDamageBonusToElite_RareMajor` | `ParagonPowerBudgetMultiplierNodeRareMajorOffensive()` | Brawn/Raw Power Damage +10% base and +10% conditional; Iron Strength Damage to Elites +15% base and +15% conditional | The function's general value; do not infer a universal multiplier from these different node outputs. |
| `ParagonNodeHPMaxBonus_RareMajor` | `ParagonPowerBudgetMultiplierNodeRareMajorDefensive()` | Tenacity Maximum Life +4% base and +4% conditional | The function's general value and the behavior of Tenacity's other source threshold selectors. |
| `ParagonNodeHPMaxBonus_RareMinor`, `ParagonNodeArmorBonus_RareMinor` | `ParagonPowerBudgetMultiplierNodeRareMinorDefensive()` | Brawn Maximum Life +4%; Tenacity Total Armor +2% | The function's general value outside these observed node attributes. |
| `ParagonNodeCoreStat_RareMinor` | Constant `10` | Raw Power and Iron Strength each grant Strength +10 in-game. | The node literals differ (`"15"` and `"0"`); how literals and GBID formulas combine remains unknown outside these observations. |

The Magic Damage-to-Elites node's `"0.05"` literal and Tenacity's `"0.06"` Maximum-Life literal do not replace their direct in-game values. They remain source fields whose precedence/relationship to the GameBalance formulas is unresolved. The user-observed node outputs are the calculator inputs; no missing multiplier values are invented or generalized.

Existing verified `ParagonNodeCoreStat_Normal = 5` and `ParagonNodeCoreStat_Magic = 7` calculations remain formula-derived and separate from the direct in-game raw-bonus registry.

## Implementation behavior and boundaries

- The calculation module sums each allocated node's unconditional values and conditional values into separate categories: Damage, Damage to Elites, Maximum Life %, and Total Armor %. Damage categories are never merged.
- The conditional attribute must match the node's registered `ptBonusAttributeIndices` slot, and its threshold reference must appear in that node's actual definition. Its base value stays active when the condition is unmet.
- External Strength, Intelligence, Willpower, and Dexterity are kept separate from Paragon gains. Their sums with Paragon core attributes determine threshold progress. Inputs use a separate local-storage key and are not added to the existing build import/export schema.
- Unresolved or mismatched registry entries remain excluded and are reported unresolved. No glyph amplification, glyph sockets, or other-board formulas are implemented.

## Assumptions and remaining unknowns

- User-provided raw values and threshold requirements are treated as direct in-game observations for the Paladin starting board. They are not verified as universal values across revisions, character states, or other boards.
- Tenacity's observed 630 Strength requirement selects `StrengthMain1` from a definition containing additional threshold selectors. The calculator intentionally does not activate the other selectors.
- Brawn's observed base Damage +10% has no distinct corresponding attribute entry in the extracted node definition; its source mechanics remain unexplained.
- The underlying power-budget function definitions, literal/GBID precedence, and all unobserved formula contexts remain unknown.

## Castle board extension

Castle (`Paragon_Paladin_01`, board SNO `2436511`) now has a separate board-scoped registry. It does not reuse Board 00 node records merely because a display category looks similar. Exact shared SNO observations and same-revision formula coefficients calibrated against multiple Board 00 observations resolve Castle's Magic bonuses and most Rare base magnitudes.

The detailed per-node formulas, values, confidence levels, Paladin selector evidence, and remaining unknowns are recorded in [`castle-numerical-bonuses.md`](./castle-numerical-bonuses.md). Castle conditional amounts are kept separate from base totals, but are not activated because `ParagonBoardEquipIndex` and the composite Paladin threshold semantics are not modeled. Grappler's Rare Minor Damage-to-CC value and Stalwart's Rare Minor Block Chance remain numerically unresolved.
