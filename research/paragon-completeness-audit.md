# Phase 9B — Paladin Starting Board Completeness Audit

## Scope and evidence

Audited board SNO `2436481` (`Paragon_Paladin_00`), its 75 occupied positions and 17 unique node definitions. The data source is DiabloTools/d4data revision [`75e619f0d90a0951945747f45feef59c076a5db0`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0). This review used the local [node database](../paragon-visual/node-data.json), [bonus registry](../paragon-visual/paragon-bonus-registry.js), [calculator](../paragon-visual/paragon-calculator.js), and [raw-bonus research](./paragon-raw-bonuses.md).

**Evidence labels:** **VERIFIED—DATA** means directly represented by the pinned JSON/formula; **VERIFIED—IN-GAME** means a user-supplied direct in-game observation recorded in the project research (with calculator inputs separately recorded in the registry where applicable); **INFERRED** means a likely interpretation not fully specified by the extracted data; **UNRESOLVED** means the available evidence is insufficient. Registry values are scoped to this source revision and board; they do not prove a shared formula's universal output.

## All 17 definitions

Rarity is shown as the local node kind and `eRarityOverride`. Formula names and bonuses are attribute-specific. The exact source file for each row is `json/base/meta/ParagonNode/<internal identifier>.pgn.json`.

| Node / SNO | Rarity; board count | Attributes, formula references, and raw values | Conditional bonus / threshold | Calculator audit |
|---|---|---|---|---|
| `Generic_Gate` / `994337` | Gate / 0; **1** | Strength, Intelligence, Willpower, Dexterity (`*_Core`, IDs 9–12); `ParagonNodeCoreStat_Normal` = **+5 each** (**VERIFIED—DATA**). | None. | Correct; counts its four distinct attributes once each. |
| `Generic_Normal_Int` / `678776` | Normal / 0; **13** | `Intelligence_Core` (10); `ParagonNodeCoreStat_Normal` = **+5 Intelligence** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Normal_Str` / `678769` | Normal / 0; **22** | `Strength_Core` (9); `ParagonNodeCoreStat_Normal` = **+5 Strength** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Normal_Dex` / `678775` | Normal / 0; **5** | `Dexterity_Core` (12); `ParagonNodeCoreStat_Normal` = **+5 Dexterity** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Normal_Will` / `678773` | Normal / 0; **10** | `Willpower_Core` (11); `ParagonNodeCoreStat_Normal` = **+5 Willpower** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Magic_Will` / `678629` | Magic / 2; **2** | `Willpower_Core` (11); `ParagonNodeCoreStat_Magic` = **+7 Willpower** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Magic_DamageToElite` / `678842` | Magic / 2; **2** | `Damage_Percent_Bonus_Vs_Elites` (953); `ParagonNodeDamageBonusToElite_Magic`; **+7.5% Damage to Elites** (**VERIFIED—IN-GAME**). Node literal `"0.05"` is not used as the final value. | None. | Correct for this node/revision; the formula function and literal relationship remain unresolved. |
| `Generic_Magic_Int` / `678627` | Magic / 2; **2** | `Intelligence_Core` (10); `ParagonNodeCoreStat_Magic` = **+7 Intelligence** (**VERIFIED—DATA**). | None. | Correct. |
| `Generic_Rare_118` / `2549802` | Rare / 3; **1** | `Damage_Percent_All_From_Skills` (252); `ParagonNodeDamageBonus_RareMajor`; **+10% Damage**. `Strength_Core` (9); `ParagonNodeCoreStat_RareMinor` has formula value 10 and node literal `"15"`; observed **+10 Strength**. Values are **VERIFIED—IN-GAME**; the literal/formula precedence is **UNRESOLVED**. | Additional **+10% Damage** at `IntelligenceSide2`; `ptBonusAttributeIndices: [0]` marks Damage. **VERIFIED—IN-GAME**. | Correct for recorded values and the selected observed threshold. Do not generalize the shared formula or select `"15"` from the literal. |
| `Barbarian_Rare_039` / `2126168` | Rare / 3; **1** | `Damage_Percent_Bonus_Vs_Elites` (953); `ParagonNodeDamageBonusToElite_RareMajor`; **+15% Damage to Elites**. `Strength_Core` (9); `ParagonNodeCoreStat_RareMinor` = 10, literal `"0"`; observed **+10 Strength**. Values are **VERIFIED—IN-GAME**; precedence is **UNRESOLVED**. | Additional **+15% Damage to Elites** at `WillPowerSide1`; slot 0 is marked. **VERIFIED—IN-GAME**. | Correct for recorded values and selected threshold; formula/literal behavior remains unresolved. |
| `Generic_Magic_Damage` / `678754` | Magic / 2; **6** | `Damage_Percent_All_From_Skills` (252); `ParagonNodeDamageBonus_Magic`; **+5% Damage** (**VERIFIED—IN-GAME**). | None. | Correct for this node/revision; the shared power-budget function is unresolved. |
| `Generic_Socket` / `681756` | Socket / 0; **1** | No attributes. | None; glyph effects are out of scope. | Correctly contributes no raw node bonus. |
| `Generic_Magic_HPPercent` / `679184` | Magic / 2; **4** | `Hitpoints_Max_Percent_Bonus` (142); `ParagonNodeHPMaxBonus_Magic`; **+2% Maximum Life** (**VERIFIED—IN-GAME**). | None. | Correct for this node/revision; the shared power-budget function is unresolved. |
| `Generic_Magic_Armor` / `671247` | Magic / 2; **2** | `Armor_Percent` (482); `ParagonNodeArmorBonus_Magic`; **+1.5% Total Armor** (**VERIFIED—IN-GAME**). | None. | Correct for this node/revision; the shared power-budget function is unresolved. |
| `Barbarian_Rare_015` / `675186` | Rare / 3; **1** | `Hitpoints_Max_Percent_Bonus` (142); `ParagonNodeHPMaxBonus_RareMajor`; **+4% Maximum Life**. `Armor_Percent` (482); `ParagonNodeArmorBonus_RareMinor`; **+2% Total Armor**. Values are **VERIFIED—IN-GAME**; the HP literal `"0.06"` does not resolve the formula. | Additional **+4% Maximum Life** uses `StrengthMain1` (630 Strength); slot 0 is marked. A four-state in-game test verified activation at 630/189 and 630/190, and inactivity at 629/189 and 629/190. `WillPowerSide1` at 190 Willpower does not independently activate it. **VERIFIED—IN-GAME** for this board. | Correct for all four tested Paladin starting-board boundary states. The universal selector-priority mechanism remains inferred, but no additional Tenacity condition is missing for this context. |
| `Barbarian_Rare_022` / `675448` | Rare / 3; **1** | `Damage_Percent_All_From_Skills` (252); `ParagonNodeDamageBonus_RareMajor`; **+10% Damage**. `Hitpoints_Max_Percent_Bonus` (142); `ParagonNodeHPMaxBonus_RareMinor`; **+4% Maximum Life**. **VERIFIED—IN-GAME**. | Additional **+10% Damage** at `StrengthMain1` (630 Strength); slot 0 is marked. **VERIFIED—IN-GAME**. | Correct for the observed node and threshold. The source has one Damage attribute record for the observed base and additional values; the separate baseline is not explained by that record alone. |
| `StartNodePaladin` / `2436489` | Start / 0; **1** | No attributes. | None. | Correctly contributes no raw node bonus. |

The counts sum to 75: 50 normal, 18 magic, 4 rare, and one each gate, socket, and start.

## Shared formula limits

The pinned [`AttributeFormulas.gam.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json) stores these relevant expressions:

