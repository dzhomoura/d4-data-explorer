# Chapter III — Stage 1B: Legendary Paragon board-node implementation

All nine Legendary board nodes now emit standalone scenario records. The planner displays them in node tooltips and Advanced Calculation Details. The comparison source remains DiabloTools/d4data revision `75e619f0d90a0951945747f45feef59c076a5db0`, build **3.2.4.74043**. [Stage 1A source and formula research](paladin-paragon-legendary-node-research.md) · [Dedicated player tooltip calibration](paladin-paragon-legendary-node-calibration.md)

## Scope and evidence

The player inspected all nine tooltips. Their screenshot build remains unconfirmed. **Verified pinned data** covers the node, power and source identities, formula expressions and localized intent. **Player-observed display** covers the tooltips and the inputs and outcomes recorded for Castle and Shield Bearer. The two independent observations of Divinity's 90%[x] damage and Relentless's 30%[+] Cooldown Reduction support the **tooltip-calibrated** Legendary node intrinsic value of `0.15`. Its exact binding and global array index remain unresolved. This constant applies only to the Legendary board-node formulas.

Castle A is consistent with the displayed 5.9% Armor DR and predicted 7.375% bonus. Castle B reports 30.7% Armor DR and 38.3%[x] Current Bonus. Substituting the rounded DR yields 38.375%, and a hypothetical 30.66% input gives 38.325%, consistent with both observed displays. The 30.66% figure is a rounding example. Shield Bearer changes from 22.0%[x] to 27.1%[x] as total Block Chance changes from 20.0% to 24.6%, with the same inherent shield chance and Block Reduction. The observations establish tooltip behavior. Combat application, stacking and runtime cap behavior remain unresolved.

## Formula and effect ownership

| Node | Scenario evaluation and output |
| --- | --- |
| Castle | `min(1.50, armorDamageReduction × 1.25)`. At a resolved 90% Armor DR the bonus is 112.5%[x]. The 150% cap applies to the script result. |
| Shield Bearer | `min(1, blockChance) × 1.10`. The input is total character Block Chance. Phalanx is the source passive label. |
| Fervent | Separate linear previews of `stacks × 0.35` Crit Damage [x] and `stacks × 0.03` Crit Chance [+]. The evaluator imposes no gameplay stack cap. |
| Preacher | Fixed 15%[+] Attack Speed for Zealot skills, plus `bonusAttackSpeed × 0.65` increased damage. The conversion uses the provided resolved input and has unspecified combat notation. |
| Divinity | `6 × 0.15` damage [x] with both Arbiter and Vulnerable predicates. |
| Relentless | Separate 80%[x] damage and `2 × 0.15` Cooldown Reduction [+]. Both use moving state or the two-second post-stop grace period. |
| Sentencing | 90%[x] target amplification from the applying player, triggered by Judging and scoped to the target's lifetime. The scenario checks that this player Judged the target and the target is alive. |
| Endure | 90%[x] damage based on the explicit Fortified state. |
| Beacon | 90%[x] damage with at least one qualifying Aura occupant. The same result applies at any positive count. |

`legendary-board-nodes.js` validates revision, board SNO, source cell, node definition and linked power identity. Each effect has an ownership key formed from board instance, source cell and component ID. Records carry node and power SNOs, source paths, formula, required inputs, input values, eligibility, provenance, normalized magnitude and unresolved runtime assumptions. Explicit inbound class-power references are stored on the owning record as provenance. They do not grant effects.

The calculator evaluates these records in board finish, following ordinary base values, Primary amplification, the Rare threshold pass and glyph effect evaluation. A valid pinned model replaces the legacy unsupported-power diagnostic. Unknown scenario inputs are surfaced on the owning effect. The existing unresolved diagnostic remains for mismatched power or revision. Connected calculation concatenates records from the equipped board instances. `legendaryNodeEffects` is independent of raw bonuses, effective ordinary node contributions, all glyph effect lists, core attributes and Rare inputs. Resolved inputs are read-only and no output feeds a source stat.

## Scenario interface

Single-board calculation takes `calculationContext.legendaryScenario`. Connected calculation accepts an optional fifth argument, following the existing glyph configuration map. The UI takes percentages and normalizes them before evaluation. An API caller supplies normalized fractions, so `0.246` means 24.6%.

