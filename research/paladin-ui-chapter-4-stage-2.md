# Chapter IV — Stage 2 player-facing node tooltips

Normal and Magic tooltips lead with the localized name where the source provides one. Generic nodes use their verified bonus labels. Rare nodes use the definition or calculator registry's localized names, and Legendary nodes use the matched power records. The same naming function supplies ordinary allocation and refund feedback and node accessibility labels. Gates show their displayed direction after rotation. Starting nodes explain their zero-point role.

The shared card uses silver, blue, gold, orange, and purple headings. Ordinary node bonuses appear as a short list. Amplified rows display the effective base, native amount, and glyph addition. A Rare threshold section displays the independent requirements, progress, and grant state from the calculator. A met requirement on an unallocated node remains a preview. The separate native conditional stays out of the amplified base, consistent with the existing provisional policy.

Legendary cards show the calibrated descriptions and one line per effect component. They distinguish allocation, remaining scenario inputs, potential values, and current values. Resolved scenario values are shown where supplied. Glyph sockets use the same card for the assigned glyph, level, radius, Primary, Additional, and Legendary summaries. Locked and unpurchased effects retain their existing status wording.

## Technical inspection

Open **Node Details** in the workspace or press **I** with a node focused. The dialog has a board-grouped cell selector, an optional full player summary, technical evidence, and expandable exact source and calculation records. It preserves internal names and SNOs, attribute IDs and parameters, formulas and literals, exact native and effective values, threshold selectors and requirements, evidence, and Legendary runtime assumptions. Existing build-wide diagnostics remain in Advanced Calculation Details.

The transient card sizes to its content and the visible stage. At each position it prefers space beside the node, checks clearance from Total Stats, and stays below the top controls. The card stays independent of board zoom and passes pointer input through to the board. When a short viewport limits the card's height, the dialog's Player summary provides the full content in a scrollable panel. Node Details also works in native and fallback fullscreen because it shares the workspace's dialog layer.

## Changed files

- `paragon-visual/app.js` renders the cards and node evidence from existing evaluations, provides friendly feedback, and positions the transient card.
- `paragon-visual/legendary-node-panel.js` renders effect components and known or missing scenario values for the new card.
- `paragon-visual/index.html` and `paragon-visual/style.css` define the shared card and persistent Node Details interface.
- `tests/planner-browser.test.mjs` extends existing coverage and adds two Chrome subtests.
- `HANDOVER.md` and `research/screenshots/chapter-iv-stage-2/` record the behavior and visual review.

## Regression and remaining limitations

The Stage 1 baseline passed all 61 tests. The final suite passed **63 tests with zero failures or skips**, including the 61 existing checks and the two new Chrome subtests. Runs used Node.js 22.16.0 and headless Chrome 158.0.8127.37.

The focused checks add all nine Legendary inspector cards, rotated gate naming, known and unknown scenarios, effective Rare base and native conditional separation, threshold progress and grant states, assigned socket summaries, player-facing feedback, keyboard diagnostics, native and fallback fullscreen positioning, and unchanged storage and numerical summaries during inspection. Calculator, registry, save, and pinned data files have identical contents to the baseline.

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  SCREENSHOT_DIR="/path/to/existing/capture-directory" \
  node --experimental-default-type=module --test tests/*.test.mjs
```

The browser runs use desktop Chrome and emulated mobile viewports. Physical-device browser UI and screen-reader announcements require manual verification. Legendary combat application and stacking remain unresolved, as does glyph amplification of Rare conditional bonuses.

## Reviewed screenshots

The review covered the 1440 × 1050 desktop captures and 390 × 740 emulated mobile captures. The mobile Rare card fits below the toolbar and above Total Stats in the reviewed layouts. The fullscreen edge capture shows the board panned to the right and the card kept inside the stage.

| State | Capture |
| --- | --- |
| Normal Strength | [PNG](screenshots/chapter-iv-stage-2/stage-2-normal.png) |
| Magic Maximum Life | [PNG](screenshots/chapter-iv-stage-2/stage-2-magic.png) |
| Rare Brawn with requirement unmet | [PNG](screenshots/chapter-iv-stage-2/stage-2-rare-unmet.png) |
| Rare Brawn with requirement met and bonus active | [PNG](screenshots/chapter-iv-stage-2/stage-2-rare-met.png) |
| Glyph-amplified Constrict | [PNG](screenshots/chapter-iv-stage-2/stage-2-amplified-rare.png) |
| Knight with independent Strength and Willpower requirements | [PNG](screenshots/chapter-iv-stage-2/stage-2-rare-dual.png) |
| Castle with known Armor Damage Reduction | [PNG](screenshots/chapter-iv-stage-2/stage-2-legendary-known.png) |
| Castle with missing Armor Damage Reduction | [PNG](screenshots/chapter-iv-stage-2/stage-2-legendary-missing.png) |
| Challenger socket and locked Legendary preview | [PNG](screenshots/chapter-iv-stage-2/stage-2-assigned-socket.png) |
| Knight Node Details | [PNG](screenshots/chapter-iv-stage-2/stage-2-technical-details.png) |
| Mobile expanded workspace at the right edge | [PNG](screenshots/chapter-iv-stage-2/stage-2-fullscreen-edge.png) |
| Mobile normal workspace | [PNG](screenshots/chapter-iv-stage-2/stage-2-mobile.png) |