- Magic: Damage `2 × ParagonPowerBudgetMultiplierNodeMagicOffensive()`; Damage to Elites `3 ×` the same function; Maximum Life `1 × ParagonPowerBudgetMultiplierNodeMagicDefensive()`; Armor `0.75 ×` the same defensive function.
- Rare: Major Damage `2 × ParagonPowerBudgetMultiplierNodeRareMajorOffensive()`; Major Damage to Elites `3 ×` that function; Major Maximum Life `1 × ParagonPowerBudgetMultiplierNodeRareMajorDefensive()`; Minor Maximum Life `1 × ParagonPowerBudgetMultiplierNodeRareMinorDefensive()`; Minor Armor `0.5 ×` that function.
- `ParagonNodeCoreStat_RareMinor` is the constant **10**.

The power-budget function implementations are not resolved by these expressions. The calculator does not execute them: it uses the node-specific in-game observations for this board. This supports the listed outputs, not universal formula values. The RareMinor core-stat constant/literal conflicts are listed in the node table and remain unresolved outside those observations.

## Rare threshold audit

The exact pinned threshold assets are under `json/base/meta/ParagonThreshold/`. Formulas below are evaluated at `ParagonBoardEquipIndex = 0`, matching the observed starting-board values recorded in the registry.

| Rare node | Definition selector(s) and required attribute/value | Marked bonus attribute | Current implementation |
|---|---|---|---|
| Brawn (`Barbarian_Rare_022`) | `StrengthMain1`: `Strength_Total`, `630 + (455 × index)` → **630**. | Attribute slot 0: Damage from Skills; additional **+10% Damage**. | Correctly compares total Strength (external + Paragon) using `>=`; observed value and selector match. |
| Raw Power (`Generic_Rare_118`) | `IntelligenceSide2`: `Intelligence_Total`, `210 + (75 × index)` → **210**. | Attribute slot 0: Damage from Skills; additional **+10% Damage**. | Correctly compares total Intelligence using `>=`; observed value and selector match. |
| Iron Strength (`Barbarian_Rare_039`) | `WillPowerSide1`: `Willpower_Total`, `190 + (75 × index)` → **190**. | Attribute slot 0: Damage to Elites; additional **+15%**. | Correctly compares total Willpower using `>=`; observed value and selector match. |
| Tenacity (`Barbarian_Rare_015`) | `StrengthSide1`: Strength, `190 + (75 × index)` → **190**; `StrengthMain1`: Strength, `630 + (455 × index)` → **630**; `WillpowerMain1`: Willpower, `630 + (455 × index)` → **630**; `WillPowerSide1`: Willpower, `190 + (75 × index)` → **190**. Threshold-array index 6 is verified as Paladin, making `StrengthMain1` and `WillPowerSide1` class-eligible in stored order. | Attribute slot 0: Maximum Life; additional **+4%**. | Correct for `Paragon_Paladin_00`: experiment A 629/189 inactive; B 630/189 active; C 629/190 inactive; D 630/190 active. This verifies `Strength >= 630` and excludes an independent 190-Willpower path. First-class-eligible priority is supported but not universally verified. |

