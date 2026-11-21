# Paragon node definition research

## Scope and source

The local [`paladin-board-00.json`](../paladin-board-00.json) has `nWidth: 21` and 441 row-major `arEntries` slots, of which 75 are occupied. Their `__targetFileName__` fields identify 17 unique ParagonNode assets.

I could not locate an accessible public repository at `DiabloTools/d4data`; the matching public data repository I could access was [`blizzhackers/d4data`](https://github.com/blizzhackers/d4data), branch `master`, commit `9cb0119029d79bdb57fb1d8012f19f298a035baa`. It stores parsed files under `json/`, so a target such as `base/meta/ParagonNode/Generic_Normal_Str.pgn` maps to `json/base/meta/ParagonNode/Generic_Normal_Str.pgn.json`. This investigation fetched only the referenced ParagonNode files, not the repository.

Fourteen referenced definitions were available at that revision. `Barbarian_Rare_039`, `Generic_Rare_118`, and `StartNodePaladin` were not present at their expected paths; direct requests and the ParagonNode directory listing confirmed their absence. Do not treat another class's start node or a similarly named rare as a substitute.

## Board references

Counts are occurrences in the local board. Source links point to the exact expected path at the examined commit; entries marked **missing** did not resolve there.

| Node reference | Count | Definition |
|---|---:|---|
| `Generic_Normal_Str` | 22 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Normal_Str.pgn.json) |
| `Generic_Normal_Int` | 13 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Normal_Int.pgn.json) |
| `Generic_Normal_Will` | 10 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Normal_Will.pgn.json) |
| `Generic_Normal_Dex` | 5 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Normal_Dex.pgn.json) |
| `Generic_Magic_Damage` | 6 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_Damage.pgn.json) |
| `Generic_Magic_HPPercent` | 4 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_HPPercent.pgn.json) |
| `Generic_Magic_Armor` | 2 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_Armor.pgn.json) |
| `Generic_Magic_DamageToElite` | 2 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_DamageToElite.pgn.json) |
| `Generic_Magic_Int` | 2 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_Int.pgn.json) |
| `Generic_Magic_Will` | 2 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Magic_Will.pgn.json) |
| `Barbarian_Rare_015` | 1 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json) |
| `Barbarian_Rare_022` | 1 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json) |
| `Barbarian_Rare_039` | 1 | **missing**: `json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json` |
| `Generic_Rare_118` | 1 | **missing**: `json/base/meta/ParagonNode/Generic_Rare_118.pgn.json` |
| `StartNodePaladin` | 1 | **missing**: `json/base/meta/ParagonNode/StartNodePaladin.pgn.json` |
| `Generic_Gate` | 1 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Gate.pgn.json) |
| `Generic_Socket` | 1 | [source](https://github.com/blizzhackers/d4data/blob/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Socket.pgn.json) |

## Definition structure and verified mechanics

The fetched files share the `ParagonNodeDefinition` shape:

- `ptAttributes` is an array of `AttributeSpecifier` records. The readable attribute is `__eAttribute_name__`; `eAttribute` is its numeric ID. `gbidFormula.name` references a GameBalance formula, while `szAttributeFormula.value` may also contain a literal. `nParam` is an additional parameter. Do not treat an empty formula string or a GBID name as a resolved final bonus.
- `eRarityOverride` is present in all fetched definitions. The observed values are `0` on normal, gate, and socket definitions; `2` on magic definitions; and `3` on the two available rare definitions. The field name and observed values are verified; the enum mapping should be checked against its enum definition before using it as authoritative rarity.
- `arThresholdSelector` contains `DT_SNO` references on the two available rare definitions. They identify threshold assets, but their actual conditions/values are not in the node JSON.
- `bHasSocket` and `bIsGate` are explicit mechanics flags: `Generic_Socket` has `bHasSocket: true`; `Generic_Gate` has `bIsGate: true`.
- `snoPassivePower` is `null` in the fetched definitions. `arSkillTags` contains search/category tags. `hIcon` and `hIconMask` are icon identifiers. Fields named `unk_*` remain undocumented here.

Selected node details:

| Definition | Verified fields |
|---|---|
| `Generic_Normal_Str` | `ptAttributes` has `Strength_Core` and `gbidFormula.name: ParagonNodeCoreStat_Normal`; `eRarityOverride: 0`; no threshold selectors. |
| `Generic_Magic_Armor` | `ptAttributes` has `Armor_Bonus` and `gbidFormula.name: ParagonNodeArmorBonusFlat_Magic`; `eRarityOverride: 2`. The node file does not provide a non-empty literal formula value. |
| `Generic_Magic_Damage` | `Damage_Percent_All_From_Skills`, formula reference `ParagonNodeDamageBonus_Magic`; no literal formula value. |
| `Generic_Magic_DamageToElite` | `Damage_Percent_Bonus_Vs_Elites`, `szAttributeFormula.value: "0.05"`, and `ParagonNodeDamageBonusToElite_Magic`. |
| `Generic_Magic_HPPercent` | `Hitpoints_Max_Percent_Bonus`, formula reference `ParagonNodeHPMaxBonus_Magic`; its `szAttributeFormula.value` is `"0"`. |
| `Barbarian_Rare_015` | `eRarityOverride: 3`; `Hitpoints_Max_Percent_Bonus` has literal `"0.06"` and `ParagonNodeHPMaxBonus_RareMajor`; `Armor_Bonus` references `ParagonNodeArmorBonusFlat_RareMinor`. Threshold references: `StrengthSide1`, `StrengthMain1`, `WillpowerMain1`, and `WillPowerSide1`. |
| `Barbarian_Rare_022` | `eRarityOverride: 3`; `Damage_Type_Percent_Bonus` (`nParam: 0`) references `ParagonNodeDamageBonus_RareMajor`; `Hitpoints_Max_Percent_Bonus` references `ParagonNodeHPMaxBonus_RareMinor`. Threshold reference: `StrengthMain1`. |
| `Generic_Gate` | `bIsGate: true`; four `ptAttributes` entries for Strength, Intelligence, Willpower, and Dexterity, each referencing `ParagonNodeCoreStat_Normal`. |
| `Generic_Socket` | `bHasSocket: true`; `ptAttributes` and `arThresholdSelector` are empty. |

## Hypotheses and unresolved questions

- **Verified:** the two `Barbarian_Rare_*` names are literal board references and their available definitions are rare overrides with threshold-selector references. **Unresolved:** why these Barbarian-named nodes are used on this Paladin board; the node data alone does not establish a class restriction or prove the names are erroneous.
- **Unresolved:** attributes whose literal formula is empty or `"0"` need their referenced GameBalance data (and possibly other game data) resolved to determine effective values. No bonus calculator should infer those values from the label alone.
- **Unresolved:** threshold assets such as `StrengthMain1` and `StrengthSide1` need their corresponding `ParagonThreshold` definitions to determine whether/how they gate bonuses. Those non-ParagonNode files were intentionally not fetched in this scoped pass.
- **Unresolved:** exact definitions and mechanics for `StartNodePaladin`, `Generic_Rare_118`, and `Barbarian_Rare_039` require a newer or otherwise matching data source. Their absent files do not establish that the board references are invalid.
- **Hypothesis:** the observed `eRarityOverride` numbers correspond to normal/magic/rare categories as the filenames and attribute formulas suggest. Confirm the enum mapping before relying on it in application logic.
