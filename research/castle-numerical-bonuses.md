# Castle board numerical bonuses

## Scope and evidence model

This report covers Magic and Rare nodes on `Paragon_Paladin_01` (Castle, board SNO `2436511`) at DiabloTools/d4data revision `75e619f0d90a0951945747f45feef59c076a5db0`.

The implementation distinguishes three evidence levels:

- **Direct in-game:** the identical node SNO was already observed on Board 00.
- **Unamplified planner:** the Castle value or requirement was directly observed in Maxroll with Castle immediately after the starting board (`ParagonBoardEquipIndex = 1`).
- **Formula-derived:** the pinned `AttributeFormulas.gam.json` coefficient is evaluated with a shared multiplier calibrated from multiple direct Board 00 observations in this same revision. This is evidence-supported but is not a direct Castle tooltip observation.
- **Unresolved:** either the relevant shared multiplier or the runtime threshold input/semantics is not established.

The calibrated results are internally cross-checked rather than inferred from one formula: Magic Offensive `2.5` reproduces observed Magic Damage `2 × 2.5 = 5` and Damage to Elites `3 × 2.5 = 7.5`; Magic Defensive `2` reproduces Maximum Life `1 × 2 = 2` and Armor `0.75 × 2 = 1.5`; Rare Major Offensive `5` reproduces observed `2 × 5 = 10` and `3 × 5 = 15`; Rare Major Defensive `4` reproduces Tenacity's observed `1 × 4 = 4`; Rare Minor Defensive `4` reproduces Brawn's observed `1 × 4 = 4` and Tenacity's `0.5 × 4 = 2`. The two Castle Rare Minor Offensive node values are now node-scoped planner observations; they do not establish the intrinsic's universal value.

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

The Castle names below are the localized names already resolved in `node-data-01.json`. A marked attribute is the slot listed in `ptBonusAttributeIndices`; Maxroll shows a second copy of that attribute when its equip-index-1 threshold is active.

| Name / definition / SNO | Base bonuses | Additional marked bonus | Confidence |
|---|---|---|---|
| Defiance / `Paladin_Rare_005` / `2449713` | +3% Total Armor; +3% All Resistance | +3% Total Armor | Unamplified planner, equip index 1 |
| Grappler / `Paladin_Rare_006` / `2449715` | +10% Physical Damage; +10% Damage to Crowd Controlled | +10% Physical Damage | Unamplified planner, equip index 1 |
| Ironclad / `Paladin_Rare_007` / `2449717` | +10 Strength; +2% Total Armor | +2% Total Armor | Unamplified planner, equip index 1 |
| Stalwart / `Paladin_Rare_008` / `2449719` | +2.5% Block Chance; +15% Blocked Damage Reduction | +2.5% Block Chance | Unamplified planner, equip index 1 |
| Insulate / `Paladin_Rare_009` / `2449721` | +10% Damage to Crowd Controlled; +3% All Resistance | +10% Damage to Crowd Controlled | Unamplified planner, equip index 1 |
| Knight / `Paladin_Rare_010` / `2449723` | +10% Physical Damage; +10 Strength | +10% Physical Damage | Unamplified planner, equip index 1 |

`ParagonNodeCoreStat_RareMajor` and `ParagonNodeCoreStat_RareMinor` are both the pinned constant `10`. Knight's Rare Minor Strength also matches the already observed +10 result for two Board 00 definitions using that formula.

## Paladin selectors and equip-index-1 thresholds

Each Castle rare definition has one selector, and every referenced selector marks class index 6 usable. The class-order investigation independently established index 6 as Paladin for this revision, so selector eligibility is not ambiguous here.

| Node(s) | Selector | Pinned threshold expression | Equip-index-1 requirement |
|---|---|---|---|
| Defiance | `StrengthMain3` | Strength `890 + (455 × index)` | 1,345 Strength |
| Grappler, Ironclad | `IntelligenceSide1` | Intelligence `190 + (75 × index)` | 265 Intelligence |
| Stalwart | `WillPowerSide3` | Willpower `230 + (75 × index)` | 305 Willpower |
| Insulate, Knight | `Paladin_Strength+Willpower` | Strength `700 + (455 × index)` and Willpower `190 + (70 × index)` | 1,155 Strength **and** 260 Willpower |

The implementation is explicitly scoped to Castle immediately after the starting board: `ParagonBoardEquipIndex = 1`. The observed requirements equal the pinned formulas evaluated at 1. Maxroll also establishes AND semantics for the two-entry Paladin selector in this context. Thresholds use total attributes: external character attributes plus verified attributes from allocated Paragon nodes.

The calculator passes an explicit board-equip-index context (`0` for the starting board, `1` for Castle). The Castle registry is rejected at any other index, leaving its non-core values unresolved. Other equip positions remain unresolved until separately observed.

## Remaining unresolved mechanics

- Castle Rare requirements at equip positions other than 1.
- A universal value for `ParagonPowerBudgetMultiplierNodeRareMinorOffensive()`; the two observed node outputs are registered by node identity rather than generalized.
- Legendary Castle power and glyph effects remain out of scope.

A targeted audit found 53 formula-table call sites for `ParagonPowerBudgetMultiplierNodeRareMinorOffensive()` but zero formula-table entries defining the intrinsic itself. Grappler's observed +10% Damage to Crowd Controlled and Stalwart's observed +2.5% Block Chance resolve these two nodes only.

Threshold selector choice is structurally unambiguous: each Castle rare node references exactly one selector, and that selector marks Paladin class index 6 usable. No first-eligible-selector rule is needed for these definitions.