| Keys | Input semantics |
| --- | --- |
| `armorDamageReduction`, `blockChance`, `bonusAttackSpeed` | Non-negative fractional character values already resolved for the scenario. The planner uses them as supplied, including any equipment, Paragon or skill contributions already reflected in them. Values over 1 can exercise authored cap behavior. |
| `fervorStacks`, `qualifyingAuraOccupants` | Non-negative whole counts. Zero is distinct from an unknown count. |
| `inArbiter`, `targetVulnerable`, `moving`, `targetJudgedByPlayer`, `targetAlive`, `fortified` | Explicit Booleans. Target ownership refers to the current player. Positive Fortified Health alone is insufficient. |
| `secondsSinceStopped` | Non-negative seconds used when `moving` is false. Moving is sufficient by itself. At exactly two seconds this planner preview includes the grace period, with the precise runtime boundary still unverified. |

Omitted fields or field values of `null` or `undefined` are unknown. The API rejects invalid field names, units and value types. Counts and other numeric inputs are finite and bounded to the safe integer range, with fractional values allowed for time and ratios. A known false predicate can make a conjunction false even when another predicate is unknown. Allocation controls `grantStatus`. `eligibilityStatus` separately records `satisfied`, `not-satisfied` or `unknown`. The potential or evaluated `magnitude` can exist while the effect is unallocated or ineligible. `currentMagnitude` exists only when the effect is granted and eligible, with `null` otherwise.

Advanced Details shows a collapsible input panel for the currently equipped Legendary nodes and a separate Legendary Board Effects section with the scenario outcome and formula evidence. Input edits are page-local, carry across board views during the session and clear on reload. Existing saves contain allocations and glyph configuration. Reload reconstructs Legendary ownership from allocations, and unallocated records are previews. No save changes or migrations are needed.

## Files changed

| Files | Role |
| --- | --- |
| `paragon-visual/legendary-board-nodes.js` | Pinned registry, scenario validation and pure effect evaluator |
| `paragon-visual/paragon-calculator.js`, `connected-boards.js` | Board finish evaluation and connected ownership aggregation |
| `paragon-visual/legendary-node-panel.js`, `app.js`, `index.html`, `style.css` | Scenario controls, Legendary tooltips and effect details |
| `tests/legendary-board-nodes.test.mjs`, `connected-boards.test.mjs`, `planner-browser.test.mjs` | Identity, formula, scenario, ownership, save restoration and browser coverage |
| `HANDOVER.md`, `research/paladin-paragon-legendary-node-calibration.md`, `research/paladin-paragon-legendary-node-implementation.md` | Handover, evidence and implementation record |

## Regression results

The complete suite passed **59 tests with zero failures and zero skips** using Node.js 22.16.0 and headless Chrome 158.0.8127.37. The historical Space and Delete gate-key failures did not recur. Existing keyboard assertions are intact. The new browser test covered 1440 × 1050 desktop and 390 × 740 mobile emulation. It verified shown and hidden inputs, unknown output after reload, Castle and Shield Bearer previews, allocation and refund transitions, layout fit, clearing inputs, and unchanged save data and additive Total Stats during scenario edits. Desktop and mobile screenshots were reviewed.

A separate comparison against the Stage 1A checkout matched the legacy numerical results and outputs in **1,680 cases**. It covered all ten boards, all 21 glyphs at levels 25 and 150, zero and high external attributes, and full-grid diagnostics with and without each Legendary node. It checked the new legacy unresolved count separately because modeled allocated powers now leave that counter. All native node values, Rare thresholds, Primary contributions and glyph effect records matched exactly.

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node --experimental-default-type=module --test tests/*.test.mjs
```

## Future Build Lab requirements

A character-stat provider can populate the scenario with resolved Armor DR, total Block Chance and qualifying Bonus Attack Speed once the inputs and units are validated. It should keep source and applied modifier identities distinct and supply its resolved values only once. The game Armor-to-DR formula, Preacher's conversion basis and self-component inclusion, Crit and Fervor stacking, cooldown application, source-scoped Judging, Fortified-state boundaries, Aura occupancy timing and broader combat stacking still need controlled observations. A later combat consumer can interpret stat scope, skill applicability, actor and target predicates and timed events after that evidence exists. The standalone scenario records can serve as its input contract.
