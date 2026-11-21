# Phase 9C — Tenacity Threshold Investigation

## Scope and pinned sources

This investigation uses DiabloTools/d4data commit [`75e619f0d90a0951945747f45feef59c076a5db0`](https://github.com/DiabloTools/d4data/tree/75e619f0d90a0951945747f45feef59c076a5db0), matching Paladin starting board SNO `2436481`. It compares the pinned node and threshold JSON with the existing [bonus registry](../paragon-visual/paragon-bonus-registry.js), [calculator](../paragon-visual/paragon-calculator.js), and [completeness audit](./paragon-completeness-audit.md). No application or game-data files were changed.

## VERIFIED — Node and board data

Pinned source: [`json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json), SNO `675186`, `eRarityOverride: 3`.

The node's complete threshold-related fields are:

- `ptBonusAttributeIndices: [0]`.
- `arThresholdSelector`, in stored order:
  1. `StrengthSide1`, SNO `1015341`.
  2. `StrengthMain1`, SNO `1015345`.
  3. `WillpowerMain1`, SNO `1068425`.
  4. `WillPowerSide1`, SNO `1015310`.
- No other top-level class or board threshold-selection field is present in this node definition.

The marked attribute slot is `ptAttributes[0]`: `Hitpoints_Max_Percent_Bonus` (attribute 142), formula `ParagonNodeHPMaxBonus_RareMajor`, node literal `"0.06"`. Slot 1 is `Armor_Percent` (attribute 482), formula `ParagonNodeArmorBonus_RareMinor`. Thus the JSON marks the Maximum Life attribute—not Armor—as the bonus slot. The node file does not itself pair a particular selector with slot 0.

The local pinned [`Paragon_Paladin_00.pbd.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonBoard/Paragon_Paladin_00.pbd.json) contains one Tenacity reference at `arEntries[239]`. That entry is only a `DT_SNO` node reference; it has no threshold choice, class flag, or board-index override.

## VERIFIED — Referenced threshold definitions

Each threshold asset has one `ptThresholds` entry. `arUsableByClass` is an eight-element 0/1 array; the extracted definitions do not label its positions with class names.

| Selector | SNO | Required attribute | Formula | Requirement at board index 0 | `arUsableByClass` |
|---|---:|---|---|---:|---|
| [`StrengthSide1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthSide1.pth.json) | 1015341 | `Strength_Total` (18) | `190 + (75 * ParagonBoardEquipIndex)` | 190 Strength | `[0,0,0,1,0,1,0,1]` |
| [`StrengthMain1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/StrengthMain1.pth.json) | 1015345 | `Strength_Total` (18) | `630 + (455 * ParagonBoardEquipIndex)` | 630 Strength | `[0,0,1,0,0,0,1,0]` |
| [`WillpowerMain1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/WillpowerMain1.pth.json) | 1068425 | `Willpower_Total` (20) | `630 + (455 * ParagonBoardEquipIndex)` | 630 Willpower | `[0,1,0,0,0,0,0,1]` |
| [`WillPowerSide1`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/WillPowerSide1.pth.json) | 1015310 | `Willpower_Total` (20) | `190 + (75 * ParagonBoardEquipIndex)` | 190 Willpower | `[1,0,1,0,1,0,1,0]` |

The formulas establish the required attribute and index-dependent value. The starting-board registry records `ParagonBoardEquipIndex: 0`; the board JSON itself does not store that index or evaluate the formulas.

## Comparison with other rare nodes on this board

The other three rare definitions on `Paragon_Paladin_00` each have one selector and one marked bonus slot:

| Node | Selector(s) in pinned definition | Marked bonus attribute |
|---|---|---|
| `Barbarian_Rare_022` (Brawn) | `StrengthMain1` | Slot 0: Damage from Skills |
| `Generic_Rare_118` (Raw Power) | `IntelligenceSide2` | Slot 0: Damage from Skills |
| `Barbarian_Rare_039` (Iron Strength) | `WillPowerSide1` | Slot 0: Damage to Elites |

Tenacity is the only multi-selector rare definition among the four rare nodes referenced by this starting board. This comparison does not establish how multi-selector nodes are evaluated elsewhere in the game.

## VERIFIED IN-GAME — Paladin starting-board observation

The existing research record identifies Tenacity's starting-board requirement as **630 Strength** and its additional conditional bonus as **+4% Maximum Life**. This is recorded in [`paragon-raw-bonuses.md`](./paragon-raw-bonuses.md) and keyed in the registry to `StrengthMain1`, attribute slot 0. The value agrees with the pinned `StrengthMain1` formula at board index 0.

The existing calculator uses that registered selector, tests total Strength (`external + verified Paragon Strength`) with `>= 630`, and applies the conditional value only to the registered Maximum Life attribute. Its threshold and slot checks agree with the observed path and `ptBonusAttributeIndices: [0]`.

## INFERRED — Why four selectors are present

- The four references cover different main/side thresholds for Strength and Willpower. Their `arUsableByClass` arrays differ, which is consistent with candidate thresholds varying by class configuration.
- One marked bonus attribute and four selector references are more consistent with alternative threshold configurations than with four cumulative requirements. However, the JSON does not specify whether a runtime chooses one candidate, accepts any eligible candidate, or evaluates multiple eligible candidates.
- A plausible but unverified class-index inference is that position 6 represents Paladin: the three other rare-node thresholds observed on this Paladin board (`StrengthMain1`, `IntelligenceSide2`, and `WillPowerSide1`) all have a `1` at position 6. If so, Tenacity's `StrengthMain1` and `WillPowerSide1` candidates both have a `1` at that position, while its other two candidates do not.
- If selection uses the first class-eligible selector in the node's stored order, `StrengthMain1` would be the first eligible candidate under that position-6 hypothesis, matching the observed 630 Strength requirement. The extracted data does not establish this ordering rule or the position-to-class mapping.

These are explanations consistent with the metadata and the observed Strength requirement, not verified runtime mechanics.

## UNRESOLVED — Selection behavior

- The pinned JSON does not provide the class-name ordering for `arUsableByClass`, or define whether those flags control threshold selection, availability, or another runtime behavior.
- The inspected [`PlayerClass/Paladin.pcl.json`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/PlayerClass/Paladin.pcl.json) does not expose a field tying Paladin to a position in the eight-element arrays.
- No field on `Paragon_Paladin_00` selects one of Tenacity's four references. The node's ordered list and threshold eligibility flags alone do not prove which selector the game chooses.
- The observation of 630 Strength confirms the registered path, but no evidence here tests whether 190 Willpower also activates Tenacity's conditional Maximum Life, whether both requirements are alternatives, or whether any requirements are cumulative.
- The three nonselected selectors are not represented in the existing registry, and the calculator does not report them as unresolved. Therefore the current calculation does not model every possible interpretation of the source list.

## Recommendation

The existing Tenacity implementation is **correct for the recorded Paladin starting-board behavior**: `StrengthMain1` at 630 Strength activates the additional +4% Maximum Life. It is not yet proven complete with respect to all four source selectors. Keep the implementation narrowly scoped to the observed path; do not claim the other selectors are irrelevant or cumulative.

To settle the remaining question, test Tenacity with total Strength below 630 and total Willpower at/above 190, then compare the tooltip and Maximum Life bonus. Also test the converse and a state meeting both values. If in-game testing cannot isolate those values, the selection semantics remain unresolved and should stay explicit in future calculator documentation.

---

## Phase 9C continuation — repository-wide findings

This continuation supersedes the earlier statements that the class-index mapping was merely inferred and that only the four starting-board rare nodes had been compared. The full pinned `ParagonNode`, `ParagonThreshold`, `ParagonBoard`, and `PlayerClass` directories were searched. The generated `definitions.json` schema and relevant English node-name string records were also checked. Evidence below remains scoped to commit `75e619f0d90a0951945747f45feef59c076a5db0`.

### VERIFIED—DATA: threshold class ordering

The class order is recoverable directly from class-prefixed threshold assets. These assets are one-hot and label their own class position. Multiple assets for each class agree:

| `arUsableByClass` index | Class | Direct one-hot examples |
|---:|---|---|
| 0 | Sorcerer | `Sorc_Intelligence+Dexterity`, `Sorc_Intelligence+Willpower`, `Sorc_Willpower+Dexterity` |
| 1 | Druid | `Druid_Willpower+Dexterity`, `Druid_Willpower+Intelligence` |
| 2 | Barbarian | `Barb_Strength+Dexterity`, `Barb_Strength+Willpower` |
| 3 | Rogue | `Rogue_Dexterity+Intelligence`, `Rogue_Dexterity+Strength`, `Rogue_Intelligence+Strength` |
| 4 | Necromancer | `Necro_Dexterity+Willpower`, `Necro_Intelligence+Dexterity`, `Necro_Intelligence+Willpower` |
| 5 | Spiritborn | `Spiritborn_Dexterity+Intelligence`, `Spiritborn_Dexterity+Strength`, `Spiritborn_Strength+Intelligence` |
| 6 | Paladin | [`Paladin_Strength+Intelligence`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/Paladin_Strength%2BIntelligence.pth.json), [`Paladin_Strength+Willpower`](https://github.com/DiabloTools/d4data/blob/75e619f0d90a0951945747f45feef59c076a5db0/json/base/meta/ParagonThreshold/Paladin_Strength%2BWillpower.pth.json) |
| 7 | Warlock | `Warlock_Strength+Intelligence`, `Warlock_Willpower+Intelligence`, `Warlock_Willpower+Strength` |

Therefore **index 6 means Paladin for `ParagonThresholdDefinition.arUsableByClass` in this pinned revision**. This is no longer a board-content inference. It is scoped to this threshold field; another data type's class array must not be assumed to use the same ordering without separate evidence.

For Tenacity, the verified mapping makes two selectors Paladin-eligible, in stored order:

1. `StrengthMain1` — 630 Strength at board index 0.
2. `WillPowerSide1` — 190 Willpower at board index 0.

`StrengthSide1` and `WillpowerMain1` are not Paladin-eligible.

### VERIFIED—DATA: other multi-selector rare nodes

The pinned repository contains 43 node definitions with more than one threshold selector. All 43 are referenced by at least one pinned board. Matching every occurrence on the eight playable class board families against the verified class mapping produced:

- 118 multi-selector board-cell references;
- 102 references with exactly one class-eligible selector;
- 16 references with two class-eligible selectors;
- no referenced case with zero class-eligible selectors.

After deduplicating repeated cells and boards, there are 91 distinct class/node combinations: 82 have one eligible selector and **9 have two**. Multiple selectors can therefore be class-eligible simultaneously; Tenacity is not unique.

| Class | Node / English name | Eligible selectors, in stored order |
|---|---|---|
| Barbarian | `Barbarian_Rare_015` / Tenacity | `StrengthMain1` → `WillPowerSide1` |
| Barbarian | `Barbarian_Rare_018` / Conditioned | `WillPowerSide2` → `DexteritySide2` |
| Barbarian | `Generic_Rare_032` / Bulwark | `Barb_Strength+Willpower` → `WillPowerSide2` |
| Paladin | `Barbarian_Rare_015` / Tenacity | `StrengthMain1` → `WillPowerSide1` |
| Paladin | `Generic_Rare_042` / Restorative | `WillPowerSide2` → `IntelligenceSide2` |
| Rogue | `Generic_Rare_033` / Recuperate | `StrengthSide3` → `IntelligenceSide3` |
| Sorcerer | `Generic_Rare_006` / Fleeting | `Sorc_Willpower+Dexterity` → `DexteritySide1` |
| Sorcerer | `Generic_Rare_019` / Suffused Resilience | `Sorc_Intelligence+Willpower` → `WillPowerSide2` |
| Sorcerer | `Generic_Rare_107` / Blessing | `WillPowerSide2` → `DexteritySide2` |

Three ambiguous cases put a class-specific composite selector before a later generic selector (`Bulwark`, `Fleeting`, and `Suffused Resilience`). This pattern makes authored priority plausible, but does not prove an early-exit rule.

### Selector-order meaning

**VERIFIED—DATA:**

- `arThresholdSelector` is a variable array whose authored order is retained. The generated schema identifies only its group-124 SNO element type; it supplies no priority or evaluation semantics.
- `arUsableByClass` can leave two selectors eligible for the same class.
- No node or board field stores a selected selector, Boolean operator, or tie-breaker.
- A repository-wide search found no runtime evaluator or documentation of iteration, early exit, AND/OR combination, or tie-breaking. The pinned repository is an extracted-data/parser repository, not the game runtime implementation.
- English node string records contain the names shown above but not the chosen threshold or rendered condition.

**SUPPORTED HYPOTHESIS, NOT VERIFIED:** the first class-eligible selector wins.

- Paladin Tenacity's first eligible entry is `StrengthMain1`, matching the recorded 630 Strength observation.
- The class-specific composite threshold is first in each of the three ambiguous composite/generic cases, which is a coherent reason for order to matter.
- Every referenced class/node combination has at least one eligible selector, consistent with the array being an ordered list of class alternatives.

These facts are also compatible with evaluating every eligible selector and combining the results through AND, OR, or a rule stored outside these assets. Array order plus a matching observation does not itself establish that the runtime stops at the first match.

### Assessment of the 630 Strength implementation

The existing implementation is **supported for the recorded Paladin starting-board path**:

- index 6 is now verified as Paladin;
- `StrengthMain1` is Paladin-eligible and is the first eligible authored entry;
- its board-index-0 formula evaluates to 630 Strength;
- the existing in-game record reports 630 Strength and an additional +4% Maximum Life, matching `StrengthMain1` and `ptBonusAttributeIndices: [0]`.

It is not yet proven complete. `WillPowerSide1` is also Paladin-eligible, and the existing evidence does not record a controlled state with Strength below 630 and Willpower at or above 190. Consequently, the data cannot exclude a second activation path, an AND requirement, or another external rule. Keeping `StrengthMain1` is justified as the known observed path; claiming that the Willpower selector is ignored needs additional evidence.

### Evidence that would settle the uncertainty

On the Paladin starting board (`ParagonBoardEquipIndex = 0`), allocate Tenacity and hold other effects constant. Record the complete tooltip, bonus-active indication, and Maximum Life before/after allocation in these four states:

| Case | Strength | Willpower | Isolates |
|---|---:|---:|---|
| A | 629 | 189 | neither candidate; control |
| B | 630 | 189 | `StrengthMain1` only |
| C | 629 | 190 | `WillPowerSide1` only |
| D | 630 | 190 | both candidates |

Interpretation:

- B active and C inactive: Tenacity selects the Strength candidate; consistent with first-eligible priority.
- B inactive and C active: the later Willpower candidate is selected by another rule.
- B and C active: the eligible selectors are alternative/OR activation paths.
- only D active: the eligible selectors are cumulative/AND requirements.

This test establishes Tenacity's behavior, but one node cannot establish a universal evaluator rule. Repeat the isolation test on an unrelated ambiguous node—preferably Paladin Restorative (`WillPowerSide2` first, `IntelligenceSide2` second) or Sorcerer Blessing (`WillPowerSide2` first, `DexteritySide2` second). Testing all nine distinct ambiguous class/node combinations would exhaust the ambiguous cases in the pinned boards.

Equivalent decisive evidence would be runtime/decompiled code showing the class check and iteration/exit behavior, or a debugger trace identifying the selected group-124 SNO. The pinned data repository alone cannot provide that evidence.

## Final conclusion

**PARTIALLY VERIFIED — some behavior established.**

The threshold class ordering is established, and Paladin is verified as index 6. Tenacity has two simultaneously Paladin-eligible selectors. The known 630 Strength implementation matches the first eligible selector and the recorded in-game condition, so it is supported for the observed starting-board path. The claims that the game generally chooses the first eligible selector and that Paladin's later 190 Willpower selector can never activate the bonus remain unresolved pending the controlled four-state test or equivalent runtime evidence.

---

## Phase 9D — experimental verification

The controlled four-state test proposed above was completed in game on the Paladin starting board. These are user-reported direct observations:

| Case | Total Strength | Total Willpower | Tenacity conditional bonus |
|---|---:|---:|---|
| A | 629 | 189 | Inactive |
| B | 630 | 189 | Active |
| C | 629 | 190 | Inactive |
| D | 630 | 190 | Active |

### VERIFIED—IN-GAME: Paladin starting-board behavior

The experiment establishes all of the following for Tenacity on `Paragon_Paladin_00`:

- The conditional bonus activates at total Strength `>= 630`.
- Total Strength 629 does not activate it, including when Willpower reaches 190.
- Willpower `>= 190` does not independently activate the bonus.
- Willpower crossing 190 does not change the result on either side of the Strength boundary.
- The observed condition is therefore `Strength >= 630` for the four distinguishing states, matching `StrengthMain1` at `ParagonBoardEquipIndex = 0`.
- The existing calculator agrees with all four observations: inactive in A and C, active in B and D.

This resolves the previously open question of whether Paladin Tenacity also has an independent `WillPowerSide1` activation path: it does not in the tested starting-board context. The observations also rule out an AND requirement between 630 Strength and 190 Willpower because case B activates with Willpower below 190.

### Selection semantics: verified result versus inferred mechanism

The experiment verifies **which condition governs this node in this context**, not the runtime algorithm that chose it. `StrengthMain1` is the first Paladin-eligible selector in Tenacity's stored list, so the result provides experimental support for first-class-eligible selector priority. It does not prove that every multi-selector rare node, class, or board uses that rule.

A universal priority rule still requires either:

- equivalent boundary tests on unrelated ambiguous nodes, such as Paladin Restorative or Sorcerer Blessing; or
- runtime/decompiled code, a debugger trace, or authoritative documentation showing the selection loop and early-exit behavior.

## Phase 9D conclusion

**PARTIALLY VERIFIED — Tenacity's Paladin starting-board behavior is verified; universal selector priority is not.**

For `Paragon_Paladin_00`, Tenacity's conditional +4% Maximum Life uses the 630 Strength condition represented by `StrengthMain1`. The later Paladin-eligible 190 Willpower selector does not provide an independent activation path. The existing Tenacity calculation is complete for all four tested boundary combinations. First-class-eligible priority is the best-supported explanation, but remains an inferred general runtime rule until independently reproduced on another ambiguous node or confirmed in runtime evidence.
