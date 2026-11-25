# Chapter II, Stage 4A — Paladin glyph numerical calibration

## Executive summary

The strongest source-supported Primary candidate is **rank-one linear scaling, with the entire authored scalar multiplied by the Main or Side power budget**. If `ParagonPowerBudgetMultiplierGlyphStatBonusRare()` returns the pinned global entry near **0.033**, the effective per-five factors are **0.66 Main** and **0.99 Side**. This explains the data without a separate slope correction. It reproduces all 15 supplied socket totals, all five supplied per-five description readings, and all three supplied individual-node readings at their displayed precision. The runtime binding of the intrinsic and the operator’s final normalization remain unresolved.

The supplied slope-only model reproduces all 15 socket totals. Its level-100 Canny coefficient, **8.35075**, would display **8.4%** under nearest-tenth rounding, while the description showed **8.3%**. A small refit of the slope-only model still fits all observations, so the readings do not uniquely distinguish a common normalization from every slope-only alternative.

Canny’s +7 Intelligence and mixed-pool readings support continuous local conversion. The two +5 Canny nodes distinguish the observed **24.1%** socket total from summing their displayed **12.1%** contributions. Turf similarly shows 11.1% for two five-point increments instead of 11.2%. These observations support aggregation at a precision finer than the displayed node or coefficient values. The three tested Legendary tooltips fit their authored rank-one curves without the Primary adjustment. Their displayed Legendary bonuses are independent of the unmet Additional requirements in the recorded states. Combat activation and stacking were outside the observations.

