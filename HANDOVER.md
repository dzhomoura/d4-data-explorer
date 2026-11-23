# Diablo IV Paladin Paragon Calculator — Handover

## Project overview

This is a dependency-free browser viewer/calculator for Diablo IV Paladin Paragon boards. It currently supports:

- **Board 00 — Starting Board** (SNO `2436481`)
- **Board 01 — Castle** (SNO `2436511`), modeled as the first additional board (`ParagonBoardEquipIndex = 1`)
- **Board 02 — Shield Bearer** (SNO `2436844`), with complete ordinary numerical bonuses at equip index 2
- **Board 03 — Fervent** (SNO `2438913`), with complete ordinary numerical bonuses at equip index 3
- **Board 04 — Preacher** (SNO `2438973`), with complete ordinary numerical bonuses at equip index 4
- **Board 05 — Divinity** (SNO `2438992`), with complete ordinary numerical bonuses at equip index 5
- **Board 06 — Relentless** (SNO `2439024`), with complete ordinary numerical bonuses at equip index 6
- **Board 07 — Sentencing** (SNO `2439031`), with complete ordinary numerical bonuses at equip index 7
- **Board 08 — Endure** (SNO `2439033`), with complete ordinary numerical bonuses at equip index 8
- **Board 09 — Beacon** (SNO `2439035`), with complete ordinary numerical bonuses at equip index 9

`paragon-visual/app.js` loads board/node JSON, merges revision-pinned definitions from `shared-node-definitions.js` according to board SNO, renders the 21×21 grid, manages zoom/pan/tooltips and allocation connectivity, persists independent allocations, and passes allocated indices plus external attributes to the pure calculation module. `paragon-calculator.js` validates board/node identity and combines pinned core-stat formulas with board-scoped records from `paragon-bonus-registry.js`. Missing or mismatched numerical evidence is reported as unresolved rather than zero. The collapsible Total Stats panel floats inside the board viewport and derives Paragon-only totals and hover contributors from calculator node evaluations, excluding external attributes and inactive conditionals.

Boards 01–09 have no authored starting node. The viewer lets the user choose one of their four gates as a **local allocation anchor**.

## Data source

All extracted structure is pinned to DiabloTools/d4data revision:

`75e619f0d90a0951945747f45feef59c076a5db0`

Relevant upstream paths:

- `json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_01.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_02.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_03.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_04.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_05.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_06.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_07.pbd.json` through `Paragon_Paladin_09.pbd.json`
- `json/base/meta/ParagonNode/*.pgn.json`
- `json/base/meta/ParagonThreshold/*.pth.json`
- `json/base/meta/GameBalance/AttributeFormulas.gam.json`
- `json/enUS_Text/meta/StringList/ParagonBoard_Paragon_Paladin_*.stl.json` and `ParagonNode_*.stl.json` for localized board and node names

Local board copies are `paladin-board-00.json` through `paladin-board-09.json`. Board-specific node metadata is in `paragon-visual/node-data.json` and `node-data-01.json` through `node-data-09.json`. Reusable definitions live in `paragon-visual/shared-node-definitions.js` with explicit board-SNO applicability. Loading rejects duplicate names, duplicate SNOs, conflicts, unsupported boards, revision mismatches, and formula-source mismatches.

Shared definitions include the four Normal core-stat nodes, the Gate, and Magic Intelligence and Willpower on all boards. Magic Maximum Life applies to 00–05 and 07–09, Magic Armor to 00/01/09, Magic Block Chance to 01/02/09, Magic Damage to Crowd Controlled to 01/02, Magic Physical Damage to 01–03, and Magic Damage to 00/02/05/07–09. Numerical resolution requires the calculator's pinned formula checks or the applicable board-scoped bonus registry.

Remaining board-specific definitions include Board 00's Magic Damage to Elites, Rares, socket, and start node; Board 01's Magic Armor Percent, All Resistance, and Strength plus its Rares, socket, and Legendary; and Board 02's Magic Thorns, Rares, socket, and Legendary. Rare and Legendary definitions were not moved.

Board 03 keeps board-specific definitions for Magic Armor Percent, All Resistance, Critical Strike Damage, and Faith, plus its six Rares, socket, and Legendary.

## Implemented and verified functionality

All ten boards share node rendering, tooltips, zoom/pan, orthogonal allocation/refund rules, raw-bonus display, and manual external-attribute inputs. Switching boards preserves independent allocations and rotations.

External attributes remain editable and locally persisted above the board. Verified and total-threshold breakdowns, raw bonuses, unresolved diagnostics, and provenance are retained in a closed-by-default **Advanced Calculation Details** section. The detailed raw-bonus view includes flat Thorns with Base / Conditional / Total values and no percent suffix.

### Board 00

- 75 occupied cells and 17 definitions.
- Normal core nodes grant `+5`; Magic core nodes grant `+7`; the gate grants `+5` to all four core attributes.
- Verified Magic values: Damage `+5%`, Damage to Elites `+7.5%`, Maximum Life `+2%`, Total Armor `+1.5%`.
- Verified Rare values and conditions:
  - **Brawn:** Damage `+10%` plus conditional `+10%`; Maximum Life `+4%`; condition `630 Strength`.
  - **Tenacity:** Maximum Life `+4%` plus conditional `+4%`; Total Armor `+2%`; condition `630 Strength`. A four-state in-game test confirmed that 190 Willpower does not independently activate it.
  - **Raw Power:** Damage `+10%` plus conditional `+10%`; Strength `+10`; condition `210 Intelligence`.
  - **Iron Strength:** Damage to Elites `+15%` plus conditional `+15%`; Strength `+10`; condition `190 Willpower`.
- Full-board structural regression at zero external attributes: Strength `135`, Intelligence `84`, Willpower `69`, Dexterity `30`; Damage `50%`, Damage to Elites `30%`, Maximum Life `16%`, Total Armor `5%`; zero unresolved bonuses. This is a diagnostic, not a valid allocated build.

### Board 01 — Castle at equip index 1

- 191 occupied cells and 23 definitions: 149 Normal, 30 Magic, 6 Rare, 4 gates, 1 socket, and 1 Legendary.
- Normal/Magic core values remain `+5`/`+7`.
- Resolved Magic values include Total Armor `+1.5%`, Block Chance `+2%`, Physical Damage `+5%`, Damage to Crowd Controlled `+8.75%`, Maximum Life `+2%`, and All Resistance `+1.5%`. Evidence is a mixture of identical observed SNOs and pinned-formula derivation; see the Castle research file.
- User-supplied unamplified Maxroll observations resolve all six Rare nodes:

| Node | Base bonuses | Conditional bonus and equip-index-1 requirement |
|---|---|---|
| Grappler | `+10%` Physical; `+10%` Damage to CC | `+10%` Physical at `265 Intelligence` |
| Ironclad | `+10 Strength`; `+2%` Armor | `+2%` Armor at `265 Intelligence` |
| Knight | `+10%` Physical; `+10 Strength` | `+10%` Physical at `1,155 Strength AND 260 Willpower` |
| Stalwart | `+2.5%` Block Chance; `+15%` Blocked Damage Reduction | `+2.5%` Block Chance at `305 Willpower` |
| Insulate | `+10%` Damage to CC; `+3%` All Resistance | `+10%` Damage to CC at `1,155 Strength AND 260 Willpower` |
| Defiance | `+3%` Armor; `+3%` All Resistance | `+3%` Armor at `1,345 Strength` |

Threshold evaluation uses total character attributes: external inputs plus verified attributes from allocated Paragon nodes. Base and conditional totals remain separate. The Castle registry is rejected for any equip index other than 1.

### Board 02 — Shield Bearer

