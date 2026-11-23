# Paladin starting-board formula resolution

## Scope and evidence

This report covers the 17 unique node definitions referenced by the local [`paladin-board-00.json`](../paladin-board-00.json). The local [`node-data.json`](../paragon-visual/node-data.json) identifies the matching DiabloTools/d4data revision as `75e619f0d90a0951945747f45feef59c076a5db0`. Formula expressions below were checked in that revision's [`json/base/meta/GameBalance/AttributeFormulas.gam.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json). Referenced ParagonNode paths link to the same pinned revision.

Expressions are the stored `arRanges[].tFormula.value` values in `ptData[].tEntries`; each listed formula has a range of 0–99999. The expressions establish coefficients and function calls, not the runtime results of those functions. No older repository snapshot is used to fill gaps.

**Revision note:** This pinned file has `ParagonNodeDamageBonus_Magic = 2 * ...MagicOffensive()` and `ParagonNodeDamageBonusToElite_Magic = 3 * ...MagicOffensive()`. These differ from the `1 *` and `1.6 *` expressions recorded in the older-archive [`paragon-bonuses.md`](./paragon-bonuses.md). The current pinned source takes precedence here; do not merge values across revisions.

## VERIFIED IN-GAME — Brawn observations

The user reports direct in-game observations for [`Barbarian_Rare_022.pgn.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json) (SNO `675448`) on the starting board:

- The tooltip shows base Damage `+10%`, Maximum Life `+4%`, and an additional conditional Damage `+10%`.
- At 2,932 Strength, it displays `+20%` Damage and `+4%` Maximum Life.
- The Strength requirement is 630 on this board.

The node's `ptAttributes` contains Damage from Skills using `ParagonNodeDamageBonus_RareMajor` and Maximum Life using `ParagonNodeHPMaxBonus_RareMinor`; `ptBonusAttributeIndices` is `[0]`, and its only threshold selector is `StrengthMain1`. This aligns the marked Damage attribute with the observed conditional component and leaves Maximum Life unmarked. However, the JSON does not explain the separate baseline `+10%` Damage component: it exposes one Damage attribute record, not separate base and conditional records. Keep the tooltip breakdown as verified for this node, but do not assume the JSON alone fully models it.

## VERIFIED FROM GAME DATA — Unresolved formula inventory

The following are all unresolved power-budget formulas on the starting board, grouped by GBID formula. “Board count” is the number of occupied positions using that node definition; threshold association reports the node's explicit `ptBonusAttributeIndices` and selectors, not proven runtime evaluation.

| GBID formula | Stored expression; unresolved dependency | Node definition(s), SNO, attribute identifier | Board count and threshold association |
|---|---|---|---|
| `ParagonNodeDamageBonus_Magic` | `2 * ParagonPowerBudgetMultiplierNodeMagicOffensive()`; Magic Offensive multiplier unresolved. | [`Generic_Magic_Damage`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Magic_Damage.pgn.json), `678754`; `Damage_Percent_All_From_Skills` (252). | 6; no threshold selector. |
| `ParagonNodeDamageBonusToElite_Magic` | `3 * ParagonPowerBudgetMultiplierNodeMagicOffensive()`; Magic Offensive multiplier unresolved. | [`Generic_Magic_DamageToElite`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Magic_DamageToElite.pgn.json), `678842`; `Damage_Percent_Bonus_Vs_Elites` (953). | 2; no threshold selector. `szAttributeFormula.value` is `"0.05"`; its relationship to the GBID formula is unresolved. |
| `ParagonNodeHPMaxBonus_Magic` | `1 * ParagonPowerBudgetMultiplierNodeMagicDefensive()`; Magic Defensive multiplier unresolved. | [`Generic_Magic_HPPercent`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Magic_HPPercent.pgn.json), `679184`; `Hitpoints_Max_Percent_Bonus` (142). | 4; no threshold selector. Literal formula value is `"0"`, not a resolved bonus. |
| `ParagonNodeArmorBonus_Magic` | `0.75 * ParagonPowerBudgetMultiplierNodeMagicDefensive()`; Magic Defensive multiplier unresolved. | [`Generic_Magic_Armor`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Magic_Armor.pgn.json), `671247`; `Armor_Percent` (482). | 2; no threshold selector. |
| `ParagonNodeDamageBonus_RareMajor` | `2 * ParagonPowerBudgetMultiplierNodeRareMajorOffensive()`; RareMajor Offensive multiplier unresolved. | [`Generic_Rare_118`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json), `2549802`; `Damage_Percent_All_From_Skills` (252). [`Barbarian_Rare_022`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json), `675448`; same attribute. | 1 each; both have `ptBonusAttributeIndices: [0]`, marking this attribute, and respectively `IntelligenceSide2` / `StrengthMain1` selectors. |
| `ParagonNodeDamageBonusToElite_RareMajor` | `3 * ParagonPowerBudgetMultiplierNodeRareMajorOffensive()`; RareMajor Offensive multiplier unresolved. | [`Barbarian_Rare_039`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json), `2126168`; `Damage_Percent_Bonus_Vs_Elites` (953). | 1; `ptBonusAttributeIndices: [0]` marks this attribute; selector `WillPowerSide1`. |
| `ParagonNodeHPMaxBonus_RareMajor` | `1 * ParagonPowerBudgetMultiplierNodeRareMajorDefensive()`; RareMajor Defensive multiplier unresolved. | [`Barbarian_Rare_015`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json), `675186`; `Hitpoints_Max_Percent_Bonus` (142). | 1; `ptBonusAttributeIndices: [0]` marks this attribute. The node lists `StrengthSide1`, `StrengthMain1`, `WillpowerMain1`, and `WillPowerSide1`; the selector-to-attribute and multi-selector logic are not established. Literal formula value is `"0.06"`, not independently verified as the final bonus. |
| `ParagonNodeArmorBonus_RareMinor` | `0.5 * ParagonPowerBudgetMultiplierNodeRareMinorDefensive()`; RareMinor Defensive multiplier unresolved. | [`Barbarian_Rare_015`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json), `675186`; `Armor_Percent` (482). | 1; attribute slot 1 is not listed in `ptBonusAttributeIndices: [0]`. The node has the four selectors noted above, but this attribute is not explicitly marked as the threshold bonus. |
| `ParagonNodeHPMaxBonus_RareMinor` | `1 * ParagonPowerBudgetMultiplierNodeRareMinorDefensive()`; RareMinor Defensive multiplier unresolved. | [`Barbarian_Rare_022`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json), `675448`; `Hitpoints_Max_Percent_Bonus` (142). | 1; slot 1 is not listed in `ptBonusAttributeIndices: [0]`; the node has `StrengthMain1`. The user-observed `+4%` Maximum Life is evidence for this node, not proof the multiplier is universal. |

The multiplier functions above do not have definitions in the pinned `AttributeFormulas.gam.json` table. The table contains formula call sites; its stored expressions and compiled representations do not resolve those functions' values.

## VERIFIED FROM GAME DATA — Resolved formula with conflicting node values

`ParagonNodeCoreStat_RareMinor` is a numeric exception: its pinned GameBalance expression is the constant `10`, not a power-budget call.

| Node | Attribute / formula | Node literal | Threshold marker |
|---|---|---|---|
| [`Generic_Rare_118`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json), SNO `2549802` | `Strength_Core` (9), `ParagonNodeCoreStat_RareMinor` = `10` | `szAttributeFormula.value: "15"` | Slot 1 is not in `ptBonusAttributeIndices: [0]`; selector `IntelligenceSide2`. |
| [`Barbarian_Rare_039`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json), SNO `2126168` | `Strength_Core` (9), `ParagonNodeCoreStat_RareMinor` = `10` | `szAttributeFormula.value: "0"` | Slot 1 is not in `ptBonusAttributeIndices: [0]`; selector `WillPowerSide1`. |

The formula result `10` is verified from GameBalance; the effective in-game Strength granted by either node is not established because the node-level literals differ and their precedence or combination with the GBID formula is unresolved. Do not silently select the literal or GBID value as the effective amount.

## VERIFIED FROM GAME DATA — Other nodes in the 17-definition inventory

These nine definitions contain no unresolved numerical formula: `Generic_Normal_Str` (SNO `678769`), `Generic_Normal_Int` (`678776`), `Generic_Normal_Dex` (`678775`), and `Generic_Normal_Will` (`678773`) use `ParagonNodeCoreStat_Normal = 5`; `Generic_Magic_Int` (`678627`) and `Generic_Magic_Will` (`678629`) use `ParagonNodeCoreStat_Magic = 7`. `Generic_Gate` (`994337`) has four attributes using the normal formula. `Generic_Socket` (`681756`) and `StartNodePaladin` (`2436489`) have no attributes in the local database. Together, these nine definitions and the eight definitions in the unresolved power-budget inventory account for all 17 unique board references. `Generic_Rare_118` and `Barbarian_Rare_039` additionally have the resolved-but-ambiguous `ParagonNodeCoreStat_RareMinor` attributes described above.

## INFERRED — Candidate results and reuse limits

- **RareMajor Offensive:** If Brawn's observed additional conditional `+10%` is the output of its `2 * ParagonPowerBudgetMultiplierNodeRareMajorOffensive()` formula, the implied multiplier result is 5. This is a candidate inferred from one node's tooltip, not a verified universal multiplier. The same formula name/expression on `Generic_Rare_118` makes `+10%` a useful candidate to test there, not a verified value.
- **RareMajor Offensive, Damage vs. Elites:** The `3 *` coefficient in `Barbarian_Rare_039` would yield a candidate `+15%` if the same multiplier result of 5 applies in this context. No tooltip currently verifies that result.
- **RareMinor Defensive:** If Brawn's observed `+4%` Maximum Life corresponds to its `1 * ParagonPowerBudgetMultiplierNodeRareMinorDefensive()` formula, the implied multiplier result is 4. Under that hypothesis, `Barbarian_Rare_015`'s `0.5 *` Armor formula would produce a candidate `+2%` Armor. Neither the multiplier nor the Armor result is verified independently.
- **Magic Offensive and Magic Defensive:** There are no supplied in-game values for these functions. The expression coefficients imply candidate same-context ratios: Damage-to-Elites (`3 *`) versus Damage (`2 *`) is 1.5; HP (`1 *`) versus Armor (`0.75 *`) is 4/3. These ratios assume the shared function returns the same value in the compared contexts and do not resolve the stored magic literals.
- **RareMajor Defensive:** No observation resolves `ParagonPowerBudgetMultiplierNodeRareMajorDefensive()`. The `"0.06"` node literal on `Barbarian_Rare_015` is evidence to compare against the tooltip, not proof of a `+6%` result.
- **RareMinor Core Stat:** The GameBalance expression says 10, but the node literals `"15"` and `"0"` prevent declaring either node's actual displayed Strength bonus verified.
- **Brawn baseline Damage:** The user-observed base `+10%` and additional conditional `+10%` are both recorded as in-game evidence. The available node JSON does not expose a distinct formula record explaining the baseline component, so do not equate it with the rare-major formula without further tracing.

## UNRESOLVED — Remaining mechanics

- Numeric values for all Magic and RareMajor/RareMinor power-budget functions remain unresolved in the pinned extracted data.
- The interaction between `szAttributeFormula` literals and `gbidFormula` is unresolved for Magic Damage-to-Elites (`"0.05"`), RareMajor Maximum Life (`"0.06"`), and the two RareMinor core-stat records.
- `ptBonusAttributeIndices` identifies marked attribute slots, but does not encode the threshold comparator, whether multiple selectors are AND/OR conditions, or how the four selectors on `Barbarian_Rare_015` map to bonus activation.
- Brawn's tooltip does not establish that its observed values apply to every node sharing a formula name or function.

## Prioritized in-game verification plan

1. **`Barbarian_Rare_022` (SNO `675448`, Brawn):** Compare the tooltip below and at the 630 Strength requirement, if possible. Record baseline Damage, conditional Damage, and Maximum Life separately. This isolates the threshold transition and the unexplained baseline `+10%` component.
2. **`Barbarian_Rare_015` (SNO `675186`):** Record HP and Armor with each listed threshold unmet/met one at a time if feasible. Look for whether the HP literal `"0.06"` appears as `+6%`, whether Armor resolves to a value, and which of its four selectors actually gates the marked HP slot. This targets both rare defensive multipliers.
3. **`Generic_Rare_118` (SNO `2549802`):** Record conditional Damage and Strength, then vary Intelligence around `IntelligenceSide2`. This tests reuse of RareMajor Offensive and resolves whether its `"15"` Strength literal or the formula value 10 reflects the tooltip.
4. **`Barbarian_Rare_039` (SNO `2126168`):** Record Damage to Elites and Strength around `WillPowerSide1`. This tests the `3 * RareMajor Offensive` coefficient and the `"0"` versus formula-10 core-stat conflict.
5. **`Generic_Magic_Damage` (SNO `678754`) and `Generic_Magic_DamageToElite` (SNO `678842`):** Record both tooltips. These cover the repeated Magic Offensive function, test the coefficient-based 1.5 ratio, and show whether the elite node's `"0.05"` literal matches its final value.
6. **`Generic_Magic_HPPercent` (SNO `679184`) and `Generic_Magic_Armor` (SNO `671247`):** Record both values to test the shared Magic Defensive function and the `1` versus `0.75` coefficient relationship.

Treat every observed value as scoped to the specific node, board, and game state tested. Add broader formula values to a future calculator database only after confirming the corresponding formula-to-tooltip mapping and checking the relevant shared-formula candidates in-game.
