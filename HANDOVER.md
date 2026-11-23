# Diablo IV Paladin Paragon Calculator — Handover

## Project overview

This is a dependency-free browser viewer/calculator for Diablo IV Paladin Paragon boards. It currently supports:

- **Board 00 — Starting Board** (SNO `2436481`)
- **Board 01 — Castle** (SNO `2436511`), modeled as the first additional board (`ParagonBoardEquipIndex = 1`)
- **Board 02 — Shield Bearer** (SNO `2436844`), with selected verified shared core-stat and Magic bonuses

`paragon-visual/app.js` loads board/node JSON, merges revision-pinned definitions from `shared-node-definitions.js` according to board SNO, renders the 21×21 grid, manages zoom/pan/tooltips and allocation connectivity, persists independent allocations, and passes allocated indices plus external attributes to the pure calculation module. `paragon-calculator.js` validates board/node identity and combines pinned core-stat formulas with board-scoped records from `paragon-bonus-registry.js`. Missing or mismatched numerical evidence is reported as unresolved rather than zero. The UI has a responsive, collapsible Paragon-only Total Stats sidebar beside the board; it derives totals and hover contributors from calculator node evaluations, excluding external attributes and inactive conditionals.

Boards 01 and 02 have no authored starting node. The viewer lets the user choose one of their four gates as a **local allocation anchor**. This is a drafting convenience, not board attachment.

## Data source

All extracted structure is pinned to DiabloTools/d4data revision:

`75e619f0d90a0951945747f45feef59c076a5db0`

Relevant upstream paths:

- `json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_01.pbd.json`
- `json/base/meta/ParagonBoard/Paragon_Paladin_02.pbd.json`
- `json/base/meta/ParagonNode/*.pgn.json`
- `json/base/meta/ParagonThreshold/*.pth.json`
- `json/base/meta/GameBalance/AttributeFormulas.gam.json`

Local board copies are `paladin-board-00.json`, `paladin-board-01.json`, and `paladin-board-02.json`; board-specific node metadata is in `paragon-visual/node-data.json`, `node-data-01.json`, and `node-data-02.json`. Reusable definitions live in `paragon-visual/shared-node-definitions.js` with explicit board-SNO applicability. Loading rejects duplicate names, duplicate SNOs, conflicts, unsupported boards, revision mismatches, and formula-source mismatches.

Shared definitions are the four verified Normal core-stat nodes, the verified Gate, and verified Magic Intelligence/Willpower on all boards; Magic Armor on 00/01; Magic Block Chance, Magic Physical Damage, and Magic Damage to Crowd Controlled on 01/02; Magic Damage on 00/02; and Magic Maximum Life on all boards. Applicability controls structure only: numerical resolution still requires the calculator's pinned formula checks or the correct board-scoped bonus registry.

Remaining board-specific definitions include Board 00's Magic Damage to Elites, Rares, socket, and start node; Board 01's Magic Armor Percent, All Resistance, and Strength plus its Rares, socket, and Legendary; and Board 02's Magic Thorns, Rares, socket, and Legendary. Rare and Legendary definitions were not moved.

## Implemented and verified functionality

All three boards render at their source coordinates and share the established node rendering, tooltips, zoom/pan, orthogonal allocation/refund rules, raw-bonus display, and manual external-attribute inputs. Switching boards preserves independent allocations.

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
- Direct Board 02 observations resolve `Generic_Magic_Thorns` as `+100` flat Thorns and `Paladin_Rare_008` (Stalwart) as `+2.5%` Block Chance / `+15%` Blocked Damage Reduction, plus another `+2.5%` Block Chance at 305 Willpower. `Paladin_Rare_010` (Knight) remains an exact Castle **base-only** reuse: `+10%` Physical Damage / `+10 Strength`; its Castle conditional is intentionally not reused. Planner observations resolve `Paladin_Rare_012` (Bludgeoning) as `+10%` Damage, `+10%` Damage to Crowd Controlled, plus `+10%` Damage at 1,345 Strength; and `Paladin_Rare_015` (Bodyguard) as `+10%` Physical Damage, `+2.5%` Block Chance, plus `+10%` Physical Damage at 1,155 Strength **and** 260 Intelligence. Planner records remain scoped to Board 02's index-2 calculation context; the new Thorns/Stalwart records retain `direct-in-game` provenance.
- Corrected direct observations resolve both remaining Thorns Rares: `Paladin_Rare_011` / Growth (SNO `2449751`) grants `+150` flat Thorns and `+4%` Maximum Life, plus another `+150` Thorns at 1,215 Strength through `StrengthMain2`; `Paladin_Rare_013` / Constrict (SNO `2449755`) grants `+150` flat Thorns and `+10 Strength`, plus another `+150` Thorns at 305 Willpower through `WillPowerSide3`. The user-supplied `2449735` is not present in the pinned board; `2449755` is the verified source SNO used by the registry.
- Layout, rarity styling, tooltips, independent allocation persistence, and the four source-coordinate gates are implemented.
- Board 02's remaining Magic effects, Legendary, glyph, rotation, and attachment effects remain unresolved. Its limited registry contains six direct-observation Magic/Rare records, three exact Castle Magic node links, one base-only exact Castle Rare link, and the two Board 02 planner-observed Rare records above.