`ptBonusAttributeIndices: [0]` agrees with the registry's conditional attribute slot for all four rares. The engine verifies that the registered threshold appears in the node's source selectors and that the slot is marked. For Tenacity, repository-wide evidence verifies Paladin as threshold-array index 6, while the four-state experiment verifies that `StrengthMain1` governs activation on the starting board and that `WillPowerSide1` does not independently activate it. The calculator does not implement a general selector-priority resolver; the three threshold references in the registry remain revision- and board-scoped, and `ParagonBoardEquipIndex` calculation is not generalized.

## Calculation coverage and validation

### VERIFIED

- The engine resolves every attribute category present on this board: four core attributes plus Damage, Damage to Elites, Maximum Life %, and Total Armor %. No current node attribute is dropped as unsupported.
- Node formulas `ParagonNodeCoreStat_Normal = 5` and `ParagonNodeCoreStat_Magic = 7` are checked against the pinned node database and GameBalance source. Raw Magic/Rare power-budget formulas remain unresolved as general formulas; their node-specific outputs come from the direct in-game registry.
- The registry requires the exact source revision and board SNO, and validates each entry against SNO, internal name, attribute index/ID/name, and formula reference. This avoids applying these observations to a mismatched definition or another board.
- Allocated positions are a `Set`; each occupied index is processed once. Separate board cells using the same definition each contribute once, the gate's attributes are accumulated separately, and thresholded values are added in a distinct pass. No connection-based double counting was found.
- Executed the existing calculator with all 75 positions allocated. With external attributes zero, it returned Strength 135, Intelligence 84, Willpower 69, Dexterity 30; unconditional raw totals were Damage +50%, Damage to Elites +30%, Maximum Life +16%, and Total Armor +5%. No registered threshold was met.
- Boundary check: with external Strength 494, total Strength was 629 and Brawn/Tenacity's registered `StrengthMain1` bonuses stayed inactive; at external Strength 495, total Strength was 630 and they activated. External Intelligence 126 and Willpower 121 brought their totals to 210 and 190 respectively, activating Raw Power and Iron Strength. The subsequent in-game Tenacity matrix independently confirmed inactive at 629 Strength with either 189 or 190 Willpower and active at 630 Strength with either 189 or 190 Willpower. At 630 Strength the resulting conditional totals were Damage +20%, Damage to Elites +15%, and Maximum Life +4%. The implementation's `>= 630 Strength` behavior matches all four observations.