**Scope.** This report uses Diablo IV build 3.2.4.74043 and the DiabloTools extraction at commit `75e619f0d90a0951945747f45feef59c076a5db0`. The Stage 1 research, current handover, Stage 2 catalogue and Stage 3 geometry are the starting point. The supplied record is the in-game evidence for this calibration. Original captures and full allocations were not attached to the brief, so exact routes and metadata in the experiment section are proposed fixtures. [Pinned commit](https://github.com/DiabloTools/d4data/commit/75e619f0d90a0951945747f45feef59c076a5db0) · [Pinned build version](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/buildVersion.txt) · [Stage 1 research](paladin-paragon-glyph-research.md)

## Observation record

**VERIFIED — IN-GAME** below refers to the player-supplied matching-build tooltip record. **VERIFIED — DATA** refers to explicit authored fields and expressions. **DERIVED FROM DATA** marks checked joins or arithmetic on authored fields. **EXPERIMENTALLY SUPPORTED** marks a runtime inference consistent with the observations. **UNRESOLVED** applies where observations and extraction do not settle execution. All Primary numbers below are additive percentage points. Legendary columns show multiplicative display percentages.

| Glyph | Level | Purchased local stat | Primary socket | Legendary |
| --- | ---: | ---: | ---: | ---: |
| Canny | 1 | 5 INT | 1.0% | Locked |
| Canny | 6 | 5 INT | 1.4% | Locked |
| Canny | 9 | 5 INT | 1.6% | Locked |
| Canny | 25 | 7 INT | 3.9% | Locked |
| Canny | 100 | 17 INT | 28.4% | 10.4%[x] |
| Canny | 150 | 5 INT | 12.1% | 15.4%[x] |
| Canny | 150 | 7 INT | 16.9% | 15.4%[x] |
| Canny | 150 | 10 INT | 24.1% | 15.4%[x] |
| Canny | 150 | 17 INT | 41.0% | 15.4%[x] |
| Turf | 100 | 5 STR | 5.6% | 12.2%[x] |
| Turf | 100 | 10 STR | 11.1% | 12.2%[x] |
| Turf | 100 | 15 STR | 16.7% | 12.2%[x] |
| Spirit | 100 | 5 WIL | 17% | 14.2%[x] |
| Spirit | 100 | 10 WIL | 33% | 14.2%[x] |
| Spirit | 100 | 15 WIL | 50% | 14.2%[x] |

| Surface | Glyph and level | Reading |
| --- | --- | ---: |
| Primary description, per five | Canny 25 / 100 / 150 | 2.8% / 8.3% / 12.1% |
| Primary description, per five | Turf 100 | 5.6% |
| Primary description, per five | Spirit 100 | 16.7% |
| Individual Magic +7 INT | Canny 25 / 150 | 3.9% / 16.9% |
| Individual Normal +5 INT | Canny 150 | 12.1% |
| Two Normal +5 INT nodes | Canny 150 | 24.1% socket total; 24.2% as a sum of displayed values |

Spirit’s socket precision is integer. Its coefficient and Legendary tooltip use one decimal. The observed single-node Canny readings agree with the corresponding one-node socket totals at the available precision. Two surfaces may still apply different rules or use different precision internally.

| Glyph | Observed Additional description | Authored requirement | Recorded Legendary state |
| --- | --- | --- | --- |
| Canny | 1%[x] per qualifying Non-Physical event, up to 15%[x], for 15 s | 25 local INT | Displayed at levels 100 and 150 while Additional remained unmet |
| Turf | 15% Damage Reduction against Close enemies | 40 local STR | Displayed at level 100 while Additional remained unmet |
| Spirit | Critical Strikes increase damage taken from you by 3%[x] for 20 s, up to 12%[x] | 25 local WIL | Displayed at level 100 while Additional remained unmet |

These are tooltip observations. No hits, target debuff stacks, refresh rules, damage reduction, or combat multipliers were measured.

## Source evaluation chains

### Primary affixes and budget

**VERIFIED — DATA.** Each glyph definition in `json/base/meta/ParagonGlyph/<internal>.gph.json` points through `arAffixes[0]` to a Primary affix. For the 15 rows in this report the affix has `eBonusOperation=2`, exactly one map in `unk_e80c332`, an empty `arThresholdSelector`, an empty `arAffectedNodeAttributeList`, `eAffectedNodeRarity=0`, and `eRequiredRarity=0`. Its map preserves the source `tSourceAttribute.eAttribute/nParam` and destination `tDestinationAttribute.eAttribute/nParam`. The `gbidPowerBudgetFormula` is a group-22 reference. The localized Primary template supplies the five-point wording and `GlyphAffixScalar` with a one-decimal format. The extracted value feeding that token is supplied by the runtime.

| Glyph / SNO | Definition | Primary affix / SNO | Source → destination (parameter) |
| --- | --- | --- | --- |
| Canny / 1029487 | [Rare_063_Intelligence_Side](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_063_Intelligence_Side.gph.json) | [NonPhysicalDamage_Intelligence_Side](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/NonPhysicalDamage_Intelligence_Side.gaf.json) / 1030695 | INT core 10 → `NonPhysical_Damage_Percent_Bonus` 256 (−1) |
| Turf / 2506847 | [Rare_014_Strength_Main](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_014_Strength_Main.gph.json) | [DamageToNear_Strength_Main](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageToNear_Strength_Main.gaf.json) / 2506849 | STR core 9 → `Damage_Bonus_To_Near` 1105 (−1) |
| Spirit / 2506810 | [Rare_050_Willpower_Side](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_050_Willpower_Side.gph.json) | [SpiritCritDamage_Willpower_Side](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/SpiritCritDamage_Willpower_Side.gaf.json) / 2506834 | WIL core 11 → `Crit_Damage_Percent` 288 (−1) |

At `json/base/meta/GameBalance/AttributeFormulas.gam.json` → `ptData[0].tEntries[i].arRanges[0].tFormula`, the budget joins are:

| Index | GBID | Formula | Authored expression |
| ---: | ---: | --- | --- |
| 568 | 379537727 | `ParagonGlyphAdditive_Rare_StatMain` | `0.04 * ParagonPowerBudgetMultiplierGlyphStatBonusRare()` |
| 569 | 379761887 | `ParagonGlyphAdditive_Rare_StatSide` | `0.06 * ParagonPowerBudgetMultiplierGlyphStatBonusRare()` |

Both have one entry with start 0 and range fields `[0,99999]`. Their compiled forms share the same intrinsic call encoding after their different constants. Neither expression takes a rank argument. In `globals.glo.json` at `ptContent[0].arParagonPowerBudgetMultiplier`, index **9** has **0.032999999821186066**. The array at nominal precision is `[0.01,0.025,0.02,0.05,0.04,0.05,0.04,0.15,0.05,0.033,0.10]`. The extraction exposes neither a named index map nor the body of the intrinsic. Inferring index 9 from the numeric fit does not prove the runtime performs that lookup. [Pinned budget expressions](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/AttributeFormulas.gam.json) · [Pinned global settings](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Global/globals.glo.json)

**VERIFIED — DATA.** In `definitions.json` type `443290979`, the scalar fields at offsets 76 and 80 and the unnamed field at offset 84 have the same float type. The authored intercepts and nominal slopes are 1/0.075 for Canny and Turf, and 2/0.15 for Spirit. Exact exported slopes are 0.07500000298023224 and 0.15000000596046448. The unnamed field is 500 across the 15 operation-2 Primary affixes. The operation-4 Legendary affixes use 100 there. Those numbers are consistent with 5 × 100 and 100 unit conversions. The field name and operator implementation leave its role unresolved. [Pinned extraction schema](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/definitions.json)

**Table and rank search.** The 39 `PowerFormulaTables.gam.json` entries contain damage, healing, weapon, skill rank and related tables. None is named or referenced as the ordinary glyph Primary curve. The 201-row `ParagonGlyphExperienceTable.gam.json` has `nDeltaXP` rows populated at indices 0–20 and zero thereafter. The relevant glob of authored formula names has a legacy Vampiric expression with explicit `Floor` and `ParagonGetGlyphLevel` (entry 570). None of these 15 affixes references that expression. The current globals expose radius breakpoints and rarity boundaries, with no linked table mapping the displayed rank into the Primary slope. No interpolation across the budget range or within a progression band is encoded in these references. An internal conversion, computation order, or rank-related quantization remains possible. [Pinned PowerFormulaTables](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/PowerFormulaTables.gam.json) · [Pinned glyph XP table](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/GameBalance/ParagonGlyphExperienceTable.gam.json)

### Candidate unit conversion

Let `L` be displayed level, `t=L−1`, `A` be the eligible local points, `a,b` be the raw affix scalars, `k` be the authored budget coefficient (0.04 or 0.06), and `S` be the intrinsic value. A source-aligned candidate is:

```text
raw fraction per attribute point = k * S * (a + b*t)
B(L), percentage points per five = 100 * 5 * k * S * (a + b*t)
Primary socket amount in percentage points = (A / 5) * B(L)
```

At nominal `S=0.033`, the Main factor is `500×0.04×0.033=0.66` and the Side factor is `500×0.06×0.033=0.99`. The 2:3 ratio follows from the authored budget expressions and fits the matched Canny/Turf coefficient shape. Classify by the **affix’s GBID and mapped source ID**. Filename fragments and destination aliases can mislead. The previous provisional `S=0.05` with the same units gives 1.00 Main and 1.50 Side, approximately 51.5% larger than the 0.033 model. That explains its overestimates under this chain. It does not make the intrinsic binding definitive.

**Precision and order.** Source floats or compiled float constants constrain representation at the asset boundary. At Canny rank 150, using the exported slope, the exported 0.033-like value and float32 0.06 gives a per-five rate around 12.05325. The analogous float32 variation is on the order of millionths of a point for the observed pools. It cannot account for the 0.00075-per-five discrepancy between the slope-only nominal Canny rank-100 coefficient and the 8.35 display boundary. Exact multiplication order, float vs double accumulation, mantissa truncation, intermediate fixed-point steps, tooltip tie rules and shared implementation between the two surfaces remain **UNRESOLVED**. The observations support a precise aggregate or a mathematically equivalent route like multiplying the total stat pool once. They cannot distinguish those routes or exclude all finer quantization.

### Additional power chain

**VERIFIED — DATA.** `arAffixes[1]` links to an operation-5 passive affix, which in turn references a `ParagonThreshold` selector and a power. Canny uses `Glyph_Intelligence_Side` (1025647, INT core 10, literal 25), Turf `Glyph_Strength_Main` (1025642, STR core 9, literal 40), Spirit `Glyph_Willpower_Side` (1025646, WIL core 11, literal 25). The literals are at `ptThresholds[0].tThresholdValueFormula.value`. The expressions below are the relevant `ptScriptFormulas[i].tFormula.value` fields. Define `T=ParagonPowerBudgetMultiplierGlyphThresholdBonusRare()`, a distinct intrinsic from `S`.

| Power | Relevant authored script formulas | Reading if T = 0.10 |
| --- | --- | --- |
| [ParagonGlyph_063](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/ParagonGlyph_063.pow.json) / 1029529 | `SF_0=1/10*T`, `SF_1=1.5*100*T`, `SF_2=15` | 1% per event, 15% displayed cap, 15 s |
| [ParagonGlyph_014](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/ParagonGlyph_014.pow.json) / 1026839 | `SF_0=1.5*T` | 15% Close DR |
| [ParagonGlyph_050](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/Power/ParagonGlyph_050.pow.json) / 1028531 | `SF_0=0.3*T`, `SF_1=40*T`, `SF_2=20` | 3% per critical event, 12% displayed cap, 20 s |

The Spirit and Canny tooltips calculate the cap with `SF_0*SF_1`. Their buff duration references `SF_2`, while the extracted buff’s stack count is 1. Consequently the tooltip cap does not identify the combat accumulator. `T≈0.10` has explicit support from the observed values and a matching nominal global value at index 10. The binding and combat behavior remain unresolved.

## Numerical interval analysis and competing models

For nearest display rounding to `d` decimals, let `h=0.5×10^(−d)`. A displayed socket value `y` with `A>0` constrains `B(L)` to `[(y−h)×5/A, (y+h)×5/A)`. Description coefficients constrain `B(L)` directly. Ties may change which endpoints are closed. The figures below are approximate bounds, with no modeled input error. The one-node readings duplicate same-pool constraints and are not counted as independent evidence.

| Glyph and rank | Per-five interval from socket totals | After applying Primary description |
| --- | --- | --- |
| Canny 1 | 0.950000000–1.050000000 | same |
| Canny 6 | 1.350000000–1.450000000 | same |
| Canny 9 | 1.550000000–1.650000000 | same |
| Canny 25 | 2.750000000–2.821428571 | same |
| Canny 100 | 8.338235294–8.367647059 | 8.338235294–8.350000000 |
| Canny 150 | 12.050000000–12.073529412 | same |
| Turf 100 | 5.550000000–5.575000000 | same |
| Spirit 100 | 16.500000000–16.750000000 | 16.650000000–16.750000000 |

Use `B(L)=α+β(L−1)`. Each row supplies a lower and upper line in the `(α,β)` plane. The following ranges come from intersecting pairs of boundary lines, discarding intersections outside any interval, and projecting the resulting polygon. Marginal ranges cannot be combined independently.

| Linear model constraint | Feasible α | Feasible β |
| --- | --- | --- |
| Canny socket totals only | 0.977655229–1.049542857 | 0.073828571–0.074468954 |
| Canny socket totals and descriptions | 0.977659574–1.024000000 | 0.074000000–0.074468085 |
| All three glyphs with Turf = 2/3 × Canny and Spirit = 2 × Canny | 0.977659574–1.024000000 | 0.074000000–0.074468085 |
| Joint, fixing α = 1 | 1 | 0.074161074–0.074242424 |
| Joint, fixing α = 0.99 | 0.99 | 0.074228188–0.074343434 |
| Joint, fixing β = 0.07425 | 0.987485294–0.999250000 | 0.07425 |
| Joint, fixing β = 0.075 and allowing α to vary | Empty | 0.075 |

Turf and Spirit each have only one observed level. They cannot independently identify both intercept and slope. Under `B=N(a+b·t)`, Turf alone permits `N≈0.658753709–0.661721068` and Spirit alone permits `0.988130564–0.994065282`. Imposing the authored Main-to-Side ratio and retaining the authored unmodified rank-one scalar gives a joint Side factor range of **0.989733060–0.991097923**, and a candidate intrinsic range of **0.032991102–0.033036597**. Under that model, the global 0.033 entry is the only authored array value in the feasible interval. Models that change `k`, the unit scale, or the scalar evaluation can produce the same effective coefficient.

### Residuals and model comparison

The table below shows unrounded socket predictions. Signed residual equals the prediction minus the observed display value. A residual can be nonzero while still lying in the expected display interval.

| Glyph | Level | Local | Observed | Global 0.033 prediction (residual) | 0.99 slope-only prediction (residual) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Canny | 1 | 5 | 1.0 | 0.99000 (-0.01000) | 1.00000 (+0.00000) |
| Canny | 6 | 5 | 1.4 | 1.36125 (-0.03875) | 1.37125 (-0.02875) |
| Canny | 9 | 5 | 1.6 | 1.58400 (-0.01600) | 1.59400 (-0.00600) |
| Canny | 25 | 7 | 3.9 | 3.88080 (-0.01920) | 3.89480 (-0.00520) |
| Canny | 100 | 17 | 28.4 | 28.35855 (-0.04145) | 28.39255 (-0.00745) |
| Canny | 150 | 5 | 12.1 | 12.05325 (-0.04675) | 12.06325 (-0.03675) |
| Canny | 150 | 7 | 16.9 | 16.87455 (-0.02545) | 16.88855 (-0.01145) |
| Canny | 150 | 10 | 24.1 | 24.10650 (+0.00650) | 24.12650 (+0.02650) |
| Canny | 150 | 17 | 41.0 | 40.98105 (-0.01895) | 41.01505 (+0.01505) |
| Turf | 100 | 5 | 5.6 | 5.56050 (-0.03950) | 5.56717 (-0.03283) |
| Turf | 100 | 10 | 11.1 | 11.12100 (+0.02100) | 11.13433 (+0.03433) |
| Turf | 100 | 15 | 16.7 | 16.68150 (-0.01850) | 16.70150 (+0.00150) |
| Spirit | 100 | 5 | 17 | 16.68150 (-0.31850) | 16.70150 (-0.29850) |
| Spirit | 100 | 10 | 33 | 33.36300 (+0.36300) | 33.40300 (+0.40300) |
| Spirit | 100 | 15 | 50 | 50.04450 (+0.04450) | 50.10450 (+0.10450) |

All rows use the observed presentation precision. The 15 socket values and five coefficient descriptions are scored separately. The largest socket gap is the amount by which a prediction exceeds its nearest display interval, in percentage points.

| Model | Socket misses / 15 | Description misses / 5 | Largest socket gap | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Global 0.033, rank one, continuous | 0 | 0 | 0 | Source-aligned candidate |
| User slope-only factor 0.99, rank one | 0 | 1 | 0 | Canny 100 per-five value 8.35075 sits 0.00075 above the 8.3 display bin |
| Refitted slope-only factor 0.9895, rank one | 0 | 0 | 0 | Canny 100 per-five value 8.3470375; observationally viable and lacks a pinned source binding |
| Raw slope with 1 Side / 2/3 Main | 9 | 3 | 0.3450 | Fails even if a free intercept is fitted to Canny with the raw slope fixed |
| Stage 1 budget 0.05 with the same units | 15 | 5 | 25.3250 | Implies 1.5 Side / 1.0 Main, overestimating observed coefficients |
| Global 0.033, rank zero (`a+bL`) | 10 | 2 | 0.1835 | Canny rank 1 alone would show 1.1% |
| Slope-only factor 149/150 | 7 | 2 | 0.0917 | Example of naively normalizing by the full range |
| Slope-only factor 148/149 | 7 | 2 | 0.0900 | Another endpoint convention with no linked source interval |
| Global 0.033 and whole groups of five (`floor(A/5)`) | 4 | 0 | 4.79675 | Predicts 2.8% for Canny +7 at level 25, versus 3.9% |
 
Refitting the slope-only model with α fixed at 1 permits a factor of approximately **0.9888143–0.9898990** on the nominal slope. The original 0.99 is just outside. It might appear to fit by truncating Canny’s level-100 description to 8.3, but truncating its level-150 coefficient would show 12.0 instead of 12.1. A separate formatting branch or hidden quantization could alter individual displays. Uniform truncation does not reconcile the two readings.

The assets have no evidence of an explicit 0.99 slope adjustment or an independently linked rank interval. A normalized coordinate `(L−1)/149` with a fitted full-interval delta can be mathematically identical to a linear slope. Rank-zero can likewise be rewritten if the intercept is free. Those reparameterizations do not identify a hidden rank index. The test against rank-zero above anchors the **authored** intercept and budget. The high-rank fit against a common Main/Side budget is more economical than separate undocumented slope adjustments or shape changes, but the interval polygon permits a continuum of alternatives.

Rank 25, 100 and 150 samples span multiple progression bands. The source exposes separate radius and rarity fields, and neither Primary budget expression reads them. The observations are consistent with one smooth rank curve across those bands. A staircase, an intermediate quantizer, or a short piecewise bend near 50–51 can still match all sampled levels. For example, adding a triangular increment to Canny’s per-five coefficient with value zero at 25 and 100 and peak +0.08 at 51 preserves all existing points. This is an identifiability counterexample, without authored evidence of that specific bend.

## Legendary families

**VERIFIED — DATA.** `arAffixes[2]` links to an operation-4 affix with `eRequiredRarity=2`, no threshold map, no Primary budget GBID, and its own multiplicative destination in `arBonusAttributes`. The native destination attributes below use operator 7 in the pinned attribute dictionary. The tooltip follows the Legendary rarity gate independently of the Additional selector in all three tested cases. [Pinned attribute dictionary](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/attributes.json)

| Family and test | Authored a / b, as percentage points | Destination (parameter) | Predicted → observed |
| --- | --- | --- | --- |
| A, Canny | 0.5 / 0.1 | `Multiplicative_Nonphysical_Damage_Percent_Bonus` 257 (−1) | L100 10.4 → 10.4; L150 15.4 → 15.4 |
| B, Turf | 0.825 / 0.115 | `Multiplicative_Damage_Bonus_To_Near` 1106 (−1) | L100 12.21 → 12.2 |
| C, Spirit | 2.825 / 0.115 | `Multiplicative_Crit_Damage_Percent` 289 (−1) | L100 14.21 → 14.2 |

**EXPERIMENTALLY SUPPORTED.** At their displayed precision these match `100×(a_raw+b_raw×(L−1))`. With the authored intercept fixed, the Canny readings allow slope 0.099664430–0.100335570 percentage points per level. Each of Turf and Spirit allows 0.114393939–0.115404040 from its one observed level. Rank-zero with the authored intercept gives displays 10.5 and 15.5 for Canny, 12.3 for Turf and 14.3 for Spirit. Applying 0.99 only to the Legendary slope would give 10.3 and 15.3, 12.1 and 14.1. Applying the Primary Main or Side factors to the whole Legendary scalar would also miss the observations, including 15.2 for Canny at 150. The affixes’ null budget references and independent rarity gate support separate Primary and Legendary evaluation. Any eventual combat engine still needs stacking and target applicability evidence. A displayed Legendary number does not establish that it was active in a given hit.

## Fifteen attribute-scaling glyphs

The table fixes `t=L−1` and uses the **source-aligned 0.033 candidate**. Coefficients are **unrounded model outputs** shown to five places for comparison and are in additive percentage points per five points. Raw start and slope use exported values where nontrivial. `Main` and `Side` refer to GBIDs 379537727 and 379761887 respectively, with authored formulas in the budget table above. The affix links expose the original field paths. The Legendary column identifies the curve family and linked affix SNO. Primary evidence on the three tested rows applies only to the observations listed earlier. For each of the other twelve, authored identity and parameters are **VERIFIED — DATA**, and projected coefficients are an **empirical extrapolation** conditional on the same operator chain. The letters A/B/C describe coefficient pairs, with destination and applicability still stored per affix.

| Glyph / SNO | Primary affix SNO | Core → destination (parameter) | Authored a / b | Budget · N | Candidate B | L1 | L25 | L50 | L51 | L100 | L150 | Legendary | Evidence and remaining test |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| [Apostle](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_110_Strength_Main.gph.json) / 2478580 | [2478921](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithDiscipleSkills_Strength_Main.gaf.json) | Strength 9 → 259 (-387701) | 1.5 / 0.12849999964237213 | Main · 0.66 | `0.66×(1.5+0.1285t)` | 0.99000 | 3.02544 | 5.14569 | 5.23050 | 9.38619 | 13.62669 | A · [2112008](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentToVulnerableLegendary.gaf.json) | Extrapolated. Disciple tag applicability and displayed precision open. |
| [Arbiter](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_106_Willpower_Side.gph.json) / 2478242 | [2478919](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithArbiterSkills_Willpower_Side.gaf.json) | Willpower 11 → -2147483454 (-1) | 1.5 / 0.12849999964237213 | Side · 0.99 | `0.99×(1.5+0.1285t)` | 1.48500 | 4.53816 | 7.71853 | 7.84575 | 14.07928 | 20.44003 | B · [2112001](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgToClose_Legendary.gaf.json) | Extrapolated. Wing Strike custom attribute dispatch and precision open. |
| [Canny](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_063_Intelligence_Side.gph.json) / 1029487 | [1030695](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/NonPhysicalDamage_Intelligence_Side.gaf.json) | Intelligence 10 → 256 (-1) | 1 / 0.07500000298023224 | Side · 0.99 | `0.99×(1+0.075t)` | 0.99000 | 2.77200 | 4.62825 | 4.70250 | 8.34075 | 12.05325 | A · [2112062](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentbyDamageType_NonPhysical_Legendary.gaf.json) | Observed at six ranks. Exact intrinsic, rounding, Rare/gear inputs and combat scope open. |
| [Chip](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_055_Willpower_Side.gph.json) / 2506071 | [2506076](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/PhysicalDamage_Willpower_Side.gaf.json) | Willpower 11 → 254 (0) | 1 / 0.07500000298023224 | Side · 0.99 | `0.99×(1+0.075t)` | 0.99000 | 2.77200 | 4.62825 | 4.70250 | 8.34075 | 12.05325 | A · [2112178](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentbyDamageType_Physical_Legendary.gaf.json) | Extrapolated. Physical applicability and observed precision open. |
| [Control](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_020_Intelligence_Side.gph.json) / 1029491 | [1029586](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageToCCed_Intelligence_Side.gaf.json) | Intelligence 10 → 959 (-1) | 1.5 / 0.11249999701976776 | Side · 0.99 | `0.99×(1.5+0.1125t)` | 1.48500 | 4.15800 | 6.94237 | 7.05375 | 12.51112 | 18.07987 | C · [2111968](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentToCC_All_Legendary.gaf.json) | Extrapolated. CC applicability and observed precision open. |
| [Exploit](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_016_Intelligence_Side.gph.json) / 2506132 | [2506136](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageToVulnerable_Intelligence_Side.gaf.json) | Intelligence 10 → 736 (-1) | 1 / 0.05624999850988388 | Side · 0.99 | `0.99×(1+0.05625t)` | 0.99000 | 2.32650 | 3.71869 | 3.77437 | 6.50306 | 9.28744 | A · [2112008](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentToVulnerableLegendary.gaf.json) | Extrapolated. Vulnerable applicability and observed precision open. |
| [Feverous](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_109_Dexterity_Side.gph.json) / 2478571 | [2478923](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithZealotSkills_Dexterity_Side.gaf.json) | Willpower 11 → 259 (-394636083) | 1.5 / 0.12849999964237213 | Side · 0.99 | `0.99×(1.5+0.1285t)` | 1.48500 | 4.53816 | 7.71853 | 7.84575 | 14.07928 | 20.44003 | A · [2111844](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentAll_Legendary.gaf.json) | Extrapolated. Willpower conversion and Zealot tag applicability untested. |
| [Honed](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_104_Dexterity_Side.gph.json) / 2477896 | [2478502](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/CombatCritDamage_Dexterity_Side.gaf.json) | Intelligence 10 → 288 (-1) | 1.5 / 0.15000000596046448 | Side · 0.99 | `0.99×(1.5+0.15000001t)` | 1.48500 | 5.04900 | 8.76150 | 8.91000 | 16.18650 | 23.61150 | C · [2111927](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultCritDmgPercent_Legendary.gaf.json) | Extrapolated. Intelligence conversion and integer socket display untested. |
| [Imbiber](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_011_Willpower_Side.gph.json) / 1071719 | [1026998](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWhileHealthy_Willpower_Side.gaf.json) | Willpower 11 → 1123 (-1) | 1.3250000476837158 / 0.06890624761581421 | Side · 0.99 | `0.99×(1.325+0.06890625t)` | 1.31175 | 2.94896 | 4.65439 | 4.72261 | 8.06525 | 11.47611 | B · [2111980](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentWhileHealthy_Legendary.gaf.json) | Extrapolated. Healthy applicability and observed precision open. |
| [Judicator](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_108_Intelligence_Side.gph.json) / 2478561 | [2478929](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithJudicatorSkills_Intelligence_Side.gaf.json) | Intelligence 10 → 259 (-1250119683) | 1.5 / 0.12849999964237213 | Side · 0.99 | `0.99×(1.5+0.1285t)` | 1.48500 | 4.53816 | 7.71853 | 7.84575 | 14.07928 | 20.44003 | A · [2478926](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentbyDamageType_Holy_Legendary.gaf.json) | Extrapolated. Judicator tag application and observed precision open. Legendary has Holy and Fire slots. |
| [Law](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_105_Strength_Main.gph.json) / 2478228 | [2481243](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithJudgement_Strength_Main.gaf.json) | Strength 9 → 984 (2263340) | 1.5 / 0.15000000596046448 | Main · 0.66 | `0.66×(1.5+0.15000001t)` | 0.99000 | 3.36600 | 5.84100 | 5.94000 | 10.79100 | 15.74100 | A · [2111844](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentAll_Legendary.gaf.json) | Extrapolated. Judgement-specific application and observed precision open. |
| [Sentinel](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_103_Strength_Main.gph.json) / 2477888 | [2477900](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWithJuggernautSkills_Strength_Main.gaf.json) | Strength 9 → 259 (-1936853670) | 1.5 / 0.15000000596046448 | Main · 0.66 | `0.66×(1.5+0.15000001t)` | 0.99000 | 3.36600 | 5.84100 | 5.94000 | 10.79100 | 15.74100 | B · [2112001](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgToClose_Legendary.gaf.json) | Extrapolated. Juggernaut tag application and observed precision open. |
| [Spirit](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_050_Willpower_Side.gph.json) / 2506810 | [2506834](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/SpiritCritDamage_Willpower_Side.gaf.json) | Willpower 11 → 288 (-1) | 2 / 0.15000000596046448 | Side · 0.99 | `0.99×(2+0.15000001t)` | 1.98000 | 5.54400 | 9.25650 | 9.40500 | 16.68150 | 24.10650 | C · [2111927](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultCritDmgPercent_Legendary.gaf.json) | Observed at L100. Curve and display at other ranks, critical application and stacks open. |
| [Turf](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_014_Strength_Main.gph.json) / 2506847 | [2506849](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageToNear_Strength_Main.gaf.json) | Strength 9 → 1105 (-1) | 1 / 0.07500000298023224 | Main · 0.66 | `0.66×(1+0.075t)` | 0.66000 | 1.84800 | 3.08550 | 3.13500 | 5.56050 | 8.03550 | B · [2112001](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgToClose_Legendary.gaf.json) | Observed at L100. Low-rank Main normalization, local Rare inclusion and combat scope open. |
| [Undaunted](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyph/Rare_034_Willpower_Side.gph.json) / 1027096 | [971497](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/DamageWhileFortified_Willpower_Side.gaf.json) | Willpower 11 → 748 (-1) | 1 / 0.05624999850988388 | Side · 0.99 | `0.99×(1+0.05625t)` | 0.99000 | 2.32650 | 3.71869 | 3.77437 | 6.50306 | 9.28744 | A · [2111844](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonGlyphAffix/MultDmgPercentAll_Legendary.gaf.json) | Extrapolated. Fortified applicability and observed precision open. |

The signed Arbiter destination `−2147483454` is the bit-identical custom data attribute key `2147483842` for Wing Strike damage. Honed maps INT and Feverous maps WIL despite their internal filenames. Law targets `Power_Damage_Percent_Bonus` for `Paladin_Sub_Judgement` SNO 2263340. The tagged destination 259 carries a different parameter for each skill family. Preserve the exact parameter and native attribute when routing contributions.

## Local attribute membership

Stage 3’s `getGlyphRadiusMembership(board, instanceId, radius)` returns occupied source cells from one board, excluding the socket and preserving distance and instance/source-index identity. It supplies spatial candidates. Connected `allocated` is a separate set of instance-qualified source cells. Stage 3’s planner boundaries are 1–24 radius 3, 25–50 radius 4 and 51–150 radius 5. The player confirmed Manhattan geometry and the first expansion. The second transition convention remains provisional at level 51. The matching-build tooltips below establish particular Primary inputs within that geometry.

| Candidate input | Evidence and open question |
| --- | --- |
| Allocated Normal core | **VERIFIED — IN-GAME** for Canny’s Normal +5 INT example, with the two-node socket confirming aggregation. Other Normal attribute/destination combinations remain extrapolations except as supported by the aggregate readings. |
| Allocated Magic core | **VERIFIED — IN-GAME** for Canny’s Magic +7 INT at 25 and 150. Treating a Magic node as one five-point block fails. |
| Allocated Rare base core | **UNRESOLVED.** Some Rare nodes author a flat base core attribute with IDs used by glyphs. The map and localized purchase rule suggest the possibility. No supplied observation isolates a Rare base core node. |
| Unallocated nodes | **VERIFIED — DATA** for purchase wording. **EXPERIMENTALLY SUPPORTED** for the measured single-node and incremental pools. The observations do not cover a full allocation-mask audit. |
| Out-of-radius nodes | **VERIFIED — DATA** for localized range scope. Use Stage 3 Manhattan membership as the spatial input. A control allocating a distant same-stat node is still useful for Primary accounting. |
| External character attributes | **VERIFIED — DATA** for the distinction between the glyph’s mapped core IDs 9–11 and the Rare selectors’ global total IDs 18–21. Local wording supports exclusion. Gear-swap invariance is **UNRESOLVED** experimentally. |
| Amplified core | **UNRESOLVED.** Authored raw and effective node values should be carried separately. Current independent board scopes and nonoverlapping radii cannot settle hypothetical cross-glyph overlap behavior. |
| Conditional core | **DERIVED FROM DATA.** Stage 1’s authored conditional index audit found no core or total-attribute conditionals on the ten supported boards. No live conditional-core probe exists within those fixtures. Preserve a diagnostic if a future revision changes this. |

The source type `eAffectedNodeRarity=0` on operation 2 does not show that only Normal nodes count, and Canny directly demonstrates Magic contribution. Local per-five arithmetic and the definition of an eligible attribute pool are separate decisions. The glyph socket contributes no core points of its own. The natural geometry of the supported ten boards does not establish a universal engine rule for hypothetical cross-board glyph effects.

## Minimal discriminating experiments

Use the existing tested glyphs and matching build when possible. Source indices below are zero-based, unrotated on the 21×21 board. Record build, board, glyph level and rarity, allocated cells, socket-local counter, full Primary description, node line when available, and Primary socket total. Hold equipment, combat state, other glyphs and allocated paths constant except for the specified variable. Bins below assume nearest-tenth unless a different precision is noted. For damage-sensitive descriptions record the tooltip in a neutral state. There is no need to take combat samples for these calibration checks.

The starting route used in fixtures 1–4 is `304→303→282→281→260→239→240→219→198→177→178→157→136` (socket 136). If the socket is already reached through another route, match the specified local pool and use one final leaf purchase to minimize changes. Record any different local allocations. Values such as the 0.9895 refit are illustrative alternative parameterizations within a continuous feasible set.

1. **Existing Canny 150, larger-pool check.** On Starting, follow the route above and add `136→137→116→95→96` and `136→135→134`. The only local INT nodes are then 198 (+5), 96 (+7) and 134 (+5), giving the previously observed 17. Buy Normal INT **179**, adjacent to 178, as the only variable. This gives 22 INT. Predictions for the total are **53.0** (global 0.033, 53.03430), **53.1** (0.99 slope-only, 53.07830), and **53.1** (0.9895 refit, 53.05372). If those bins are borderline, prepare 27 INT by adding `137→138→139→140`, then buy leaf **141** for 32 INT. The predictions are **77.1** (77.14080) vs **77.2** (77.20480) vs **77.2** (77.16904). At 32 INT, the 25-INT Additional threshold will be met if local counting agrees. Keep the observation on the Primary tooltip, apart from any combat effect. Either reading tightens the high-rank coefficient. A single high-level coefficient cannot uniquely identify the intercept of all refitted models.
2. **Low-rank Main normalization.** Use Turf at level 1 if already available at that level. On the same Starting route only 157 and 177 supply STR within radius 3. Add **156** (+5), then **158** (Dexterity), so local STR is 15. Toggle leaf **159** (+5 STR) adjacent to 158. At 15 STR the global and slope-only candidates both display 2.0%, while Stage 1’s 0.05 candidate displays 3.0%. At 20 STR they predict **2.6%** (2.64000) versus **2.7%** (2.66667), including the 0.9895 refit anchored at 1, versus **4.0%** (Stage 1). This has leverage on the intercept independently of the high-rank fit. Skip this experiment if Turf is already leveled and no existing low-level copy is available.
3. **Rare base Strength at an already tested level.** Use Turf 100 on Starting. The reference route supplies 15 local STR from 219, 177 and 157 at radius 5. From 136 add **135** and **114** (no STR). Buy or refund only **93**, Raw Power, a Rare with +10 base STR, distance 3. Keep global INT and Raw Power’s Rare requirement state fixed. Full local inclusion gives 25 STR and a Primary prediction of **27.8%** (27.80250 under 0.033; 27.83583 under slope-only) versus **16.7%** (16.68150; 16.70150) if the Rare core line is excluded. Rare conditional damage is separate. The additional +10 can establish inclusion in this fixture without deciding how other Rare bonuses or amplified core enter.
4. **Local versus global controls with Canny 150.** Use the first fixture’s 22 INT allocation. Change only an external source for +10 sheet INT without buying a node. Under local counting the socket remains **53.0%** (0.033 model). A point-for-point inclusion of that external delta increases it by **24.10650** percentage points, to **77.1%** under the same baseline model. Restore gear, then in a separate pair buy Normal INT **305**, adjacent to the Starting node, distance 9 from the socket. Local counting again gives **53.0%**; including those outside points in the baseline would give **65.1%** (65.08755). A visible node-line tooltip on an unallocated tile can be a preview, so record the socket before and after allocation. Shielding the experiment from combat keeps a possible Additional-state change from affecting the comparison.
5. **Transfer to different authored coefficients.** If Law is already level 100, use Starting with the reference route and add 156, 179, 180 and 200 as connected branches (156 off 157, 179 off 178, and 180/200 off 179). Record 30 local STR, then add leaf **197** off 198 to reach 35. At 35 the global candidate predicts **75.5%** (75.53700), with slope-only **75.6%** (75.60700) and the refit **75.6%** (75.57235) if the socket shows tenths. Integer formatting would collapse that state to **76%** for all three, so retain the exact display format and coefficient description. This row has authored a=1.5 and b≈0.15. A matching result extends provisional support to a different Main coefficient and destination. A divergent result may reflect a destination/display policy, local accounting, or a failed shared calibration.
6. **Boundary spot check when a Canny is naturally near an upgrade.** In unrotated Castle use socket **120**. A zero-local-INT south-gate route within radius 5 is `430→409→410→389→390→369→370→349→328→307→306→285→264→243→242→221→200→179→180→159→138→117→118→119→120`; connect the gate through the existing planner build. Add 99→78 and 99→98→77 off the socket, plus 141 adjacent to 120. The resulting 17 INT from 78 (+7), 77 (+5) and 141 (+5) already fits radius 3. Hold allocations fixed across whatever consecutive ranks are available. The global model predicts **9.2/9.4%** at 24/25 and **15.5/15.7/16.0%** at 49/50/51. The 0.99 slope-only and 0.9895 refit predict **9.2/9.5%** and **15.5/15.8/16.0%**. The illustrative +0.08 piecewise bend would give about **15.7/16.0/16.3%** around 49–51. Record level, rarity and displayed radius separately, including level 50 before or after an upgrade transaction if observable, and the presence of the Legendary tooltip. Family A at rank 51 predicts **5.5%[x]** if Legendary is displayed. The test can detect a change beyond the candidate rank slope without mistaking newly included nodes for a scalar step. Skip paid upgrades or leveling solely for this comparison if those ranks are unavailable.

Small order of operations for the next calibration pass is Canny’s high-pool reading, then the Rare and external/outside probes using existing level 100/150 glyphs. A low-level Main or an already leveled different-coefficient glyph is valuable if available. Boundary observations are opportunistic. The experiments can reject specific model families and tighten intervals without proving unattainable hidden precision.

## Proposed numerical architecture for a later stage

The reusable catalogue already retains authored fields, stable affix and attribute IDs, raw formula references and pin provenance. The pure progression and spatial modules expose a separate view of level bands and candidate cells. `calculateParagonBonuses` and the connected wrapper currently operate on the allocation and external-context inputs, with the wrapper gathering unconditional core before resolving Rare thresholds. The Stage 3 app keeps glyph assignment in a separate map. Continue to keep these responsibilities explicit.

- **Authored record.** Carry revision and build, glyph and affix SNO, operation, destination ID and parameter, source core ID, exact scalar floats, budget GBID, and original fields. Store exact source numbers separately from nominal decimal forms used to explain them.
- **Calibration policy.** Identify operator family, build, candidate intrinsic, normalization, anchor and precision assumptions. Attach observation IDs, compatible intervals, distinction between direct measurements and extrapolation, and verification status. Keep an unsupported path explicit for any glyph or input with unresolved evaluation evidence.
- **Local pool.** Intersect the radius membership with allocated instance-qualified cells first. Represent each candidate’s source attribute slot, original/effective/conditional provenance and amount. An explicit membership policy selects which variants to include. Do not use global sheet values for this local query unless evidence establishes such a rule. Keep descriptive assignment on unallocated sockets separate from numerical eligibility.
- **Primary.** Produce an unrounded aggregate with one authoritative contribution key per socket affix, plus per-node explainability entries from the same calculation. If node values are summed, sum the unrounded values once. The per-node list is a breakdown of the aggregate, and the consumer imports only the aggregate, preventing double-counting. Retain attribute parameters and the native additive destination.
- **Legendary and combat.** Provide a separately typed normalized multiplier amount, rarity eligibility and destination. Additional threshold evaluation and combat dispatch remain independent. Keep defensive effects, stacks and skill/target predicates as typed conditions or pending effects until supported. Do not infer global bucket composition from tooltips.
- **Formatting.** Keep percentage points and normalized fractions distinct at the interface. Format coefficient, socket and individual-node readouts at presentation time, keyed by attribute and surface. Use separate precision policies for the observed Spirit formats. A display rounding choice does not justify internal rounding of node lines.
- **Regression fixtures.** Preserve existing no-glyph totals and Rare-threshold behavior. Add the supplied rows as interval assertions, including Canny’s +7 and two +5 case, Turf’s incremental totals, Spirit’s surface precision, and Legendary independence. Cover out-of-radius, gear changes, mixed allocated nodes, rotations and duplicate accounting once their eligibility policies are supported.

## Conclusions and scope

- **VERIFIED — IN-GAME.** Fifteen Primary socket totals, five description coefficients, the three individual Canny node readings, the tooltip precision distinction, and the recorded Legendary values with unmet Additional requirements.
- **VERIFIED — DATA.** The 15 authored source/destination maps, raw scalars, three relevant Legendary coefficient families and rarity gates, Additional selectors and expressions, and the global array value near 0.033.
- **EXPERIMENTALLY SUPPORTED.** Continuous Canny conversion, finer-than-display aggregation for the tested Canny and Turf cases, a rank-one no-extra-Primary-factor Legendary model, and a shared source-aligned Primary candidate with 0.66 Main/0.99 Side. The leading Primary formula remains a calibrated candidate.
- **INFERRED.** The 0.033-like entry supplies the Primary intrinsic in the proposed chain. Rank interpolation and common conversion for the twelve untested glyphs remain extrapolations.
- **UNRESOLVED.** Exact evaluator and table binding, alternative models inside rounding intervals, precise Legendary upgrade transaction, local Rare/effective contributions, proof of gear and outside-node exclusion, quantization and tie rules, Additional combat behavior, and Legendary combat stacking.
- **Workspace scope.** Only this report was added. The Stage 1 report, handover, application and tests were preserved. No commits or pushes were performed.
