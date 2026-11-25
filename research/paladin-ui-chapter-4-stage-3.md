# Chapter IV — Stage 3 glyph picker and management

The glyph dialog places a searchable alphabetical catalogue beside the configuration on desktop and stacks the panes on narrow screens. It reuses the 21 Paladin glyphs and their existing emblems. The assigned badge identifies the glyph on the current socket, and the highlighted button identifies the glyph being previewed. Search can move focus into the results with Arrow Down. Arrow Up, Arrow Down, Home, and End navigate the list, and Enter or Space selects the focused glyph.

The editor links a whole-number field, a 1–150 slider, and presets at levels 1, 25, 51, 100, and 150. Level 25 expands the radius from 3 to 4. Level 51 expands the radius to 5 and unlocks the Legendary bonus. Pressing Enter in the numeric field moves focus to the confirmation button. Activate that button to apply the configuration.

Primary shows the existing conversion coefficient, in-radius purchased pool, and resulting contribution, or the affected rarity, count, amplification percentage, and per-attribute contributions. Additional shows local requirement progress, the grant state, and the existing effect conditions. Legendary shows the level 51 magnitude as a locked preview below the transition, then separates draft, unpurchased, and applied effects using their typed scopes. The socket tooltip groups the same records under compact Primary, Additional, and Legendary headings.

## Preview isolation

The picker keeps the assigned configuration and the selected glyph and level separate. An unchanged assignment uses the current calculation. A connected draft uses the existing configuration helper to create a temporary glyph map and passes it to the same build calculation functions used when the user saves. The inspector passes the candidate as a temporary calculator option. The preview reads the candidate socket's effect records and compares Rare grant states with the live result, including changes on other boards. It presents candidate grants as hypothetical.

Rendered totals, the exact live diagnostics, board radius overlays, allocations, scenarios, and persistent storage continue to use the applied configuration. The picker reports the draft radius in the level editor. Cancel, Close, and Escape discard glyph selection and level edits. Explicit Save or Replace uses the existing persistence and render path, and confirming an identical assignment closes without rewriting it. Allocate Socket and Remove Glyph remain explicit, immediate actions. Inspector glyph edits remain session-only. The existing duplicate-assignment, eligibility, and save-conflict behavior is preserved.

Technical coefficients, ownership, IDs, source records, exact contributions, evidence and unresolved runtime assumptions remain available in **Node Details** and **Advanced Calculation Details**.

## Changed files

- `paragon-visual/glyph-picker.js` handles the catalogue, level editor, draft state, effect presentation, and confirmation.
- `paragon-visual/app.js` shares the build calculation between preview and save, projects changed Rare grants, and renders the grouped socket tooltip.
- `paragon-visual/index.html` and `paragon-visual/style.css` define the responsive panes, editor, effects, and action area.
- `tests/planner-browser.test.mjs` adds browser coverage for the complete preview and confirmation workflow.
- `HANDOVER.md` and `research/screenshots/chapter-iv-stage-3/` record the implementation and visual review.

## Verification and limitations

The final Chrome-enabled suite passed **64 tests with zero failures or skips**, including the original 63. It used Node.js 22.16.0 and headless Chrome 158.0.8127.37. The run exercised native fullscreen, mobile fallback, and effects scrolling and cancellation at 820 × 380. Calculator, progression, pinned catalogue, and persistence modules retain their baseline contents.

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  SCREENSHOT_DIR="/path/to/existing/capture-directory" \
  node --experimental-default-type=module --test tests/*.test.mjs
```

The focused workflow covers Spirit, Canny, Challenger, Outmatch, and Resplendence, with the existing suite covering all 21 definitions, duplicate glyph assignments, persistence conflicts, and socket refunds. The candidate and committed Challenger cases compare the displayed Primary and amplification amounts, and the committed diagnostic record matches the exact calculator result. A Castle draft can activate Starting Board's Brawn threshold, while opening, choosing, editing, and cancelling leave live state and storage unchanged. The explicit replacement writes once and reload restores the result.

Combat effect application, stacking, Rare conditional amplification, and the Legendary upgrade transaction remain unresolved. Drafts report changes in allocated Rare grants and preserve the saved board overlay. Physical-device browser chrome and assistive technology announcements require manual verification.

## Reviewed screenshots

Reviewed four 1440 × 1050 desktop captures and one 390 × 740 emulated mobile capture. The mobile view shows the scrolled editor with its confirmation and cancellation controls visible below it.

| View | Capture |
| --- | --- |
| Desktop catalogue, Canny conversion, unmet Additional, locked Legendary | [PNG](screenshots/chapter-iv-stage-3/stage-3-conversion-unmet.png) |
| Challenger amplification, satisfied Additional, and Rare preview | [PNG](screenshots/chapter-iv-stage-3/stage-3-amplification-satisfied.png) |
| Unsaved Spirit level 51 draft with unlocked Legendary | [PNG](screenshots/chapter-iv-stage-3/stage-3-unlocked-draft.png) |
| Desktop glyph management in native fullscreen | [PNG](screenshots/chapter-iv-stage-3/stage-3-fullscreen.png) |
| Mobile editor in fallback fullscreen | [PNG](screenshots/chapter-iv-stage-3/stage-3-mobile-fullscreen.png) |
