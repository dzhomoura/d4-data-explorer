# Phase 10A — Paladin Board 01 implementation

## Scope and source

This implementation adds `Paragon_Paladin_01` beside the existing `Paragon_Paladin_00` viewer. All Board 01 structure and node identities come from DiabloTools/d4data commit `75e619f0d90a0951945747f45feef59c076a5db0`.

Local source artifacts:

- [`paladin-board-01.json`](../paladin-board-01.json) is a semantic copy of `json/base/meta/ParagonBoard/Paragon_Paladin_01.pbd.json` at the pinned commit.
- [`node-data-01.json`](../paragon-visual/node-data-01.json) resolves every referenced `ParagonNode` definition and records the pinned formula-reference metadata without inventing final values.

## Board 01 structure

Board SNO `2436511` is a 21 × 21 row-major grid with 441 cells, 191 occupied positions, and 23 unique node definitions. All 191 occupied positions form one orthogonally connected component.

| Kind | Occupied positions |
|---|---:|
| Normal | 149 |
| Magic | 30 |
| Rare | 6 |
| Gate | 4 |
| Glyph socket | 1 |
| Legendary | 1 |
| Starting node | 0 |

Special positions use zero-based source coordinates:

- Gates: `(10,0)`, `(0,10)`, `(20,10)`, `(10,20)`.
- Glyph socket: `(15,5)`.
- Legendary node: `(5,15)`, `Paladin_Legendary_001`, localized name **Castle**, passive-power SNO `2488259`.
- Rare nodes: Knight `(15,2)`, Ironclad `(18,5)`, Insulate `(5,7)`, Stalwart `(11,9)`, Grappler `(13,15)`, and Defiance `(2,18)`.

Board 01 has no authored starting node. In the game, its entry depends on board attachment and rotation, which remain out of scope. The viewer therefore lets the user select one authored gate as a **board-local allocation anchor**. This only roots an independent draft path on Board 01; it does not connect the two boards, rotate either board, or claim a valid in-game attachment configuration.

## Implemented features

- A selector switches between Board 00 and Board 01 while using the existing grid, node rendering, tooltip, zoom, pan, adjacency, allocation, and refund paths.
- Board 00 loads first and is not blocked if optional Board 01 loading fails.
- Board allocations are independent in memory and local storage. Switching does not replace the other board's allocation.
- Board 01 uses actual source indices and coordinates; no rotation or coordinate transformation is applied.
- Legendary rarity has a distinct rendered style. The pinned legendary passive identifier is shown, with its effect explicitly unresolved.
- Pinned English names are included for Board 01's rare and legendary nodes.
- All 23 referenced definitions are required at load time, and SNO identities are checked against all 191 board references.

## Numerical accuracy and unresolved bonuses

Phase 10B added a separate Castle registry gated to board SNO `2436511` and the same pinned revision; Phase 10C completes its Rare records with equip-index-1 Maxroll observations. Board 00's existing records and values remain unchanged. Castle can reuse an identical observed SNO, an explicitly recorded planner observation, or a result derived from a pinned formula and a same-revision shared multiplier; it does not consume Board 00 records indiscriminately.

Board 01 totals the revision-pinned core constants already supported by the calculator:

- `ParagonNodeCoreStat_Normal = 5`;
- `ParagonNodeCoreStat_Magic = 7`.

Magic bonuses and all six Rare node magnitudes are resolved for Castle at equip index 1 as documented in [`castle-numerical-bonuses.md`](./castle-numerical-bonuses.md). New categories—Physical Damage, Damage to Crowd Controlled, All Resistance, Block Chance, and Blocked Damage Reduction—remain separate from generic Damage and from one another.

Remaining unresolved effects are not treated as zero:

- no Magic definition remains numerically unresolved under the calibrated same-revision formula model;
- Castle Rare values and conditional requirements are scoped to the observed first-additional-board context (`ParagonBoardEquipIndex = 1`); other equip positions remain unresolved;
- the Castle legendary passive effect is unresolved and contributes one explicit unresolved record when allocated;
- glyph effects are not implemented.

The earlier Phase 10A all-node result of 38 unresolved bonuses is superseded by the Phase 10C validation results below. The all-node diagnostic remains a structural calculator check, not a valid connected in-game build total.

## Persistence and import/export decisions

Board 00 compatibility is preserved:

- its local-storage key remains `d4-paragon-paladin-00-v1`;
- its stored value remains the existing array of allocated indices;
- build-file schema version 1 and its Board 00 validation are unchanged;
- the external-attribute storage key is unchanged.

Board 01 uses a separate key, `d4-paragon-paladin-01-v1`, containing its local entry-gate index and allocated indices. Board 01 build-file import/export is intentionally disabled. A multi-board file schema would need to represent allocations per board, Board 01's local entry choice, and eventually attachment/rotation. Introducing that schema in this phase would risk legacy compatibility and imply mechanics that are not implemented.

## Validation performed

Passed:

1. `node --check` for `app.js` and `paragon-calculator.js`.
2. JSON parsing for both boards and both node databases.
3. Board/database identity validation: Board 00 resolves 75 occupied cells and 17 definitions; Board 01 resolves 191 and 23; neither has a missing definition or SNO mismatch.
4. Board 01 transform audit: all 23 local definitions match the pinned raw SNO, rarity, gate/socket flags, passive reference, attributes, formula references, literals, and threshold-reference order.
5. Board 01 source JSON is semantically identical to the pinned board JSON.
6. Local HTTP checks returned 200 for the page, JavaScript, both boards, and both node databases.
7. Calculator regression: all Board 00 nodes still produce Strength 135, Intelligence 84, Willpower 69, Dexterity 30; raw Damage 50%, Damage to Elites 30%, Maximum Life 16%, Total Armor 5%; zero unresolved at zero external attributes. This matches the prior audit.
8. Phase 10B calculator assertions cover every distinct Castle Magic definition, all six Rare nodes, Board 00 Tenacity below/at 630 Strength, allocation/refund recalculation, and unresolved reporting. All passed.
9. Phase 10C boundary assertions verify all six Rare nodes immediately below and at their equip-index-1 requirements, including AND behavior for Knight and Insulate. The full structural diagnostic reports core totals Strength 372, Intelligence 234, Willpower 194, and Dexterity 80; all six conditionals activate at sufficient total attributes; the legendary power is the only unresolved effect.
10. Equip-index scoping rejects the Castle registry at index 2, leaving the affected bonuses unresolved instead of applying index-1 observations.
11. A Phase 10A minimal DOM/runtime harness executed the real modules and confirmed: Board 00 rendered 75 markers and restored legacy save `[304]`; Board 01 rendered 191 markers, persisted its gate anchor under the separate key, disabled build-file actions, and a Board 01 → Board 00 → Board 01 round trip retained both independent allocations without changing the legacy Board 00 save. Phase 10C does not alter board switching or persistence paths.

Not run:

- A live browser visual/interaction test. The configured in-app browser exposed no available browser backend in this session. The implementation must not be described as visually browser-verified until it is opened and exercised in a real browser.

## Remaining work

- Perform a live browser pass for Board 00 rendering/calculations, Board 01 rendering, selector interaction, zoom/pan/tooltips, allocation preservation in both directions, and reload persistence.
- Castle Rare values and thresholds at equip positions other than 1 remain unresolved.
- Design a backward-compatible multi-board export schema in a later phase that also has an explicit policy for attachment and rotation.
- Glyph effects, rotation, and board attachment remain intentionally unimplemented.
