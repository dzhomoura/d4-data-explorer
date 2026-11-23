# Paladin source verification

## VERIFIED — Repository and board

Unauthenticated Node.js `fetch` requests to the GitHub API succeeded:

- Repository API: [`api.github.com/repos/DiabloTools/d4data`](https://api.github.com/repos/DiabloTools/d4data) returned HTTP 200. The repository is public, not archived, and its default branch is `master`.
- Expected node directory: [`json/base/meta/ParagonNode`](https://api.github.com/repos/DiabloTools/d4data/contents/json/base/meta/ParagonNode) returned HTTP 200 and listed all three requested files.
- The repository's `master` resolved to commit [`75e619f0d90a0951945747f45feef59c076a5db0`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0), dated 2026-10-29, message `Rebuilt JSON 3.2.4.74043`.

The local board is the same board asset as the source file `json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json`: the GitHub API and pinned raw URL returned HTTP 200; both files have `__snoID__: 2436481`, `nWidth: 21`, and 441 entries. A slot-by-slot comparison found identical `null` positions and identical `__targetFileName__` / `__raw__` references.

## VERIFIED — Recovered node definitions

For each file below, both its GitHub Contents API endpoint and pinned raw URL returned HTTP 200. The IDs match the local board entries' `__raw__` values. All are `ParagonNodeDefinition` assets.

| File and source URLs | SNO ID | Relevant fields |
|---|---:|---|
| `StartNodePaladin.pgn.json` — [API](https://api.github.com/repos/DiabloTools/d4data/contents/json/base/meta/ParagonNode/StartNodePaladin.pgn.json?ref=75e619f0d90a0951945747f45feef59c076a5db0) · [raw](https://raw.githubusercontent.com/DiabloTools/d4data/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/StartNodePaladin.pgn.json) | `2436489` | `eRarityOverride: 0`; `ptAttributes: []`; `arThresholdSelector: []`; `bHasSocket: 0`; `bIsGate: 0`; `snoPassivePower: null`; `arSkillTags: []`. |
| `Generic_Rare_118.pgn.json` — [API](https://api.github.com/repos/DiabloTools/d4data/contents/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json?ref=75e619f0d90a0951945747f45feef59c076a5db0) · [raw](https://raw.githubusercontent.com/DiabloTools/d4data/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json) | `2549802` | `eRarityOverride: 3`. `ptAttributes`: `Damage_Percent_All_From_Skills` (`eAttribute: 252`, formula `"0"`, GBID `ParagonNodeDamageBonus_RareMajor`) and `Strength_Core` (`eAttribute: 9`, formula `"15"`, GBID `ParagonNodeCoreStat_RareMinor`). Threshold ref: `IntelligenceSide2`. Tags: `Search_Physical`, `Search_Damage`, `Search_Strength`. |
| `Barbarian_Rare_039.pgn.json` — [API](https://api.github.com/repos/DiabloTools/d4data/contents/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json?ref=75e619f0d90a0951945747f45feef59c076a5db0) · [raw](https://raw.githubusercontent.com/DiabloTools/d4data/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json) | `2126168` | `eRarityOverride: 3`. `ptAttributes`: `Damage_Percent_Bonus_Vs_Elites` (`eAttribute: 953`, empty formula, GBID `ParagonNodeDamageBonusToElite_RareMajor`) and `Strength_Core` (`eAttribute: 9`, formula `"0"`, GBID `ParagonNodeCoreStat_RareMinor`). Threshold ref: `WillPowerSide1`. Tags: `Search_Elite`, `Search_Strength`, `Search_Damage`. |

Both rare definitions have `bHasSocket: 0`, `bIsGate: 0`, and `snoPassivePower: null`. Their displayed formula literals are not enough to establish final granted values; the GBID formulas still need to be resolved against the matching current GameBalance data.

## VERIFIED — Difference from the older archive

The previous reports examined `blizzhackers/d4data` commit `9cb0119029d79bdb57fb1d8012f19f298a035baa`, dated 2024-05-16. At that exact revision, the corresponding Contents API and raw URLs returned HTTP 404:

| File | Old Contents API | Old raw |
|---|---|---|
| `StartNodePaladin.pgn.json` | [404](https://api.github.com/repos/blizzhackers/d4data/contents/json/base/meta/ParagonNode/StartNodePaladin.pgn.json?ref=9cb0119029d79bdb57fb1d8012f19f298a035baa) | [404](https://raw.githubusercontent.com/blizzhackers/d4data/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/StartNodePaladin.pgn.json) |
| `Generic_Rare_118.pgn.json` | [404](https://api.github.com/repos/blizzhackers/d4data/contents/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json?ref=9cb0119029d79bdb57fb1d8012f19f298a035baa) | [404](https://raw.githubusercontent.com/blizzhackers/d4data/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Generic_Rare_118.pgn.json) |
| `Barbarian_Rare_039.pgn.json` | [404](https://api.github.com/repos/blizzhackers/d4data/contents/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json?ref=9cb0119029d79bdb57fb1d8012f19f298a035baa) | [404](https://raw.githubusercontent.com/blizzhackers/d4data/9cb0119029d79bdb57fb1d8012f19f298a035baa/json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json) |

The old repository itself and commit were accessible, so these are file-specific 404s, not network or authentication failures.

The earlier reports were accurate for that older snapshot, but their “missing” conclusions do not apply to `DiabloTools/d4data`. The 2026 DiabloTools revision contains all three assets and the exact local Paladin board layout. It therefore includes Paladin data unavailable in the examined 2024 archive.

## UNRESOLVED — Follow-up boundaries

- `Generic_Rare_118` introduces `IntelligenceSide2`; its threshold definition was not fetched in this focused verification.
- `WillPowerSide1` is also referenced by `Barbarian_Rare_039`, but the previous threshold formula came from the older archive. Its current DiabloTools definition should be checked before using that value.
- The newly observed GBIDs (`ParagonNodeCoreStat_RareMinor` and `ParagonNodeDamageBonusToElite_RareMajor`) need resolution from the current DiabloTools GameBalance data. Do not treat the node's `"15"`, `"0"`, or empty formula strings as final calculated bonuses.
- This pass verified the source repository and the three files only; it did not compare every ParagonNode or GameBalance definition between repositories.
