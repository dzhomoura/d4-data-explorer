# Chapter II — Stage 6B: Additional and Legendary glyph effects

Stage 6B implements planner eligibility and typed effect records for all 21 Paladin glyphs. The picker, socket tooltip and Advanced Calculation Details show Primary contributions, Additional requirements and passives, and Legendary previews or applied modifiers. The underlying catalogue remains pinned to Diablo IV 3.2.4.74043, enUS, at revision `75e619f0d90a0951945747f45feef59c076a5db0`. [Approved Stage 6A evidence](paladin-glyph-stage-6a-evidence.md)

## Calculation and ownership

The calculator preserves its two-pass order. It resolves owned unconditional node values and operation-1 Primary deltas, then builds the global attribute snapshot used by placement-sensitive Rare thresholds. It resolves active native conditional amounts before adding the operation-2 Primary socket aggregate. Stage 6B evaluates glyph effect eligibility in board finish, with no feedback into core attributes, Rare requirements, native node results or additive `rawBonuses`. The Stage 5B amplification Additional diagnostic remains available on the Primary result as a compatibility projection of the shared requirement evaluator.

An Additional requirement uses purchased cells inside the source socket's same-instance Manhattan radius. It evaluates matching attribute IDs and parameters at full precision, summing native and effective unconditional values separately. Effective values include applicable operation-1 Primary deltas. External and global attributes, the socket itself, other boards, unpurchased cells and conditional values are excluded. A missing qualifying native value makes the result unresolved. Known partial sums remain available for diagnostics. Each requirement carries the pinned selector SNO, source path and required value.

Each configured socket emits one `additionalGlyphEffects` record keyed by board instance, source socket index, glyph and affix, with its passive power SNO and source references. The record includes requirement progress and one or more typed effects. A purchased, configured socket with a resolved, satisfied requirement has status `granted`. Predicate and trigger fields describe the combat state needed to use the passive. Imbiber and Retribution each keep two distinct component effects. Honed emits flat Faith generation and Resplendence emits seconds off each active non-Aura cooldown. Control carries an alternative branch. Undaunted exposes the cap and an unresolved scaling function. Sentinel's authored stack-limit parameter stays distinct from a gameplay cap.

Legendary uses the exact authored starting scalar and slope with `effectiveLevel = Math.max(51, level)`. `legendaryGlyphPreviews` contains locked and unpurchased previews in calculation results. At Legendary planner rarity, a purchased configured socket emits `legendaryGlyphModifiers` independently of Additional eligibility. Each applied entry owns one authored attribute ID and parameter within its socket. Operator 7, scope and full-precision normalized fraction travel with the destination. Judicator emits Holy and Fire records. The generic multiplier uses `Multiplicative_Damage_Percent_All_From_Skills` (253, parameter −1). Connected calculation concatenates per-board records and retains separate ownership for effects with identical destinations.

Picker edits evaluate against current board allocations and show an unsaved preview when an edit could otherwise grant or apply an effect. A configured, unpurchased socket also exposes a separate Primary preview without entering the active Primary list. Exact local pools, Legendary fractions and destination identities remain available in Advanced Calculation Details. The existing `{ snoId, level }` configuration fields are sufficient to derive all records after loading. Inspector assignments remain session-only. [Calculator](../paragon-visual/paragon-calculator.js) · [Connected calculation and saves](../paragon-visual/connected-boards.js) · [Glyph effects evaluator](../paragon-visual/glyph-effects.js)

## Evidence and limits

- **Verified pinned data** covers source and affix references, selectors, literal script parameters, Legendary scalars and destinations, and native Legendary operator 7. Additional power files expose no native destination or operator for these effects.
- **Player-observed tooltip evidence** covers all 21 Additional parameter sets and Primary and Legendary coefficients. The 11 intrinsic-dependent Additional effects use the experimentally supported nominal `0.10` calibration. The other ten match authored literals. The Legendary curve is experimentally supported at displayed precision. Earlier Primary classifications and independent node and socket readings retain their provenance.
- **Unresolved runtime behavior** includes the threshold intrinsic's internal binding, the exact Legendary upgrade transaction around level 50, actual damage and DR composition, and same-attribute stacking. Target debuff accumulation and refresh, overlapping Control predicates, resource and cooldown event granularity, and the Fortify-to-DR curve remain open. Challenger's level-10 socket and global sheet discrepancy and conditional Rare amplification remain open. The nine Legendary Paragon board-node powers are outside this implementation. [Stage 6A uncertainties and checkpoints](paladin-glyph-stage-6a-evidence.md#remaining-runtime-questions)

## Files changed

| Files | Role |
| --- | --- |
| `paragon-visual/glyph-effects.js`, `glyph-amplification.js` | Shared requirements, Additional power metadata, operation-4 evaluation and compatibility projection |
| `paragon-visual/paragon-calculator.js`, `connected-boards.js` | Per-socket calculation outputs and connected ownership |
| `paragon-visual/glyph-picker.js`, `app.js`, `index.html`, `style.css` | Picker, tooltip and advanced displays |
| `tests/glyph-effects.test.mjs`, `connected-boards.test.mjs`, `planner-browser.test.mjs` | Observation fixtures, calculation boundaries, lifecycle and desktop/mobile regressions |
| `HANDOVER.md`, `research/paladin-glyph-stage-6b-implementation.md` | Handover and implementation record |

## Verification

The automated fixtures exercise all 21 observation rows, all ten Legendary affixes and three scalar families, and all three local selectors. Boundary checks cover precise threshold comparisons, foreign and unpurchased cells, conditional and external exclusions, effective versus native pools, unresolved inputs, radii, levels 50/51/150, grants, Legendary application with an unmet Additional requirement and typed dual destinations. Connected tests cover unique ownership, refunds, rotation, reset, replacement and removal, reload and saved-draft compatibility. The pre-existing browser path covers malformed saves, migration and save conflicts.

A separate comparison against the Stage 5B checkout matched 4,200 results across all ten boards, all 21 glyphs and levels 1, 25, 50, 51 and 150. The comparison tested full-board diagnostic allocations with and without the socket, at zero and high external attributes. It omitted only the new effect and preview fields and the added selector provenance on the legacy Additional diagnostic. All native node, Primary, global attribute and Rare threshold results matched exactly.

The final complete suite passed **49 tests with zero failures and zero skips** under Node.js 22.16.0 and headless Chrome 158.0.8127.37. The Stage 6A focused-gate Delete failure did not recur. Its assertion and keyboard interaction remain intact.

Browser checks covered a 1440 × 1050 desktop viewport and 390 × 740 touch emulation for the Stage 6B picker, socket tooltips and diagnostics, alongside the existing 320 × 640 mobile checks. Screenshot review surfaced a long attribute identifier extending past the mobile details panel. The final run verifies full wrapping and scroll access to the applied Legendary line. Canny's 53.0% additive Primary total remained separate from its 15.4% applied Legendary modifier with a 22/25 Additional pool. Challenger showed its granted 18% passive alongside its locked Legendary preview.

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node --experimental-default-type=module --test tests/*.test.mjs
```
