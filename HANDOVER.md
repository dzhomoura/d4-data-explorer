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
- **Board 07 — Sentencing** (SNO `2439031`), with selected Magic bonuses and two Rare bases
- **Board 08 — Endure** (SNO `2439033`), with selected Magic bonuses
- **Board 09 — Beacon** (SNO `2439035`), with selected Magic bonuses and three Rare bases

`paragon-visual/app.js` loads board/node JSON, merges revision-pinned definitions from `shared-node-definitions.js` according to board SNO, renders the 21×21 grid, manages zoom/pan/tooltips and allocation connectivity, persists independent allocations, and passes allocated indices plus external attributes to the pure calculation module. `paragon-calculator.js` validates board/node identity and combines pinned core-stat formulas with board-scoped records from `paragon-bonus-registry.js`. Missing or mismatched numerical evidence is reported as unresolved rather than zero. The UI has a responsive, collapsible Paragon-only Total Stats sidebar beside the board; it derives totals and hover contributors from calculator node evaluations, excluding external attributes and inactive conditionals.

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

All ten boards render at their source coordinates and share the established node rendering, tooltips, zoom/pan, orthogonal allocation/refund rules, raw-bonus display, and manual external-attribute inputs. Switching boards preserves independent allocations.

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

Fervent displays Critical Strike Damage as a percentage and Maximum Faith as a flat value. Tooltips display threshold progress, and the raw bonus breakdown shows base and active conditional amounts separately. The Legendary power remains unresolved. Glyphs, rotation, attachment, and multi-board aggregation are outside this implementation.

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
| 09 | Armor +1.5% (`671247`) | Board 00 direct in-game |
| 09 | Block Chance +2% (`2063114`) | Castle formula-derived |
| 09 | Critical Strike Damage +7.5% (`671242`), Maximum Faith +2 flat (`2525975`) | Fervent formula-derived Critical Strike Damage and direct in-game Faith |

| Board | Unresolved Magic node types | Reused Rare bases from direct in-game evidence | Rare nodes with both base bonuses unresolved |
|---|---|---|---|
| 07 | Lucky Hit Chance (`1340824`), Judgement Damage (`2500772`) | Sturdy (`2449942`), +3% Armor and +4% Maximum Life from Fervent. Rare Endure (`2449913`), +3% All Resistance and +10 Strength from Relentless. | Benediction (`2449924`), Grace (`2449915`), Luminous (`2449918`), Restorative (`680037`) |
| 08 | Lucky Hit Chance (`1340824`), Life Regeneration after taking no damage (`679136`) | None | Anointed (`2449931`), Grace (`2449915`), Radiance (`2449928`), Restorative (`680037`, two cells), Wrathful (`2449936`) |
| 09 | Armor Percent (`679347`, internal name `Generic_Magic_DamageReductionFromElite`) | Champion (`2449940`), +10% Damage and +10 Strength from Divinity. Constitution (`2449944`), +3% All Resistance and +4% Maximum Life, and Sturdy (`2449942`), +3% Armor and +4% Maximum Life, from Fervent. | Blurring (`2449946`), Fortitude (`2449951`), Spiked Shield (`2449949`) |

All six Rare conditional amounts and requirements on each board are unresolved. The following selectors and marked attributes are datamined.

| Board | Rare conditional slots and selectors |
|---|---|
| 07 | Benediction, Judgement Damage (`StrengthMain3`). Endure, All Resistance (`WillPowerSide3`). Grace, Lucky Hit Chance (`WillPowerSide1`). Luminous, damage type parameter 6 (`IntelligenceSide1`). Restorative, Maximum Life (`WillPowerSide2` and `IntelligenceSide2` are authored selectors). Sturdy, Armor (`IntelligenceSide1`). |
| 08 | Anointed, Healing Received (`WillPowerSide1`). Grace, Lucky Hit Chance (`WillPowerSide1`). Radiance, damage type parameter 6 (`StrengthMain3`). Restorative, Maximum Life (`WillPowerSide2` and `IntelligenceSide2` are authored selectors). Wrathful, damage type parameter 6 (`WillPowerSide2`). |
| 09 | Blurring, Critical Strike Damage (`StrengthMain1`). Champion, Damage (`WillPowerSide1`). Constitution, All Resistance (`StrengthMain1`). Fortitude, Maximum Faith (`IntelligenceSide1`). Spiked Shield, Block Chance (`WillPowerSide1`). Sturdy, Armor (`IntelligenceSide1`). |

The Legendary power on each board remains unresolved.

## Important files

- `paragon-visual/index.html`, `style.css`, `app.js` — UI, rendering, interaction, persistence.
- `paragon-visual/paragon-calculator.js` — calculation and unresolved-bonus engine.
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
- Board 01 uses `d4-paragon-paladin-01-v1`; its value contains `entryNodeIndex` and `allocatedNodeIndices`.
- Board 02 uses `d4-paragon-paladin-02-v1`; its value contains `entryNodeIndex` and `allocatedNodeIndices`.
- Board 03 uses `d4-paragon-paladin-03-v1`. Its value contains `entryNodeIndex` and `allocatedNodeIndices`.
- Boards 04–06 use their own `d4-paragon-paladin-04-v1`, `d4-paragon-paladin-05-v1`, and `d4-paragon-paladin-06-v1` keys with the same gate and allocation fields.
- Boards 07–09 use `d4-paragon-paladin-07-v1`, `d4-paragon-paladin-08-v1`, and `d4-paragon-paladin-09-v1` with the same gate and allocation fields.
- External attributes use `d4-paragon-paladin-00-external-attributes-v1` and are shared by the calculator view.
- Build-file import/export remains **Board 00 only**, schema version 1. Boards 01–09 disable these buttons.

## Known limitations

- No glyph effects, Legendary power calculation, board rotation, or board attachment.
- Castle Rare numbers/requirements are verified only for equip index 1; other placements remain unresolved.
- Formula-derived Castle Magic outputs are not all direct Castle tooltip observations, and power-budget intrinsic values must not be generalized beyond documented evidence.
- Boards are not connected; the Castle gate anchor does not assert a legal in-game attachment.
- Totals cover registered Paragon bonuses, not a complete character sheet.
- No live visual browser pass has been completed for the final Board 01 calculation state.

## Running and testing

There is no package manager or committed automated test suite. Serve the repository root over HTTP, for example:

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

## Current boundary

Shield Bearer has complete ordinary numerical coverage at equip index 2, including Knight's directly observed two-attribute conditional.

Fervent supports structural rendering, independent gate-anchored allocation, and every ordinary numerical bonus in equip context 3.

Boards 04–06 have complete ordinary numerical coverage in their observed equip contexts, including all 18 Rare conditionals.

Boards 07–09 have complete structural coverage. The evidence gaps for Magic bonuses, Rare bases, Rare conditionals, and Legendary powers are listed above.
