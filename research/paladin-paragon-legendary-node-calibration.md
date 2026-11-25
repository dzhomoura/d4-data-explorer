# Chapter III — Legendary board-node tooltip calibration

The player inspected all nine Legendary board information tooltips. The reported descriptions and displayed coefficients agree with the pinned Stage 1A research. The game build of the player's screenshots is **unconfirmed**. The comparison source is DiabloTools/d4data revision `75e619f0d90a0951945747f45feef59c076a5db0`, build **3.2.4.74043**. **VERIFIED — IN-GAME** below refers to the reported tooltip or character-sheet display only. Numerical predictions are **DERIVED FROM DATA**. The observations do not establish combat effects, stacking or behavior at the caps. [Pinned source chains and research](paladin-paragon-legendary-node-research.md)

## Legendary node budget

| Node | Pinned expression | Player tooltip | Nominal intrinsic |
| --- | --- | --- | --- |
| Divinity | `6 × ParagonPowerBudgetMultiplierNodeLegendary()` | 90%[x] damage with both predicates | 0.15 |
| Relentless | `2 × ParagonPowerBudgetMultiplierNodeLegendary()` | 30%[+] Cooldown Reduction while moving and in the two-second grace period | 0.15 |

The two tooltips independently support the **tooltip-calibrated** value of 0.15. The runtime binding and global array index remain **UNRESOLVED**. This is the Legendary board-node budget. The glyph budgets have separate sources and calibration. [Pinned Divinity formula](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/Paragon_Paladin_Legendary_005.pow.json) · [Pinned Relentless formula](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/Paragon_Paladin_Legendary_006.pow.json)

## Castle

| Measurement | A | B |
| --- | ---: | ---: |
| Equipment Armor | 66 | 2,348 |
| Strength-derived Armor | 292 | 286 |
| Other Armor | 0 | 0 |
| Total Armor | 358 | 2,634 |
| Displayed Armor Damage Reduction | 5.9% | 30.7% |
| Observed Current Bonus | 7.4%[x] | 38.3%[x] |
| Predicted result using displayed Armor DR | 7.375% | 38.375% |

B is consistent with independently rounded displays. As an illustration, **30.66%** Armor DR rounds to 30.7%, and the resulting **38.325%** Castle bonus rounds to 38.3%. The 30.66% value is hypothetical. The observations do not identify the unrounded Armor DR or support reconstructing it from raw Armor. The source clamp is a 150% damage bonus. At an Armor DR input of 90% the predicted bonus is 112.5%. [Pinned Castle formula](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/Paragon_Paladin_Legendary_001.pow.json)

## Shield Bearer

| Measurement | A | B |
| --- | ---: | ---: |
| Inherent shield Block Chance | 20.0% | 20.0% |
| Additional Block Chance | 0% | 4.6% |
| Character Block Chance | 20.0% | 24.6% |
| Block Reduction | 27.7% | 27.7% |
| Observed Current Bonus | 22.0%[x] | 27.1%[x] |
| Predicted bonus | 22.0% | 27.06% |

The changing tooltip result supports using resolved total character Block Chance. Inherent shield Block Chance and Block Reduction were unchanged in these observations. The public node name is Shield Bearer and the pinned passive label is Phalanx. [Pinned Shield Bearer formula](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/Paragon_Paladin_Legendary_002.pow.json)

## Remaining inspected tooltips

| Node | Reported tooltip agrees with |
| --- | --- |
| Fervent | 35%[x] Critical Strike Damage and 3%[+] Critical Strike Chance per Fervor stack. |
| Preacher | 15%[+] Zealot Attack Speed and a damage conversion of 65% of qualifying Bonus Attack Speed. |
| Relentless | The same movement condition covers 80%[x] damage and the separately calibrated Cooldown Reduction. |
| Sentencing | A Judged enemy takes 90%[x] more damage from the applying player until death. |
| Endure | 90%[x] damage while Fortified. |
| Beacon | 90%[x] damage with qualifying ally or mercenary Aura occupancy. |

Separate measurements remain necessary for effective node or combat contributions, the exact qualifying Bonus Attack Speed, Fervor accumulation and caps, interactions with other effects, and timing or ownership edge cases. [Stage 1A validation plan](paladin-paragon-legendary-node-research.md#in-game-validation-plan)