## Important files

- `paragon-visual/index.html`, `style.css`, `app.js` — UI, rendering, interaction, persistence.
- `paragon-visual/paragon-calculator.js` — calculation and unresolved-bonus engine.
- `paragon-visual/paragon-bonus-registry.js` — revision/board/SNO-scoped numerical evidence.
- `paragon-visual/shared-node-definitions.js` — authoritative pinned reusable Normal, compatible Magic, and verified Gate definitions with per-board applicability and merge validation.
- `paladin-board-00.json`, `paladin-board-01.json`, `paladin-board-02.json` — board grids.
- `paragon-visual/node-data.json`, `node-data-01.json`, `node-data-02.json` — definitions that remain board-specific after the applicable shared definitions are excluded.
- `research/paragon-completeness-audit.md` — Board 00 audit.
- `research/paragon-raw-bonuses.md` — Board 00 observations and calculator boundaries.
- `research/tenacity-threshold-investigation.md` — class ordering and Tenacity experiment.
- `research/board-01-implementation.md` — Castle structure, implementation, persistence, validation.
- `research/castle-numerical-bonuses.md` — Castle values, provenance, and thresholds.

## Persistence and compatibility

- Board 00 uses local-storage key `d4-paragon-paladin-00-v1`; its value remains the legacy array of allocated indices.
- Board 01 uses `d4-paragon-paladin-01-v1`; its value contains `entryNodeIndex` and `allocatedNodeIndices`.
- Board 02 uses `d4-paragon-paladin-02-v1`; its value contains `entryNodeIndex` and `allocatedNodeIndices`.
- External attributes use `d4-paragon-paladin-00-external-attributes-v1` and are shared by the calculator view.
- Build-file import/export remains **Board 00 only**, schema version 1. Board 01 and 02 buttons are disabled to avoid an unsafe multi-board schema migration.

## Known limitations

- No glyph effects, Legendary power calculation, board rotation, or board attachment.
- Castle Rare numbers/requirements are verified only for equip index 1; other placements remain unresolved.
- Formula-derived Castle Magic outputs are not all direct Castle tooltip observations, and power-budget intrinsic values must not be generalized beyond documented evidence.
- Boards are not connected; the Castle gate anchor does not assert a legal in-game attachment.
- Shield Bearer resolves its shared Normal/Gate `+5` core attributes, shared Magic Intelligence/Willpower `+7`, node-scoped direct-observation Magic bonuses (Damage `+5%`, Maximum Life `+2%`, flat Thorns `+100`), exact Castle formula-derived Magic records (Physical Damage `+5%`, Block Chance `+2%`, Damage to Crowd Controlled `+8.75%`), and all six supported Rare records. All other Shield Bearer effects remain unresolved.
- Totals cover registered Paragon bonuses, not a complete character sheet.
- No live visual browser pass has been completed for the final Board 01 calculation state.

## Running and testing

There is no package manager or committed automated test suite. Serve the repository root over HTTP, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/paragon-visual/`.

Prior validation includes JavaScript syntax checks, JSON/board/node identity checks, HTTP asset checks, a minimal DOM/runtime harness, Board 00 regression assertions, every Castle Magic/Rare calculation, threshold boundary and AND-condition assertions, allocation/refund recalculation, and equip-index rejection. Shared-definition validation confirms complete 17/23/21 definition coverage, Normal/Gate `+5`, Magic core `+7` where verified, unchanged Board 00 totals, every Castle Magic and Rare result, Board 02's direct Magic Thorns and all Thorns-Rare threshold boundaries, node-scoped Damage/Maximum Life behavior, exact Castle Magic reuse with retained formula-derived provenance, base-only Castle Rare reuse, and Bludgeoning/Bodyguard threshold boundaries (including Bodyguard's AND requirement). Sidebar structural checks confirm all external inputs, sidebar, Advanced Details, and detailed Thorns fields are present; calculator regressions cover its flat/conditional data source. It also rejects conflicting identity or source metadata. Re-run focused assertions after calculator changes and perform a real-browser pass before claiming visual/browser verification.

## Current boundary

Board 02 structural rendering, supported shared Normal/Gate/Magic calculations (including direct flat Thorns), one base-only exact Castle Rare record, four direct Thorns/Stalwart Rare records, and two Board 02 planner-observed Rare records are complete. Do not infer its remaining Magic, threshold, Legendary, glyph, rotation, attachment, or multi-board build-schema behavior without separate evidence and scope.
