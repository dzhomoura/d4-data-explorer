# Chapter IV — Stage 1 workspace refinement

The planner places Points spent, Allocated nodes, save status, and Reset Allocation in a compact row that wraps on small screens. The latest interaction feedback stays directly below it. A keyboard-operable Help disclosure contains the allocation and refund instructions, gate and socket guidance, and provisional point costs. The inspector's local rotation control is in the workspace so it stays available in fullscreen.

External Attributes opens from a collapsed summary with the four current values. The summary displays the last accepted values while an input contains an invalid entry. Valid edits immediately update threshold totals. The expanded copy explains which attributes come from outside Paragon and how they contribute to thresholds.

## Fullscreen and camera

The fullscreen target contains the existing board, allocation header, legend, zoom controls, Total Stats, tooltips, and the three board dialogs. The ordinary page header, External Attributes, and Advanced Calculation Details sit outside the target. The button in the upper right of the viewport uses the browser Fullscreen API first. If the API is unavailable or rejects the request, a fixed workspace fills the dynamic viewport and locks page scroll. Both modes prevent keyboard focus from moving to surrounding page controls.

The same board and transform are retained across entry and exit. The stage center stays the camera reference, so the board point at the center and the zoom level carry over as the visible area changes. Fit recenters against the active stage dimensions. Tooltips and open dialogs reposition after a resize, and dialog bounds follow the visible viewport when the browser exposes it.

The fullscreen button follows the browser's `fullscreenchange` event. Fallback Escape first lets an open picker or board-management dialog dismiss and restore its own focus. Escape with no modal exits fallback, restores the page scroll position, and returns focus to the fullscreen button. Native Escape uses the browser's fullscreen behavior.

## Changed files

- `paragon-visual/index.html` contains the compact header, Help and External Attributes disclosures, and the shared workspace.
- `paragon-visual/style.css` sizes the workspace and positions the controls for normal, native fullscreen, and fallback layouts.
- `paragon-visual/app.js` updates the attribute summary, synchronizes fullscreen and focus, and fits and positions the board and its overlays.
- `tests/planner-browser.test.mjs` adds the desktop native and mobile fallback regression checks.
- `HANDOVER.md` records the new workspace behavior and verification.
- `research/screenshots/chapter-iv-stage-1/` contains the review captures.

## Verification

Run with Node.js 22 or later and Chrome enabled. Set `SCREENSHOT_DIR` to an existing directory to collect the PNGs.

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node --experimental-default-type=module --test tests/*.test.mjs
```

The original 59-test baseline passed. The final suite passed **61 tests with zero failures and zero skips**, including the original 59 checks and two new Chrome subtests. The runs used Node.js 22.16.0 and headless Chrome 158.0.8127.37.

The Chrome checks exercised real Fullscreen API entry and button exit, plus a separate `document.exitFullscreen()` call to verify synchronization from an exit outside the app toggle. They also covered rejected and unavailable API paths, Escape priority, scroll and focus restoration, resizing and Fit, allocation and refund, contributor highlighting, attachment and rotation, and glyph editing. Storage and calculation snapshots verified that transitions preserved the build and scenario. The attribute disclosure checks covered keyboard access, validation, immediate recalculation, the collapsed summary, and reload.

### Manual verification

Use a headed browser to check the operating-system or browser fullscreen exit gesture, including physical Escape and browser chrome controls. The full headless run exercised the native exit event through the API. A shorter isolated headless run returned a native request denial and entered the CSS fallback. The mobile checks emulated touch and viewport sizes. Physical-device browser chrome, safe areas, and keyboard resizing remain manual checks.

## Screenshot review

Reviewed the desktop captures at 1440 × 1050 and the emulated mobile captures at 390 × 740. The mobile Fit view scales multiple vertically stacked boards as a group, so individual node and board controls appear small until zoomed in.

| State | Capture |
| --- | --- |
| Desktop normal | [PNG](screenshots/chapter-iv-stage-1/stage-1-desktop-normal.png) |
| Desktop native fullscreen | [PNG](screenshots/chapter-iv-stage-1/stage-1-desktop-fullscreen.png) |
| Desktop native fullscreen with Starting Board and Castle | [PNG](screenshots/chapter-iv-stage-1/stage-1-desktop-fullscreen-multiple.png) |
| Desktop native fullscreen with the glyph picker open | [PNG](screenshots/chapter-iv-stage-1/stage-1-desktop-fullscreen-glyph.png) |
| Mobile normal | [PNG](screenshots/chapter-iv-stage-1/stage-1-mobile-normal.png) |
| Mobile expanded fallback | [PNG](screenshots/chapter-iv-stage-1/stage-1-mobile-expanded.png) |
| External Attributes expanded | [PNG](screenshots/chapter-iv-stage-1/stage-1-external-attributes.png) |
