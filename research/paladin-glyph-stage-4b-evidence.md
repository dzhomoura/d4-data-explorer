# Stage 4B supplementary glyph evidence

This record adds the player observations supplied after [Stage 4A calibration](paladin-glyph-numerical-calibration.md). Pinned source is Diablo IV 3.2.4.74043 at DiabloTools/d4data revision `75e619f0d90a0951945747f45feef59c076a5db0`. [Pinned data commit](https://github.com/DiabloTools/d4data/commit/75e619f0d90a0951945747f45feef59c076a5db0)

## Canny post-calibration reading

**Verified in-game, player-supplied.** At level 150 with **22 purchased Intelligence** in range, Canny displayed **+53.0% Non-Physical Damage** as its Primary socket result and **+12.1% per five Intelligence** in its Primary description. The Legendary tooltip displayed **15.4%[x]**, and the Additional requirement displayed **22/25 Intelligence** and was unmet. The observation was obtained after the Stage 4A model fit.

| Primary model | Predicted unrounded points | Nearest-tenth display |
| --- | ---: | ---: |
| Source-aligned 0.033 budget | 53.0343 | +53.0% |
| Original 0.99 slope-only adjustment | 53.0783 | +53.1% |

The new point favors the source-aligned model over the original slope-only adjustment. Rounded tooltip evidence still permits other parameterizations. The association of the runtime intrinsic with the authored array entry near 0.033 is **experimentally supported by the model fit** and its runtime binding remains unresolved. The Legendary number and unmet Additional condition are tooltip evidence. Stage 4B applies only Primary numeric contributions.

## Player-confirmed membership and progression

- Purchased Rare node core attributes enter the local glyph pool.
- Equipment and external character attributes are excluded.
- The pool uses only purchased attributes within the current radius.
- Radius expands at levels **25** and **51**. Purchased nodes newly inside the radius contribute immediately.

These confirmations are qualitative. They carry no additional numerical samples or screenshots. Level 51 for the second radius expansion supersedes the earlier provisional boundary classification for **radius**. The exact Legendary upgrade transaction remains unisolated.

## Planner conventions and open mechanics

The numerical Primary contribution applies only after the socket itself is purchased. This is an explicit planner convention. Local inputs use existing unamplified base core values, with conditional core inputs outside Stage 4B. The Canny, Turf and Spirit catalogue entries have direct numeric observations. The other twelve operation-2 glyphs use source-derived extrapolations. Node amplification, Additional passives, Legendary numerical effects and combat behavior are deferred.