- 164 occupied cells and 21 merged definitions. Occupied nodes comprise 122 Normal, 30 Magic, 6 Rare, 4 gates, 1 socket, and 1 Legendary.
- The four generic Normal definitions, the Gate, and Magic Intelligence/Willpower are shared with Boards 00/01. Normal and Gate core attributes resolve to the pinned `ParagonNodeCoreStat_Normal = 5`; Magic Intelligence/Willpower resolve to `ParagonNodeCoreStat_Magic = 7`. Repeated allocations accumulate normally.
- The Board 02 registry reuses the direct Board 00 observations for the identical `Generic_Magic_Damage` and `Generic_Magic_HPPercent` source nodes: Damage `+5%` and Maximum Life `+2%`. These are SNO-scoped records, not global formula rules.
- Board 02 also has a narrow node-identity reuse link to Castle's formula-derived records for identical source nodes: `Generic_Magic_DamagePhysical` `+5%`, `Generic_Magic_BlockChance` `+2%`, and `Generic_Magic_DamageToCC` `+8.75%`. The link checks source revision, SNO, node name, and source path; it neither reclassifies provenance nor exposes Castle Rare records or thresholds.
- Direct Board 02 observations resolve `Generic_Magic_Thorns` as `+100` flat Thorns and `Paladin_Rare_008` (Stalwart) as `+2.5%` Block Chance / `+15%` Blocked Damage Reduction, plus another `+2.5%` Block Chance at 305 Willpower. Planner observations resolve `Paladin_Rare_012` (Bludgeoning) as `+10%` Damage, `+10%` Damage to Crowd Controlled, plus `+10%` Damage at 1,345 Strength; and `Paladin_Rare_015` (Bodyguard) as `+10%` Physical Damage, `+2.5%` Block Chance, plus `+10%` Physical Damage at 1,155 Strength **and** 260 Intelligence. Planner records remain scoped to Board 02's index-2 calculation context; the new Thorns/Stalwart records retain `direct-in-game` provenance.
- Corrected direct observations resolve both remaining Thorns Rares: `Paladin_Rare_011` / Growth (SNO `2449751`) grants `+150` flat Thorns and `+4%` Maximum Life, plus another `+150` Thorns at 1,215 Strength through `StrengthMain2`; `Paladin_Rare_013` / Constrict (SNO `2449755`) grants `+150` flat Thorns and `+10 Strength`, plus another `+150` Thorns at 305 Willpower through `WillPowerSide3`. The user-supplied `2449735` is not present in the pinned board; `2449755` is the verified source SNO used by the registry.
- Layout, rarity styling, tooltips, independent allocation persistence, and the four source-coordinate gates are implemented.
- Direct in-game observations on Shield Bearer resolve Knight (`Paladin_Rare_010`, SNO `2449723`) at equip index 2. Its base bonuses are `+10% Physical Damage` and `+10 Strength`. It grants another `+10% Physical Damage` when total attributes meet **1,155 Strength AND 260 Willpower**. The pinned node marks attribute slot 0 and references the `Paladin_Strength+Willpower` selector (SNO `2504901`). This board-scoped observation supersedes the earlier base-only Castle link.
- Board 02 has complete ordinary numerical coverage at equip index 2, including all six Rare conditionals. The Legendary power remains unresolved.

### Board 03 — Fervent

- The pinned 21×21 grid contains 156 occupied cells and 21 merged definitions. It has 114 Normal, 30 Magic, six Rare, four Gate, one Socket, and one Legendary cell. The grid, English Rare names, attribute slots and parameters, and threshold selectors come from the pinned data.
- Verified pinned core-stat formulas give Normal nodes +5, Gates +5 to each core attribute, and Magic Intelligence/Willpower +7 each.
- The Fervent registry uses equip context 3. Exact node links reuse Board 00's direct +2% Maximum Life observation (SNO `679184`) and Castle's formula-derived +5% Physical Damage (`678822`), +1.5% Total Armor (`2127186`), and +1.5% Resistance to All Elements (`678750`). The links preserve each record's provenance and scope reuse to matching source revision, SNO, name, and path.
- Magic Critical Strike Damage (`Generic_Magic_CriticalDamage`, `671242`) is formula-derived at +7.5%. The pinned `ParagonNodeCritDamage_Magic` uses `3 * ParagonPowerBudgetMultiplierNodeMagicOffensive()`. The existing 2.5 calibration reproduces both Board 00 Magic Damage and Damage to Elites observations. [Pinned formula table](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json)
- Magic Maximum Faith (`Paladin_Magic_Faith`, `2525975`) grants +2 flat Maximum Faith per allocated node, from a direct in-game observation. The pinned node uses `Resource_Max_Bonus` (161, parameter 9) and references `ParagonNodeResourceBonus_Magic`, whose expression is `.8 * 100 * ParagonPowerBudgetMultiplierNodeMagicOffensive()`. The general conversion from raw formula output to displayed Faith remains unverified.
- The Rare base bonuses, conditional amounts, and equip-index-3 requirements below are direct in-game observations. Pinned node definitions identify the marked slot and selector, and pinned threshold definitions identify the required attributes. The observed runtime requirements are recorded directly because substituting 3 into the authored expressions gives different values. Each condition uses external attributes plus verified allocated Paragon attributes. Both attributes must meet their requirements for a paired threshold.

| Node / source SNO | Observed base bonuses | Observed extra bonus and equip-index-3 requirement | Datamined selector |
|---|---|---|---|
| Constitution · `Paladin_Rare_055` · `2449944` | +3% Resistance to All Elements, +4% Maximum Life | +3% Resistance to All Elements at 1,085 Strength | `StrengthMain1` |
| Sturdy · `Paladin_Rare_054` · `2449942` | +3% Total Armor, +4% Maximum Life | +3% Total Armor at 265 Intelligence | `IntelligenceSide1` |
| Knight · `Paladin_Rare_010` · `2449723` | +10 Strength, +10% Physical Damage | +10% Physical Damage at 1,155 Strength AND 260 Willpower | `Paladin_Strength+Willpower` |
| Fencing · `Paladin_Rare_021` · `2449771` | +15% Critical Strike Damage, +10 Strength | +15% Critical Strike Damage at 1,155 Strength AND 260 Intelligence | `Paladin_Strength+Intelligence` |
| Surgical · `Paladin_Rare_018` · `2449765` | +15% Critical Strike Damage, +4 Maximum Faith | +4 Maximum Faith at 1,345 Strength | `StrengthMain3` |
| Skirmish · `Paladin_Rare_017` · `2449763` | +2% Total Armor, +10% Physical Damage | +10% Physical Damage at 1,155 Strength AND 260 Willpower | `Paladin_Strength+Willpower` |

Fervent displays Critical Strike Damage as a percentage and Maximum Faith as a flat value. Tooltips display threshold progress, and the raw bonus breakdown shows base and active conditional amounts separately. The Legendary power remains unresolved. Fervent is available in the single-board viewer.

### Boards 04–06 — Preacher, Divinity, and Relentless

The board names come from the pinned English localization. Each 21×21 grid contains 30 Magic, six Rare, four Gate, one Socket, and one Legendary cell. Gates occupy zero-based coordinates `(10, 0)`, `(0, 10)`, `(20, 10)`, and `(10, 20)`. The viewer evaluates each board's direct Rare observations only in its calculation context of 4, 5, or 6. Gate anchoring remains a local allocation feature.

| Board / SNO | Occupied cells / merged definitions | Reused Magic values |
|---|---:|---|
| Preacher / `2438973` | 160 / 22 | +2% Maximum Life, +1.5% Resistance to All Elements |
| Divinity / `2438992` | 185 / 21 | +5% Damage, +2% Maximum Life, +1.5% Total Armor, +1.5% Resistance to All Elements |
| Relentless / `2439024` | 171 / 20 | +1.5% Total Armor, +1.5% Resistance to All Elements, +6% Vulnerable Damage |

