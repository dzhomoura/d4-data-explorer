# Phase 9A — Paragon Visual Research

## Scope and evidence

This investigation uses the pinned [DiabloTools/d4data revision](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0), matching the local [Paladin board](../paladin-board-00.json) and [node database](../paragon-visual/node-data.json). It is limited to the board's 17 referenced node definitions and directly related localization and UI metadata.

## Localized node names

### VERIFIED

- Each inspected `ParagonNode` definition supplies an internal file/name, SNO ID, attributes and numeric `hIcon` / `hIconMask` handles; none has a node-specific localized name or `StringList` reference.
- [`ParagonBoardUI.stl.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/enUS_Text/meta/StringList/ParagonBoardUI.stl.json) (SNO 659576) provides generic UI text such as `NodeTypeNormal` (“Normal Node”), `NodeTypeMagic` (“Magic Node”), `NodeTypeRare` (“Rare Node”), `NodeTypeLegendary` (“Legendary Node”), and the parameterized `NodeNamePH` template. These strings do not map internal node identifiers to individual names.
- [`ParagonBoard_Paragon_Paladin_00.stl.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/enUS_Text/meta/StringList/ParagonBoard_Paragon_Paladin_00.stl.json) contains only `Name: Start`. It is not a set of node names.
- The local [bonus registry](../paragon-visual/paragon-bonus-registry.js) associates four rare-node labels with SNO IDs based on prior in-game observations. They are useful player-facing labels, but are **not verified as mappings from the pinned `enUS_Text` data**.

| Internal node | SNO | Name evidence |
|---|---:|---|
| `Generic_Gate` | 994337 | No individual localized name found; `bIsGate` identifies its role. |
| `Generic_Normal_Int` | 678776 | No individual localized name found; attribute/type only. |
| `Generic_Normal_Str` | 678769 | No individual localized name found; attribute/type only. |
| `Generic_Normal_Dex` | 678775 | No individual localized name found; attribute/type only. |
| `Generic_Normal_Will` | 678773 | No individual localized name found; attribute/type only. |
| `Generic_Magic_Will` | 678629 | No individual localized name found; attribute/type only. |
| `Generic_Magic_DamageToElite` | 678842 | No individual localized name found; attribute/type only. |
| `Generic_Magic_Int` | 678627 | No individual localized name found; attribute/type only. |
| `Generic_Rare_118` | 2549802 | “Raw Power” in the local in-game-observation registry; not an `enUS_Text` mapping. |
| `Barbarian_Rare_039` | 2126168 | “Iron Strength” in the local in-game-observation registry; not an `enUS_Text` mapping. |
| `Generic_Magic_Damage` | 678754 | No individual localized name found; attribute/type only. |
| `Generic_Socket` | 681756 | No individual localized name found; `bHasSocket` identifies its role as a socket. |
| `Generic_Magic_HPPercent` | 679184 | No individual localized name found; attribute/type only. |
| `Generic_Magic_Armor` | 671247 | No individual localized name found; attribute/type only. |
| `Barbarian_Rare_015` | 675186 | “Tenacity” in the local in-game-observation registry; not an `enUS_Text` mapping. |
| `Barbarian_Rare_022` | 675448 | “Brawn” is explicitly identified in the prior in-game observation; not an `enUS_Text` mapping. |
| `StartNodePaladin` | 2436489 | Internal identifier establishes its role; the board string `Name: Start` is not a verified node-name mapping. |

**UNRESOLVED:** Official localized names for the individual nodes, including the four rare names above. For normal and magic nodes, an attribute-based description can be useful UI copy, but should not be presented as an official game node name.

## Visual resources

### VERIFIED