### INFERRED / UNRESOLVED

- The registry's direct observations resolve the **listed node outputs**, not the implementation of the underlying `ParagonPowerBudgetMultiplier...` functions. Do not derive a universal multiplier from a shared formula name or the Brawn observation.
- `ParagonNodeCoreStat_RareMinor` is the pinned constant 10, while Raw Power's node literal is `"15"` and Iron Strength's is `"0"`. The current +10 Strength values are supported by the recorded in-game observations. The literal/formula precedence for other nodes or contexts is unknown.
- Magic Damage to Elites has literal `"0.05"` and an observed +7.5%; Tenacity has literal `"0.06"` and an observed +4% base life. Their relationship to the formula outputs is unresolved; the app correctly uses the node-specific observations rather than the literals.
- The all-nodes execution reported zero unresolved bonuses. For Tenacity on `Paragon_Paladin_00`, the four-state experiment now verifies that the registered 630-Strength path is complete across the distinguishing Strength/Willpower boundaries. The general runtime rule for choosing among multiple class-eligible selectors remains unknown and must not be generalized to other nodes or boards from this one experiment.
- No category mismatch or double counting was found in the current registry entries. The engine checks identity fields but does not independently enforce that each registry category is semantically valid for its attribute ID; that is a validation-hardening opportunity, not a demonstrated current miscalculation.

## Prioritized unresolved issues and recommendation

1. **Do not generalize Tenacity's experimentally verified result into a universal selector algorithm.** The Paladin starting-board behavior is now complete for the tested boundaries: Strength `>= 630` governs activation and 190 Willpower does not independently activate it. First-class-eligible priority is supported because `StrengthMain1` is the first Paladin-eligible selector, but an unrelated ambiguous node or runtime evidence is still required to establish that rule generally.
2. **Do not generalize formula outputs.** The PowerBudget multiplier implementations and formula/literal precedence are not established. The current observations are safe for their specific node definitions on board 00; the registry intentionally does not apply them to another board.
3. **For `Paragon_Paladin_01`, separate structural work from calculator claims.** It is reasonable to begin loading and validating its pinned board/node definitions. It is **not** yet safe to claim complete raw-bonus calculation for that board: the registry is gated to board SNO `2436481`, and its node-specific observations and threshold coverage do not transfer. Add verified entries and audit every threshold for board 01 before enabling numeric totals there.

## Key pinned sources

- Board: [`json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json).
- Node definitions: [`json/base/meta/ParagonNode/<internal identifier>.pgn.json`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode).
- Thresholds: [`StrengthSide1.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthSide1.pth.json), [`StrengthMain1.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthMain1.pth.json), [`WillpowerMain1.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/WillpowerMain1.pth.json), [`WillPowerSide1.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/WillPowerSide1.pth.json), [`IntelligenceSide2.pth.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/IntelligenceSide2.pth.json).
- Formulas: [`json/base/meta/GameBalance/AttributeFormulas.gam.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json).