- All three use +5 Normal core stats, +5 to each core stat on Gates, and +7 Magic Intelligence and Willpower from verified pinned core-stat formulas. The exact-SNO Magic links preserve direct in-game provenance for Board 00 Maximum Life (`679184`) and Damage (`678754`), and Castle's formula-derived provenance for Armor Percent (`2127186`) and Resistance to All Elements (`678750`).
- Earlier implementation reused the Sturdy base from Fervent's direct in-game observation and the Defiance base from Castle's unamplified planner observation. Both values are now independently observed with their conditions on the applicable new boards. The original records remain on Fervent and Castle.
- Preacher's direct Magic observations are +5% Damage while Fortified (`679050`), +6.3% Damage while Healthy (`679054`), +1.3% Attack Speed (`679060`), +1.6% Fortify Generation (`1023952`), and +3% Healing Received (`1195913`). The pinned `Generic_Magic_HealingBonus` definition has `Bonus_Healing_Received_Percent` (65) in slot 0 and references `ParagonNodeHealingBonus_Magic`. Its three cells are at grid indices `276`, `296`, and `298`. Allocating all three adds +9% Healing Received without glyph amplification.
- Divinity's direct Magic observations are +6% Vulnerable Damage (`678863`) and +1.5% Total Armor (`691371`). SNO `691371` retains its internal name `Generic_Magic_DamageReductionFromVulnerable`. Its pinned `Armor_Percent` attribute and observed tooltip both identify Total Armor.
- Relentless's direct Magic observations are +1% Cooldown Reduction (`679022`) and +2% Movement Speed (`679218`). It reuses the Divinity Vulnerable Damage observation for the identical `Generic_Magic_DamageToVulnerable` definition and SNO `678863`, preserving direct in-game provenance and using Relentless's registry scope.

The Rare amounts and requirements below are direct in-game observations. Pinned definitions verify the node, bonus slot, attribute identity, and selector. Requirements use total character attributes, including external inputs and verified allocated Paragon stats. Base bonuses apply whenever the node is allocated. Both requirements must pass for paired conditions.

| Board | Rare node / SNO | Observed base | Observed extra bonus and requirement | Pinned selector |
|---|---|---|---|---|
| 04 | Friction / `2449777` | +3% All Resistance, +1.3% Attack Speed | +3% All Resistance at 1,215 STR | `StrengthMain2` |
| 04 | Recovery / `2449780` | +6% Healing Received, +4% Maximum Life | +6% Healing Received at 1,345 STR | `StrengthMain3` |
| 04 | Bolster / `2449782` | +3.2% Fortify Generation, +4% Maximum Life | +3.2% Fortify Generation at 1,085 STR | `StrengthMain1` |
| 04 | Hearty / `2449784` | +4% Maximum Life, +10 STR | +4% Maximum Life at 265 WIL | `WillPowerSide1` |
| 04 | Whale / `2449786` | +1.3% Attack Speed, +10 STR | +1.3% Attack Speed at 265 INT | `IntelligenceSide1` |
| 04 | Inner Strength / `679987` | +10% Damage while Fortified, +12.5% Damage while Healthy | +10% Damage while Fortified at 285 WIL | `WillPowerSide2` |
| 05 | Champion / `2449940` | +10% Damage, +10 STR | +10% Damage at 265 WIL | `WillPowerSide1` |
| 05 | Flayer / `671197` | +13% Vulnerable Damage, +10 STR | +13% Vulnerable Damage at 285 WIL | `WillPowerSide2` |
| 05 | Cautious Fighter / `2449796` | +10% Damage, +3% All Resistance | +10% Damage at 1,085 STR | `StrengthMain1` |
| 05 | Oppressive / `2504935` | +13% Vulnerable Damage, +2% Total Armor | +13% Vulnerable Damage at 285 INT | `IntelligenceSide2` |
| 05 | Defiance / `2449713` | +3% Total Armor, +3% All Resistance | +3% Total Armor at 1,345 STR | `StrengthMain3` |
| 05 | Sturdy / `2449942` | +3% Total Armor, +4% Maximum Life | +3% Total Armor at 265 INT | `IntelligenceSide1` |
| 06 | Dervish / `2449810` | +10 STR, +2% Cooldown Reduction | +2% Cooldown Reduction at 305 INT | `IntelligenceSide3` |
| 06 | Endure / `2449913` | +3% All Resistance, +10 STR | +3% All Resistance at 305 WIL | `WillPowerSide3` |
| 06 | Inured / `2449804` | +2% Cooldown Reduction, +2% Total Armor | +2% Cooldown Reduction at 265 INT | `IntelligenceSide1` |
| 06 | Defiance / `2449713` | +3% Total Armor, +3% All Resistance | +3% Total Armor at 1,345 STR | `StrengthMain3` |
| 06 | Battering Ram / `2449800` | +5% Movement Speed, +2% Total Armor | +5% Movement Speed at 1,155 STR AND 260 INT | `Paladin_Strength+Intelligence` |
| 06 | Cull / `2449802` | +13% Vulnerable Damage, +5% Movement Speed | +13% Vulnerable Damage at 1,155 STR AND 260 WIL | `Paladin_Strength+Willpower` |

Inner Strength's pinned `Druid_Willpower+Dexterity` selector is ineligible for Paladin. The Paladin observation matches `WillPowerSide2`. Dervish marks zero-based slot 1 for its Cooldown Reduction conditional. Damage while Fortified and while Healthy are shown as separate raw bonus categories. Totals track the allocated per-node contributions.

### Boards 07–09 — Sentencing, Endure, and Beacon

Board and Rare names are from the pinned English string lists. Each 21×21 grid has 30 Magic cells, six Rare cells, four gates at indices `10`, `210`, `230`, and `430`, one socket, and one Legendary. Endure has two Restorative cells that share a single definition (SNO `680037`).

| Board / SNO | Occupied / merged definitions | Normal cells | Legendary node SNO |
|---|---:|---:|---:|
| 07 Sentencing / `2439031` | 162 / 23 | 120 | `2438124` |
| 08 Endure / `2439033` | 174 / 19 | 132 | `2438126` |
| 09 Beacon / `2439035` | 171 / 24 | 129 | `2438128` |

All three use the pinned formulas for Normal core stats (+5), Gates (+5 to each core stat), and Magic Intelligence and Willpower (+7). The registry links below require matching source revision and node identity. The original evidence provenance is preserved.

| Boards | Reused Magic bonuses | Evidence |
|---|---|---|
| 07–09 | Damage +5% (`678754`), Maximum Life +2% (`679184`) | Board 00 direct in-game |
| 07 | Armor +1.5% (`2127186`) | Castle formula-derived |
| 07, 09 | All Resistance +1.5% (`678750`) | Castle formula-derived |
| 07, 08 | Healing Received +3% (`1195913`) | Preacher direct in-game |
| 07, 09 | Attack Speed +1.3% (`679060`) | Preacher direct in-game |
| 08 | Lucky Hit Chance +1.3% (`1340824`) | Sentencing direct in-game |
| 09 | Armor +1.5% (`671247`) | Board 00 direct in-game |
| 09 | Block Chance +2% (`2063114`) | Castle formula-derived |
| 09 | Critical Strike Damage +7.5% (`671242`), Maximum Faith +2 flat (`2525975`) | Fervent formula-derived Critical Strike Damage and direct in-game Faith |

#### Sentencing at equip index 7

