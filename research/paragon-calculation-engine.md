# Paragon calculation engine

## Architecture

[`paragon-calculator.js`](../paragon-visual/paragon-calculator.js) exports `calculateParagonBonuses(board, nodeDatabase, allocatedNodeIndices)`. It accepts the board definition, the revision-tagged local node database, and a `Set` of occupied `arEntries` indices. It resolves each allocated entry to its node definition and reads every `attributes` record; it does not infer bonuses from node names, rarity, or connection count.

The result separates `verifiedParagonBonuses`, `unresolvedFormulaReferences`, and `conditionalBonuses`. Each allocated board position is processed once, regardless of how many graph edges touch it. Unresolved and conditional bonuses are retained as records and excluded from verified totals, never treated as zero-valued bonuses. The viewer invokes the module whenever allocation state changes, is restored, or is imported.

The UI labels its totals **Verified Paragon bonuses** and explicitly notes that they do not represent complete character attributes. Keeping Paragon bonuses separate from character totals leaves room for future equipment-, level-, and other-source attribute inputs.

## Verified formulas

The local database identifies DiabloTools/d4data commit `75e619f0d90a0951945747f45feef59c076a5db0` and formula source `json/base/meta/GameBalance/AttributeFormulas.gam.json`. The calculation module only accepts these core-stat constants from that matching source revision:

| Formula reference | Verified value | Applied to |
|---|---:|---|
| `ParagonNodeCoreStat_Normal` | 5 | The core attribute named by the node's attribute record |
| `ParagonNodeCoreStat_Magic` | 7 | The core attribute named by the node's attribute record |

An attribute is applied only when its `formulaReference`, `formulaValue`, and `verifiedBonus` all match the revision-scoped verified formula. This includes the four `Generic_Gate` core-stat attribute records. Multiple attribute records on one allocated node each contribute when verified.

## Unresolved and conditional mechanics

- Magic Armor, Damage, Maximum Life, and Damage-to-Elites formula references depend on unresolved power-budget multipliers. Their node literals are retained as context but are not added to totals.
- Rare-node attributes are reported as conditional when the node has threshold references. Threshold activation and the mapping from threshold references to bonus records are not implemented.
- Rare minor core-stat records that have a formula constant but also an unverified or conflicting node literal are not applied as verified bonuses.
- If the formula source revision is not recognized, no formula is considered verified; affected attribute records remain unresolved.

## Future integration

The current result exposes Paragon-only core totals, per-attribute evidence records, unresolved formula records, and conditional bonus records. Future character modeling can combine these Paragon contributions with independently sourced base, level, equipment, and other modifiers without changing allocation data or presenting Paragon bonuses as full character totals. This phase does not implement rare thresholds, damage calculations, or additional boards.