- The pinned node definitions expose integer `hIcon` and `hIconMask` fields. `Generic_Socket` has `hIcon: 603228147`; the other inspected definitions have `hIcon: 0`. Their nonzero `hIconMask` values vary by node family.
- Some node handles occur as `hImageFrame.hImageHandle` values in [`ParagonBoard.ui.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/UI/ParagonBoard.ui.json): the Dexterity normal node's mask (`635087190`) and the socket icon (`603228147`) are examples. This corroborates that the fields are asset-like handles, but does not reveal the image pixels, atlas coordinates, or exact visual meaning.
- `ParagonBoard.ui.json` and [`ParagonBoardSelect.ui.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/UI/ParagonBoardSelect.ui.json) contain UI layout metadata, image handles, and style references such as `Center_Gradient.tsl`, `HellGothicChill.tsl`, and `Frame_AbilityPoints.tsl`. These are references, not usable image files.
- The board definition itself has `legendaryNodeIcon: 0`, `nWidth`, and `arEntries`; it does not provide a board-background image. In the repository root, `texture/` contains only `.gitkeep`, and `svg/` contains five class skill-tree SVGs rather than Paragon art.

**UNRESOLVED:** No directly usable normal, magic, rare, legendary, start, gate, socket, board-background, or board-border image was established by these references. A numeric handle is not a URL or proof that a texture can be downloaded or rendered. Texture metadata and UI references alone are insufficient to reconstruct the game's art.

## Existing viewer comparison

The viewer already uses a dark framed board, subtle grid and connection lines, rarity-colored diamond-shaped nodes, a round socket, distinct start/gate colors, zoom/pan, and a detailed tooltip. The tooltip currently uses internal names as its title and can display an evidence-backed `displayName` where one is available. The [HTML](../paragon-visual/index.html), [CSS](../paragon-visual/style.css), and [JavaScript](../paragon-visual/app.js) also contain allocation, persistence, threshold, and calculation UI; none of those behaviors needs to change for visual work.

## Recommended implementation plan

1. **Names:** Add a display-name lookup keyed by SNO ID. Use a localized value only when its source mapping is verified; retain observed rare labels with their provenance. For other nodes, use accurate type and attribute descriptions rather than inventing proper names. Keep internal identifiers available for diagnostics.
2. **Node appearance:** First resolve and decode the actual icon/atlas resources behind the handles. Until then, refine CSS silhouettes and tier framing as an explicit approximation; do not treat hashes as image sources. Keep sockets, gates, and the start node visually distinct.
3. **Tooltips:** Put a verified player-facing name and tier first, then the existing bonus, threshold, and evidence details. Preserve keyboard focus and the current calculation/allocation information.
4. **Board framing:** Rework the existing CSS frame and background only after a board-specific asset is identified; otherwise continue using authored CSS textures and label them as an approximation.
5. **Optional effects:** Add restrained hover/allocated glow and transitions only after the static appearance is validated; respect reduced-motion preferences.

## Risks and next steps

- UI image handles may require game-asset extraction and atlas decoding; a matching integer does not identify a standalone file.
- The board-specific string list appears to describe the board label (“Start”), not node names. Trace how the runtime builds `NodeNamePH` substitutions before implementing localized node titles.
- CSS-only iconography can improve hierarchy but remains an approximation of the game.
- Keep any future visual-only work isolated from board coordinates, graph construction, allocation/refund rules, calculations, threshold evaluation, persistence, import/export, and zoom/pan.

Recommended next: resolve the exact `hIcon`/`hIconMask` handles against authorized local game assets, then implement the display-name lookup and visual polish as a separate layer with a verified-data fallback.

## Pinned source paths

- Board: [`json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json)
- Node definitions: [`json/base/meta/ParagonNode/`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode) — each table entry maps to `json/base/meta/ParagonNode/<internal node>.pgn.json` (for example, `.../Barbarian_Rare_022.pgn.json`).
- Generic Paragon strings: [`json/enUS_Text/meta/StringList/ParagonBoardUI.stl.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/enUS_Text/meta/StringList/ParagonBoardUI.stl.json)
- Paladin board string: [`json/enUS_Text/meta/StringList/ParagonBoard_Paragon_Paladin_00.stl.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/enUS_Text/meta/StringList/ParagonBoard_Paragon_Paladin_00.stl.json)
- UI metadata: [`json/base/meta/UI/ParagonBoard.ui.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/UI/ParagonBoard.ui.json), [`json/base/meta/UI/ParagonBoardSelect.ui.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/UI/ParagonBoardSelect.ui.json)