Direct, unamplified in-game observations resolve Magic Lucky Hit Chance at +1.3% (`1340824`) and Magic Judgement Damage at +5% (`2500772`). Each appears three times, for +3.9% Lucky Hit Chance and +15% Judgement Damage from those Magic cells. Holy Damage, Judgement Damage, and Lucky Hit Chance have separate percentage totals in Total Stats and raw-bonus details. The six prior Magic links remain in use.

| Rare node / SNO | Base bonuses | Observed conditional and requirement | Pinned selector |
|---|---|---|---|
| Endure / `2449913` | +3% Resistance to All Elements, +10 Strength | +3% Resistance to All Elements at 305 Willpower | `WillPowerSide3` |
| Grace / `2449915` | +2.5% Lucky Hit Chance, +10 Strength | +2.5% Lucky Hit Chance at 265 Willpower | `WillPowerSide1` |
| Luminous / `2449918` | +10% Holy Damage, +1.3% Attack Speed | +10% Holy Damage at 265 Intelligence | `IntelligenceSide1` |
| Sturdy / `2449942` | +3% Total Armor, +4% Maximum Life | +3% Total Armor at 265 Intelligence | `IntelligenceSide1` |
| Restorative / `680037` | +4% Maximum Life, +6% Healing Received | +4% Maximum Life at 285 Willpower | `WillPowerSide2` |
| Benediction / `2449924` | +17.5% Judgement Damage, +6% Healing Received | +17.5% Judgement Damage at 1,345 Strength | `StrengthMain3` |

Endure and Sturdy keep their exact-node bases from Relentless and Fervent respectively. Their conditional amounts and requirements are recorded independently from Sentencing's direct in-game observations. All six conditionals apply to slot 0 and use external attributes plus verified allocated Paragon stats. Restorative also has an authored `IntelligenceSide2` selector. The observed Sentencing bonus uses only `WillPowerSide2`. Luminous uses `Damage_Type_Percent_Bonus` (254, parameter 6). Both Judgement nodes use `Power_Damage_Percent_Bonus` (984, parameter 2263340). Lucky Hit Chance uses `Combat_Effect_Chance_Bonus` (1207, parameter -1).

#### Endure at equip index 8

Magic Life Regeneration after taking no damage (`Generic_Magic_HPRegen`, SNO `679136`) grants +107 Life per 5 Seconds per cell from a direct, unamplified in-game observation. The three cells at indices `247`, `267`, and `268` contribute +321 Life per 5 Seconds. Radiance contributes another +215 for a total of +536 when all four are allocated. The pinned attribute is `No_Damage_Taken_Flat_Hitpoints_Regen_Per_Second` (649, parameter -1). The registry stores the observed tooltip values in a distinct flat Life per 5 Seconds category, displayed in tooltips, raw-bonus details, and Total Stats.

The three Magic Lucky Hit Chance cells at indices `48`, `69`, and `71` reuse Sentencing's +1.3% direct observation through the exact revision and node identity link. Together they grant +3.9%.

| Rare node / SNO | Base bonuses | Observed conditional and requirement | Pinned selector |
|---|---|---|---|
| Restorative / `680037` | +4% Maximum Life, +6% Healing Received | +4% Maximum Life at 285 Willpower | `WillPowerSide2` |
| Radiance / `2449928` | +10% Holy Damage, +215 Life per 5 Seconds | +10% Holy Damage at 1,345 Strength | `StrengthMain3` |
| Anointed / `2449931` | +6% Healing Received, +10% Holy Damage | +6% Healing Received at 265 Willpower | `WillPowerSide1` |
| Wrathful / `2449936` | +10% Holy Damage, +10 Strength | +10% Holy Damage at 285 Willpower | `WillPowerSide2` |
| Grace / `2449915` | +2.5% Lucky Hit Chance, +10 Strength | +2.5% Lucky Hit Chance at 265 Willpower | `WillPowerSide1` |

All five Rare definitions have direct in-game provenance for Endure, with slot 0 marked for the conditional. Thresholds use external attributes plus verified allocated Paragon stats. Both Restorative cells (`158` and `326`) use one definition and contribute independently. With both allocated they grant +8% base Maximum Life and +12% Healing Received, plus another +8% Maximum Life at 285 Willpower. The node also has an authored `IntelligenceSide2` selector. The observed Endure bonus uses only `WillPowerSide2`.

#### Beacon at equip index 9

All six Rare bonuses and requirements are direct, unamplified in-game observations for Beacon. The pinned nodes mark slot 0 for the conditional. Requirements use external attributes plus verified allocated Paragon stats. Sturdy and Constitution retain their exact-node bases from Fervent, and Champion retains its base from Divinity.

| Rare node / SNO | Base bonuses | Observed conditional and requirement | Pinned selector |
|---|---|---|---|
| Sturdy / `2449942` | +3% Total Armor, +4% Maximum Life | +3% Total Armor at 265 Intelligence | `IntelligenceSide1` |
| Spiked Shield / `2449949` | +2.5% Block Chance, +10% Damage | +2.5% Block Chance at 265 Willpower | `WillPowerSide1` |
| Constitution / `2449944` | +3% Resistance to All Elements, +4% Maximum Life | +3% Resistance to All Elements at 1,085 Strength | `StrengthMain1` |
| Blurring / `2449946` | +15% Critical Strike Damage, +1.3% Attack Speed | +15% Critical Strike Damage at 1,085 Strength | `StrengthMain1` |
| Fortitude / `2449951` | +4 flat Maximum Faith, +10 Strength | +4 flat Maximum Faith at 265 Intelligence | `IntelligenceSide1` |
| Champion / `2449940` | +10% Damage, +10 Strength | +10% Damage at 265 Willpower | `WillPowerSide1` |

Fortitude uses `Resource_Max_Bonus` (161, parameter 9). Allocating the three Magic Faith cells and Fortitude gives +10 flat Maximum Faith, or +14 when the Intelligence threshold is met.

Beacon records **+1.5% Total Armor per cell** for `Generic_Magic_DamageReductionFromElite` (`679347`) from a direct, unamplified in-game observation, scoped to Board 09 at equip index 9 and the pinned source identity. It and `Generic_Magic_Armor` (`671247`) both have one attribute in slot 0, `Armor_Percent` (482, parameter -1), and the same `ParagonNodeArmorBonus_Magic` reference (GBID `4074312502`). Their flat attribute-level formula is `0` in both cases. The node attribute literal is `0` for `679347` and empty for `671247`. The two Armor SNOs retain separate identities. The three cells of `679347` contribute +4.5% Total Armor, and the two cells of `671247` bring the combined Magic total to +7.5%.

Before the direct observation, Beacon used a formula-derived +1.5% for `679347`. The pinned formula uses `0.75 * ParagonPowerBudgetMultiplierNodeMagicDefensive()`, and a multiplier of 2 reproduces the direct Board 00 Magic Armor and Maximum Life observations. Divinity's directly observed +1.5% Armor node `691371` matches the pinned fields of `679347` except for the SNO and file name, including the zero literal. [Pinned Armor formula table](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json)

The Legendary power on each board remains unresolved.

### Board rotation

The Rotation selector beside the board selector offers 0°, 90°, 180°, and 270° clockwise on Boards 01–09. Board 00 is fixed at 0°. A rotation takes effect immediately and preserves the current zoom, pan, allocated source indices, and source gate anchor.

`paragon-visual/board-rotation.js` exposes the pure `rotateBoardPoint(x, y, width, rotation)` transform. The viewer moves the existing cells into rotated row-major order, projects both SVG connection layers onto those cells, and derives each gate's displayed compass direction from its rotated edge. Input handlers and tooltips retain the original source indices. The graph stays in source coordinates because quarter turns preserve orthogonal adjacency. The calculator still receives the pinned board data, source-index allocation set, and the board's existing equip context.

Single-board entry anchors serve only their board's internal allocation graph. The Connected Boards prototype uses a separate draft and a root on the Starting Board.

### Connected Boards

Select **Connected Boards** to open the saved planner or start a draft with Starting Board alone. Open any visible gate to attach an unused board or manage the gate's allocation. The tree supports up to five equipped boards, including Starting. Each additional header shows the placement number and offers rotation and removal.

The pinned Starting Board has one `Generic_Gate` at source index `10`, coordinate `(10, 0)`. Its actual starting node is at index `304`. Castle has gates at source indices `10`, `210`, `230`, and `430` and no starting node. At Castle angles 0°, 90°, 180°, and 270°, its facing gate uses indices `430`, `230`, `10`, and `210` respectively. The shared gate definition has `bIsGate` and four core-stat slots verified at +5 each. The pinned assets contain no attachment graph, entry-selection rule, automatic allocation flag, or gate costs. [Pinned Starting Board](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json), [Pinned Castle](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonBoard/Paragon_Paladin_01.pbd.json), [Pinned gate definition](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Gate.pgn.json)

Blizzard's 2021 design overview describes unlocking a gate to attach another board and optionally rotating it. It gives historical context while leaving the pinned revision's exact attachment and entry purchase rules open. The prototype permits layout preview before allocation and models facing gates one grid step apart. Both gates require explicit allocation and cost one point each. Starting's actual starting node is free. East, south, and west attachments from Starting are unavailable because it has no gates there. [Blizzard's Paragon design overview](https://news.blizzard.com/en-gb/article/23746639/diablo-iv-quarterly-updatedecember-2021)

`connected-boards.js` builds the allocation graph in `(instanceId, sourceNodeIndex)` identities. Each board contributes its internal orthogonal edges and each attachment contributes its explicit gate bridge. Allocations must be reachable from Starting's source index `304` within the allocated subgraph. Attachment grants no nodes. Each gate costs one point when explicitly allocated. Refunds and topology changes that would disconnect existing allocations are rejected.

The connected calculator first collects unconditional core gains from all placed boards. It then evaluates each board's thresholds with external attributes plus the other boards' core gains, and sums the resulting Paragon-only bonuses once. The wrapper rejects conditional core gains because they would require a different threshold evaluation strategy. Glyph effects and Legendary powers remain unresolved.

### UI redesign Phase 1 — Floating Total Stats

The board canvas fills the available width. In `paragon-visual/index.html`, a shared viewport contains the interactive canvas and a native Total Stats disclosure. The panel starts expanded and retains its open or closed state when switching between single-board and Connected Boards modes. Point Allocation and External Attributes are above the canvas. The legend and collapsible Advanced Calculation Details are below it.

`paragon-visual/style.css` anchors the translucent panel to the bottom-right of the viewport and gives the stat list a scrollable body with tighter size limits on small screens. `paragon-visual/app.js` uses the existing live totals, formatting, and contributor highlights. The panel clears highlights when it closes. Its position outside the interactive canvas element keeps its pointer, wheel, and touch interactions independent of the board.

### UI redesign Phase 2 — Contextual board headers

`paragon-visual/index.html` defines the two Connected Boards headers. Starting Board has a fixed name and board number. Castle shows its board number and current angle between labeled 90° rotation buttons. Phase 2 retained the gate selectors until the Phase 3 picker replaced them.

`paragon-visual/app.js` anchors the headers to the board origins in the shared world frame. Castle's header sits above its north edge, and Starting Board's label sits in the empty upper-left area. Connected Boards fits the canvas with room for Castle's header. `paragon-visual/style.css` keeps the headers close to screen size at different zoom levels and leaves room in Castle's header for future board actions. Header interactions are isolated from canvas dragging, zooming, and node selection.

Castle's buttons use the existing attachment validation and save path. A successful rotation updates the angle and source gate together while preserving allocations, pan, zoom, and button focus. A rejected rotation keeps the last valid layout and draft and reports the reason through Point Allocation.

### UI redesign Phase 3 — Gate-driven board picker

Click the Starting Board's only `Generic_Gate` at source index `10`, or focus it and press Enter or Space, to open the picker. The picker is available before the allocation path reaches the gate. Its separate **Allocate gate** action becomes available when the gate is reachable and spends one point. Once the gate is allocated, **Refund gate** uses the existing connectivity rule, as does right-clicking the node. Single-board gates and Castle's gate keep their original node actions.

In the Phase 3 prototype, the picker listed all nine additional boards and Castle was the available choice. Every draft already included Castle. Stage 3 replaced confirmation of that fixed placement with interactive attachment and a version 2 draft.

`paragon-visual/index.html` and `style.css` define a viewport-bound modal with a scrollable board list. `paragon-visual/app.js` connects it to the Starting gate and measures the visible viewport independently of the board transform. Escape, the close button, and outside clicks dismiss the picker and return focus to the gate. The picker replaces the permanent gate selectors and shows Castle's current source edge for diagnostics.

### Multi-board implementation Stage 1 — Board instance layout

`buildBoardInstanceLayout(resources, instances)` in `paragon-visual/connected-boards.js` builds a tree of up to five boards from pinned Paladin definitions. Each instance supplies `instanceId`, catalog `boardId`, `placementIndex`, clockwise `rotation`, and its `incoming` attachment. Starting has placement index 0, rotation 0, and `incoming: null`. An additional board identifies its parent instance and both source gate indices. Indices are explicit and contiguous, and a parent must precede its children. Input array order does not determine placement.

The builder derives outgoing attachments, gate occupancy, signed world origins relative to Starting, and normalized display origins. It validates unique board definitions and instance IDs, a fixed Starting Board, supported rotations, parent order, facing source gates, gate reuse, and board footprint overlap. The separate allocation graph uses internal orthogonal edges and explicit gate pairs. Adjacent boards without an attachment share no allocation edge.

`buildConnectedLayout` adapts the existing Starting + Castle attachment to the tree with instance IDs `board00` and `board01`, at placements 0 and 1. The version 1 reader validates the old draft against the tree. The writer accepts only a matching two-board layout and emits the existing shape under the existing key. Reading a draft does not write it back. If a stored draft cannot be read, the UI shows the fallback preview in memory and protects the original stored value from writes.

The Stage 1 UI opened Starting + Castle, with Castle as the only selectable picker entry. The layout builder exposed `placementIndex` to the Stage 2 calculator. New attachments in the picker and board-management operations remain deferred.

### Multi-board implementation Stage 2 — Dynamic Rare thresholds

`calculateParagonBonuses` accepts an explicit `{ placementIndex }` context. Starting uses 0 and additional boards use 1–4. `calculateConnectedBonuses` passes that index from each board instance and evaluates against external attributes plus verified allocated core gains from every placed board. Stage 2 supported numerical evaluation of five-board layouts before Stage 3 exposed them in the viewer.

`paragon-visual/paragon-thresholds.js` contains the pinned SNOs, Paladin class eligibility, attribute IDs, and authored expressions for all 14 referenced selectors. It evaluates the supported affine expressions exactly and reports unsupported references or expressions as unresolved. Paired selectors require all listed attributes. The registry still supplies base and conditional amounts with their original provenance. The resolver reports formula provenance separately from selector evidence. [Pinned threshold definitions](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold)

- **Knight (`2449723`).** Controlled game observations gave `1,155 STR / 260 WIL` at placement 1, `1,610 / 330` at 2, and `2,065 / 400` at 3. Shield Bearer and Fervent followed placement when swapped. Index 4 and the other Rare placement requirements are source-derived predictions unless separately observed. [Pinned Knight selector](https://raw.githubusercontent.com/DiabloTools/d4data/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/Paladin_Strength%2BWillpower.pth.json)
- **Restorative (`680037`).** Paladin uses `WillPowerSide2`, or `210 + 75 × placementIndex` Willpower. Repeated direct tooltip observations, including Sentencing and Endure attached together, support the selector choice. Both authored references remain in the node metadata. Independent activation testing for the Intelligence reference remains open. Tenacity retains its directly verified Starting Board Strength selector. [Pinned Restorative definition](https://raw.githubusercontent.com/DiabloTools/d4data/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Rare_042.pgn.json)

The legacy `boardEquipIndex` context still powers independent board inspection and its historical regression fixtures. Its labels are catalog-scoped evidence contexts. Of 57 historical board/definition records, 10 match at labels 0–1, 18 differ if labels 2–4 are interpreted as placements, and 29 use labels outside the legal range. The 18 discrepancies include 16 records marked direct in-game and two planner records. All historical additional-board values match the pinned formula at index 1. The old observation records remain intact and the dedicated placement context computes its requirements from the source expressions.

### Multi-board implementation Stage 3 — Interactive planner

- Unused boards can be attached through any free gate on a placed board. New boards begin at 0° and use the facing source gate. Open the picker to attach a board or explicitly allocate or refund the gate. Incoming and occupied exit gates offer allocation actions and identify their existing attachment. Placement indices follow attachment order. Headers display their one-based placement number and catalog board number.
- A rotation keeps the selected board at its parent seam, selects the source entry gate that now faces that seam, and turns descendants by the same amount while preserving their source gate identities. This is a planner policy. The layout builder checks gate reuse, facing directions, overlap, and global allocated reachability before the edit is committed. Rotation preserves the zoom and keeps Starting anchored if the extent changes. The viewport fits new attachments when the camera is at its fitted view.
- Confirmed removal applies to unallocated leaves. It preserves every surviving board's identity, rotates no board, and renumbers placement indices in attachment order. Removing a board frees its parent gate for an explicit new attachment. Requirements and Totals recalculate after a committed layout or allocation change and after editing external attributes.
- Contextual headers use a canvas-aligned layer above the floating Total Stats panel so its overlay cannot intercept their controls. Controls scale down at overview zoom. Zooming in increases the visible size of gates and labels. Header controls are keyboard reachable before board cells. Tooltips and Total Stats contributor highlighting retain instance-qualified node identities.
- Pinned geometry and the validated tree drive the planner. The one-grid-step seam, initial 0° child rotation, subtree rotation policy, leaf-only removal, and placement compaction are planner behavior. The observed game evidence establishes branching, placement-dependent Knight requirements, and the five-board cap. It does not establish every rotation or removal policy.

## Important files

- `paragon-visual/index.html`, `style.css`, `app.js` — UI, rendering, interaction, persistence.
- `paragon-visual/board-rotation.js` — pure clockwise coordinate transform.
- `paragon-visual/connected-boards.js` — board instance tree, attachment geometry, allocation graph, version 1 adapter, and two-pass calculation.
- `tests/connected-boards.test.mjs` — pinned fixture tests for branching layouts and version 1 compatibility.
- `paragon-visual/paragon-calculator.js` — calculation and unresolved-bonus engine.
- `paragon-visual/paragon-thresholds.js` — pinned Rare selectors and placement-derived requirements.
- `tests/paragon-thresholds.test.mjs` — placement, activation, provenance, and legacy threshold comparisons.
- `tests/planner-browser.test.mjs` — interaction, migration, and recovery checks in Chrome.
- `paragon-visual/paragon-bonus-registry.js` — revision/board/SNO-scoped numerical evidence.
- `paragon-visual/shared-node-definitions.js` — authoritative pinned reusable Normal, compatible Magic, and verified Gate definitions with per-board applicability and merge validation.
- `paladin-board-00.json` through `paladin-board-09.json` — board grids.
- `paragon-visual/node-data.json` and `node-data-01.json` through `node-data-09.json` — board-specific definitions.
- `research/paragon-completeness-audit.md` — Board 00 audit.
- `research/paragon-raw-bonuses.md` — Board 00 observations and calculator boundaries.
- `research/tenacity-threshold-investigation.md` — class ordering and Tenacity experiment.
- `research/board-01-implementation.md` — Castle structure, implementation, persistence, validation.
- `research/castle-numerical-bonuses.md` — Castle values, provenance, and thresholds.

## Persistence and compatibility

- Board 00 uses local-storage key `d4-paragon-paladin-00-v1`; its value remains the legacy array of allocated indices.
- Boards 01–09 keep their independent `d4-paragon-paladin-01-v1` through `d4-paragon-paladin-09-v1` keys. Each save contains the source-index fields `entryNodeIndex` and `allocatedNodeIndices` plus `rotation` in clockwise degrees. Saves with a missing or unsupported rotation load at 0° and retain their valid allocations. Reset Allocation preserves rotation.
- External attributes use `d4-paragon-paladin-00-external-attributes-v1` and are shared by the calculator view.
- Build-file import/export remains **Board 00 only**, schema version 1. Boards 01–09 disable these buttons.
- Connected Boards writes `d4-paragon-paladin-connected-v2`. Its top-level fields are `version: 2`, `sourceRevision`, and `boards`. Each board stores `instanceId`, `boardId`, `placementIndex`, `rotation`, `incoming` (null for Starting, otherwise `parentInstanceId`, `parentGateIndex`, and `entryGateIndex`), and `allocatedSourceIndices`. The model rebuilds coordinates, occupancy and edges from these fields and validates allocated reachability before loading.
- Version 2 takes precedence on load. If it is absent, a valid `d4-paragon-paladin-connected-v1` draft is loaded through the adapter and copied to the version 2 key with allocations, Castle rotation, and gate identities preserved. The original version 1 key remains available. An invalid or unsupported draft, or one whose board resources failed to load, is preserved and the viewer falls back to an in-memory Starting-only layout with saving blocked. A stored version 2 value changed after load also blocks writes until reload. The `#connected` address opens the connected draft.

## Known limitations

- No glyph effects or Legendary power calculation.
- Direct placement-scaling evidence is available for Knight at indices 1–3. Other source-derived placement predictions have the coverage described in Stage 2.
- Formula-derived Castle Magic outputs are not all direct Castle tooltip observations, and power-budget intrinsic values must not be generalized beyond documented evidence.
- Single-board gate anchors remain local. The connected planner supports one instance per catalog board and up to five equipped boards.
- Totals cover registered Paragon bonuses, not a complete character sheet.
- No live visual browser pass has been completed for the final Board 01 calculation state.

## Running and testing

The viewer has no package manager. Run the automated tests with Node.js 22 or later:

```sh
node --experimental-default-type=module --test tests/*.test.mjs
```

Set `CHROME_PATH` to the Chrome executable to include the headless browser test. The test uses a temporary profile and a local HTTP server.

Serve the repository root over HTTP to use the viewer, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/paragon-visual/`.

Prior validation includes JavaScript syntax checks, JSON/board/node identity checks, HTTP asset checks, a minimal DOM/runtime harness, Board 00 regression assertions, every Castle Magic/Rare calculation, threshold boundary and AND-condition assertions, allocation/refund recalculation, and equip-index rejection. Shared-definition validation confirms complete 17/23/21 definition coverage, Normal/Gate `+5`, Magic core `+7` where verified, unchanged Board 00 totals, every Castle Magic and Rare result, Board 02's direct Magic Thorns and all Thorns-Rare threshold boundaries, node-scoped Damage/Maximum Life behavior, exact Castle Magic reuse with retained formula-derived provenance, base-only Castle Rare reuse, and Bludgeoning/Bodyguard threshold boundaries (including Bodyguard's AND requirement). Sidebar structural checks confirm all external inputs, sidebar, Advanced Details, and detailed Thorns fields are present; calculator regressions cover its flat/conditional data source. It also rejects conflicting identity or source metadata. Re-run focused assertions after calculator changes and perform a real-browser pass before claiming visual/browser verification.

Fervent validation compared its grid and all 21 merged definitions to the pinned source and checked every supported bonus, provenance, and unresolved effect. Boards 00–02 matched the original calculator output in 1,360 comparisons covering each unique node, full-grid diagnostics, threshold boundaries, and equip-index rejection. A headless Chrome smoke test over HTTP exercised board switching, gate selection, allocation, tooltips, totals, persistence across board switches, and refunds.

Final Fervent validation checked all six Rare bases and 24 conditional scenarios, including either side of an AND requirement failing, and confirmed that Magic and Rare Faith accumulate once per applicable bonus. The full-grid diagnostic reports zero unresolved ordinary bonuses. Boards 00–02 matched their pre-change outputs again across all 1,360 comparisons. Chrome also confirmed that Surgical's flat Faith total and tooltip update when total Strength reaches 1,345, persist through board switches, and recalculate on refund.

Boards 04–06 were checked cell by cell against the pinned grid and node files, including names, SNOs, coordinates, attributes, conditional slots, and selectors. Calculator checks covered each unique node, numerical reuse and provenance, revision and context rejection, and unresolved reporting. The full-grid diagnostics report 29, 19, and 26 unresolved entries respectively, including one Legendary per board. Boards 00–03 matched pre-change calculator output in 2,732 comparisons. Headless Chrome over HTTP verified all seven board selections, gate anchoring, connected allocation, blocked and successful refunds, tooltips, and independent restores for Boards 04–06 in a fresh page.

After the initial direct observations were added, all 58 Rare threshold scenarios and 17 repeated Magic-node checks passed. The threshold checks covered below, at, and above each requirement, either side of each AND requirement failing, base preservation, allocated attributes, and single application. Mismatched slots, selector SNOs, attribute parameters, and equip contexts were rejected. Boards 00–03 again matched their pre-change outputs in 2,732 cases. At that stage the full-grid ordinary unresolved counts were 3, 0, and 0 for Boards 04, 05, and 06 respectively, plus one separate unresolved Legendary per board. Headless Chrome verified threshold transitions, percentage totals, tooltips, allocation, refunds, switching, and independent saves restored in a fresh page.

After the direct Magic Healing Received observation was added, the full-grid calculator reported zero unresolved ordinary entries on Boards 00–06. At that stage, the diagnostic omitted Board 02 Knight's conditional because its registry link exposed only the Castle base. All eight Magic Healing allocation combinations, Recovery threshold boundaries, and 3,996 regression comparisons for unaffected outputs passed. Headless Chrome verified the +9% contribution, tooltip provenance, persistence across board switches, and recalculation after a refund.

Before adding Boards 07–09, the Preacher Healing Received fix was committed locally as `16fe983`. The three new board JSON files match their pinned source files byte for byte. The merged node metadata was checked against the pinned node and English localization files, including SNOs, attribute slots and parameters, formula references, thresholds, sockets, and passive power references. The merge rejected duplicate names, shared-definition conflicts, and a mismatched revision.

All 4,597 calculator comparisons for Boards 00–06 matched the Preacher-fixed baseline, including threshold boundaries, unsupported equip contexts, and all eight Preacher Healing Received allocation combinations. Tests of all 507 new occupied cells checked resolved values and provenance, unresolved effects, and rejection of mismatched registry context and source identity. The full-grid diagnostic reported 17, 19, and 13 unresolved entries for Boards 07, 08, and 09 respectively, including one Legendary per board. A diagnostic entry can cover an unresolved base and its marked conditional slot.

Headless Chrome over HTTP exercised all ten board options, chosen gate anchors, blocked disconnected allocations and refunds, successful connected allocations and leaf refunds, and independent restoration across board switches and a page reload. Tooltip checks included Preacher and Sentencing Healing Received, Sentencing's reused Sturdy base and unresolved threshold, Endure's unresolved Restorative bonuses and selectors, Beacon's flat Maximum Faith, and unresolved Magic and Legendary effects.

After Knight's Shield Bearer conditional was added, 6,525 calculator comparisons across Boards 00–09 confirmed the expected Knight-only changes. Nine Knight boundary combinations covered Strength 1,154–1,156 and Willpower 259–261. Focused checks also confirmed that allocated stats count toward the thresholds, repeated indices grant the bonus once, and other equip contexts reject the observation. The full-grid diagnostic reports zero unresolved ordinary bonuses and one unresolved Legendary on Board 02. Headless Chrome verified Knight's displayed threshold progress, one-time bonus application, and recalculation on refund. All ten boards passed the allocation and persistence smoke checks again.

Sentencing validation matched all eight new records to the pinned node definitions and selectors. All 18 Rare threshold checks passed below, at, and above the requirements, including the contribution from allocated Paragon stats. All 16 allocation combinations for the two repeated Magic node types passed, along with checks that the prior Magic links and reused Rare bases retained their values and provenance. The full-grid diagnostic found zero unresolved ordinary bonuses and one unresolved Legendary. All 5,989 baseline comparisons for Boards 00–06 and 08–09 matched.

Headless Chrome verified Sentencing's six Rare threshold transitions and refunds, the three separate percentage categories, and restored allocation after switching boards. All ten boards passed the allocation and persistence smoke checks, including restore after a page reload.

Endure validation matched all seven affected node types to the pinned definitions and selectors. All 18 Rare threshold checks passed below, at, and above the requirements, with both base bonuses preserved. All 16 allocation combinations for the two repeated Magic types and all 12 Restorative allocation and threshold combinations passed. The full-grid diagnostic found zero unresolved ordinary bonuses and one unresolved Legendary. All 5,959 baseline calculator comparisons for Boards 00–07 and 09 matched.

Headless Chrome verified Endure's threshold transitions and refunds for all six Rare cells, both active Restorative conditionals, and the flat +536 Life per 5 Seconds total. Endure's allocations and totals restored after board switching and a page reload. All ten boards passed the shared allocation and persistence smoke checks again.

Beacon validation matched all six Rare records and the derived Armor record to their pinned node attributes, slots, parameters, and applicable selectors. All 18 Rare boundary cases, 48 Magic and Rare Faith allocation and threshold combinations, and 32 Magic Armor allocation combinations passed. The full-grid diagnostic found zero unresolved ordinary bonuses and one unresolved Legendary. All 5,989 calculator comparisons for Boards 00–08 matched the baseline. The eight reused Beacon Magic records retained their values and provenance.

Headless Chrome verified all six Beacon Rare threshold transitions and refunds, distinct Armor tooltip provenance, flat +14 Maximum Faith with Fortitude active, and restoration of allocations and totals after switching boards and reloading. All ten boards passed the shared allocation and persistence smoke checks.

After the direct `679347` observation, all 32 Magic Armor allocation combinations passed again. The 6,681 calculator comparisons across Boards 00–09 showed only the expected provenance change. The full-grid audit checked every ordinary attribute and marked Rare conditional at zero and high external attributes and found zero unresolved ordinary numerical bonuses across all ten boards. Headless Chrome confirmed both Armor SNOs display their own identity and direct evidence, and that Beacon's Armor total restores after a reload.

Rotation checks covered all 441 grid coordinates at each angle, four consecutive 90° turns, and 90° followed by 270°. Headless Chrome verified all 36 Board 01–09 orientations and 144 gate positions and directions, including both connection layers, source-node tooltip identity, pointer hit-testing, zoom retention, and allocation and refund connectivity. Old and invalid-angle saves restored their valid allocations, Board 00 retained its legacy save array, and all ten boards restored their allocations and orientations after reload.

All 6,699 calculator comparisons across Boards 00–09 matched the pre-rotation baseline. The full-grid audit again found zero unresolved ordinary numerical bonuses in the supported equip contexts. The pinned board data, bonus registry, and calculator files were unchanged.

Connected Boards validation checked all four Castle placements, rejected 24 unsupported gate pairs, and verified single-bridge geometry, source identities, disconnected and duplicate save rejection, and both gates' +5 core attributes per allocation. Seven combined threshold cases covered Starting Board's Brawn and Castle's two-attribute Knight requirement. All 6,699 single-board calculator comparisons and the full-grid ordinary-bonus audit passed again.

Headless Chrome verified both boards on one zoomable and pannable canvas, all four Castle rotations, pointer selection at the rotated entry gate, one point per gate, threshold tooltips, blocked disconnecting refunds and rotations, and successful rotation with a reachable alternate entry and unchanged allocations and totals. Reload restored the bridge and draft at 90°. All ten single-board saves remained intact, and Board 00 import/export passed with schema version 1. The single-board suite also rechecked all 36 orientations and 144 gate positions and directions.

Phase 1 checks over HTTP in headless Chrome covered both modes at 1440 × 1050 and at emulated 390 × 740 and 320 × 640 mobile sizes. The panel stayed anchored through pan and zoom, retained its disclosure state across mode switches, and preserved the board transform when toggled. Mouse and keyboard checks confirmed contributor highlighting, including contributors on both connected boards. Allocation, refunds, and external attribute changes updated totals live, including Starting Board's Brawn and Castle's Knight conditionals. Mobile wheel and touch input scrolled the stat list while leaving the board transform and allocations intact. The zoom, board, and attachment controls remained outside the overlay.

Twenty-two browser snapshots compared the overlay to the pre-change viewer across all ten single boards and Connected Boards with low and high external attributes. All 234 rows across 28 categories matched for labels, ordering, displayed values, and accessibility labels. The existing temporary regression harness passed all 6,699 calculator comparisons, the full-grid ordinary-bonus audit, all 36 single-board orientations and 144 gate checks, and the Connected Boards attachment, threshold, allocation, persistence, and Board 00 import/export checks.

Phase 2 browser checks used headless Chrome at 1440 × 1050 and emulated mobile sizes of 390 × 740 and 320 × 640. Mouse, keyboard, and touch checks verified both rotation directions, focus retention after a turn, fitted header visibility, and separation from gate nodes and Total Stats. Four clockwise turns restored all node positions and source identities. Browser checks also covered synchronized gate selection, active-bridge preservation, rejection of a disconnecting turn without modifying allocations or the saved draft, and restoration of a valid rotation after reload. Headers followed the board during pan and zoom while Total Stats stayed viewport-anchored.

The regression harness passed 6,699 calculator comparisons and the full-grid ordinary-bonus audit. It also rechecked all 36 single-board orientations and 144 gate positions and directions, all four Connected Boards placements, 24 invalid gate pairs, seven combined threshold cases, allocation and refund behavior, save restoration, and Board 00 import/export. The Phase 1 desktop and mobile overlay checks passed again, and all 234 rendered stat rows still matched the baseline.

Phase 3 checks used headless Chrome over HTTP at 1440 × 1050 and emulated 390 × 740 and 320 × 640 mobile sizes. The picker opened before and after the Starting gate became eligible to allocate. Opening or confirming Castle preserved points, allocations, the board transform, and the saved draft. All eight unsupported choices were disabled. Escape, the close button, and outside clicks dismissed the picker and restored focus. Keyboard navigation skipped disabled choices, and mobile touch scrolled the list independently of the board.

The same browser checks verified the explicit one-point allocation, picker and right-click refunds, rejection of a refund or turn that would disconnect Castle, a valid rotation with allocations preserved, a single bridge after repeated Castle selection, and reload of the exact version 1 draft. Single-board gate clicks and refunds, the contextual headers, and the floating Total Stats panel and contributor highlights all passed. The existing harness passed 6,699 calculator comparisons, the full-grid ordinary-bonus audit, 36 single-board orientations and 144 gate checks, four connected layouts, 24 rejected gate pairs, seven combined threshold cases, and persistence and Board 00 build-file checks. All 234 rendered stat rows still matched the baseline.

Multi-board Stage 1 passed five Node.js tests using the pinned fixtures. These covered a five-board branch with shuffled input order, all 36 placements formed from the nine additional definitions and four rotations, adjacent boards with unconnected facing gates, 18 invalid tree proposals, and version 1 round trips for all Castle rotations with both empty and populated drafts. A separate pre-change comparison matched all four Starting + Castle layouts, 140 complete calculation results, and 28 version 1 save payloads byte for byte.

The existing harness passed 6,699 single-board calculator comparisons, the full-grid ordinary-bonus audit, 36 single-board orientations and 144 gate checks, 24 rejected gate pairs, and seven connected threshold cases. Headless Chrome rechecked allocation and refund connectivity, Castle rotation and reload, all ten single-board saves, Board 00 import/export, the picker and contextual headers, and Total Stats on desktop and at emulated 390 × 740 and 320 × 640 mobile sizes. All 234 rendered stat rows matched the baseline. Malformed JSON and an unsupported connected save version both remained stored after in-memory edits and mode changes.

Stage 2 passed all 11 Node.js tests. They cover all 44 Rare definitions and 220 legal cell/placement combinations, the 11 Paladin selectors and three class-ineligible references, boundary checks on each attribute in an AND condition, the observed Knight swap, and both Endure Restorative cells. The extraction matched all 14 pinned selector identities, class flags, and 17 expressions. The Stage 1 branching test now expects a calculation result from the five-board layout and continues to reject writing that layout as a version 1 save.

The existing 6,699 single-board calculator comparisons passed exactly. A separate pre-change comparison matched 140 full Starting + Castle results across four rotations after excluding threshold-specific evidence metadata. The numerical requirements, amounts, activation states, and bonus provenance matched. All 28 version 1 save payloads matched byte for byte. Headless Chrome passed the connected calculation, rotation, allocation, refund, reload, picker, header, and Total Stats checks, including emulated 390 × 740 and 320 × 640 mobile views. All 234 rendered stat rows matched the legacy baseline.

Stage 3 passed all 16 automated tests with Chrome enabled. Model checks attached all nine catalog choices, exercised branching and the five-board cap, rejected duplicate boards and occupied gates, and verified subtree rotation, overlap and allocated-path rejection, confirmed-removal eligibility, and placement reassignment. Five-board calculations verified independent per-cell contributions and no duplicated base or conditional totals. The Stage 2 Knight swap, cross-board core gains, and Restorative cases passed again.

Headless Chrome checked mouse and keyboard operation at 1440 × 1050, all five headers in an emulated 320 × 640 overview, and touch attachment and subtree rotation at 390 × 740. It exercised occupied gates, the cap, placement 4 and renumbered Knight tooltips, contextual controls, zoom and pan, anchored Total Stats and branch contributor highlighting, removal cancellation and confirmation, refund rejection, and reload of branch allocations and rotations. It also checked version 1 migration, version 2 precedence, protection of malformed and future-version values, and recovery after a temporarily unavailable board resource.

All 6,699 historical single-board calculator comparisons matched exactly. All 36 single-board orientations, 144 gate checks, and ten independent save restores passed. A separate Stage 2 comparison matched all 140 Starting + Castle results exactly, and the legacy writer produced identical version 1 payloads in all 28 cases.

## Current boundary

Boards 00–09 retain their historical inspection contexts, and Boards 01–09 support local rotation. The connected planner equips up to five boards selected from the Paladin catalog and saves them in version 2. Legendary powers and glyph effects remain deferred. Direct placement-scaling evidence covers Knight at positions 1–3. Other placement predictions and the Restorative selector caveat are documented in Stage 2.
