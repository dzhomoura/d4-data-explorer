import {
  BEACON_BONUS_REGISTRY,
  CASTLE_BONUS_REGISTRY,
  DIVINITY_BONUS_REGISTRY,
  ENDURE_BONUS_REGISTRY,
  FERVENT_BONUS_REGISTRY,
  PARAGON_BONUS_REGISTRY,
  PREACHER_BONUS_REGISTRY,
  RELENTLESS_BONUS_REGISTRY,
  SENTENCING_BONUS_REGISTRY,
  SHIELD_BEARER_BONUS_REGISTRY
} from "./paragon-bonus-registry.js";
import { resolvePlacedRareThreshold } from "./paragon-thresholds.js";

const FORMULA_SOURCE_PATH = "json/base/meta/GameBalance/AttributeFormulas.gam.json";
const VERIFIED_FORMULAS_BY_REVISION = new Map([
  [
    "75e619f0d90a0951945747f45feef59c076a5db0",
    new Map([
      ["ParagonNodeCoreStat_Normal", 5],
      ["ParagonNodeCoreStat_Magic", 7]
    ])
  ]
]);
const CORE_ATTRIBUTES = Object.freeze({
  Strength_Core: "Strength",
  Intelligence_Core: "Intelligence",
  Willpower_Core: "Willpower",
  Dexterity_Core: "Dexterity"
});
const ATTRIBUTE_NAMES = Object.freeze(["Strength", "Intelligence", "Willpower", "Dexterity"]);
const BONUS_CATEGORIES = Object.freeze([
  "damage",
  "damageToElites",
  "physicalDamage",
  "damageToCrowdControlled",
  "maximumLifePercent",
  "totalArmorPercent",
  "allResistance",
  "blockChance",
  "blockedDamageReduction",
  "thorns"
]);
const BOARD_BONUS_REGISTRIES = Object.freeze({
  [PARAGON_BONUS_REGISTRY.boardSnoId]: PARAGON_BONUS_REGISTRY,
  [CASTLE_BONUS_REGISTRY.boardSnoId]: CASTLE_BONUS_REGISTRY,
  [SHIELD_BEARER_BONUS_REGISTRY.boardSnoId]: SHIELD_BEARER_BONUS_REGISTRY,
  [FERVENT_BONUS_REGISTRY.boardSnoId]: FERVENT_BONUS_REGISTRY,
  [PREACHER_BONUS_REGISTRY.boardSnoId]: PREACHER_BONUS_REGISTRY,
  [DIVINITY_BONUS_REGISTRY.boardSnoId]: DIVINITY_BONUS_REGISTRY,
  [RELENTLESS_BONUS_REGISTRY.boardSnoId]: RELENTLESS_BONUS_REGISTRY,
  [SENTENCING_BONUS_REGISTRY.boardSnoId]: SENTENCING_BONUS_REGISTRY,
  [ENDURE_BONUS_REGISTRY.boardSnoId]: ENDURE_BONUS_REGISTRY,
  [BEACON_BONUS_REGISTRY.boardSnoId]: BEACON_BONUS_REGISTRY
});
const ZERO_EXTERNAL_ATTRIBUTES = Object.freeze({
  Strength: 0,
  Intelligence: 0,
  Willpower: 0,
  Dexterity: 0
});

function normalizeExternalAttributes(externalAttributes) {
  if (!externalAttributes || typeof externalAttributes !== "object" || Array.isArray(externalAttributes)) {
    throw new Error("External attributes must be provided as an attribute object.");
  }

  const normalized = {};
  for (const name of ATTRIBUTE_NAMES) {
    const value = externalAttributes[name];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`External ${name} must be a non-negative whole number.`);
    }
    normalized[name] = value;
  }
  return normalized;
}

function createBonusTotals(categories) {
  return Object.fromEntries(categories.map((category) => [
    category,
    { unconditional: 0, conditional: 0, total: 0 }
  ]));
}

function getRegistryNode(definition, boardRegistry) {
  if (!boardRegistry) return null;
  const record = boardRegistry.nodes[String(definition.snoId)];
  if (record?.name === definition.name && record.sourcePath === definition.sourcePath) return record;

  for (const reuse of boardRegistry.reuseNodeRecords || []) {
    if (!Number.isSafeInteger(reuse?.sourceBoardSnoId)
      || !Array.isArray(reuse.nodeSnoIds)
      || !reuse.nodeSnoIds.includes(definition.snoId)) {
      continue;
    }
    const sourceRegistry = BOARD_BONUS_REGISTRIES[reuse.sourceBoardSnoId];
    if (!sourceRegistry || sourceRegistry.sourceRevision !== boardRegistry.sourceRevision) continue;
    const sourceRecord = sourceRegistry.nodes[String(definition.snoId)];
    if (sourceRecord?.name === definition.name && sourceRecord.sourcePath === definition.sourcePath) {
      if (!reuse.baseOnly) return sourceRecord;
      return {
        ...sourceRecord,
        attributes: sourceRecord.attributes.map((attribute) => {
          const thresholdReference = reuse.reportUnresolvedConditional ? attribute.thresholdReference : null;
          return {
            ...attribute,
            conditional: thresholdReference ? null : 0,
            thresholdReference
          };
        })
      };
    }
  }
  return null;
}

function getRegisteredAttribute(nodeRecord, attribute, attributeIndex) {
  if (!nodeRecord) return null;
  const record = nodeRecord.attributes.find((candidate) => candidate.attributeIndex === attributeIndex);
  if (!record) return null;
  if (record.attributeId !== attribute.id
    || record.attributeName !== attribute.name
    || (record.attributeParam !== undefined && record.attributeParam !== attribute.param)
    || record.formulaReference !== (attribute.formulaReference || null)) {
    return { invalid: true, record };
  }
  return { invalid: false, record };
}

function evaluateThreshold(definition, nodeRecord, record, totalAttributes, boardRegistry, placementIndex) {
  if (!record.thresholdReference) {
    return { resolved: false, thresholdReference: null, reason: "Conditional bonus has no threshold reference." };
  }
  const definitionSlots = definition.ptBonusAttributeIndices;
  if (!nodeRecord?.ptBonusAttributeIndices?.includes(record.attributeIndex)
    || (definitionSlots && !definitionSlots.includes(record.attributeIndex))) {
    return {
      resolved: false,
      thresholdReference: record.thresholdReference,
      reason: "Attribute index is not marked by ptBonusAttributeIndices."
    };
  }
  const definitionThreshold = definition.thresholdReferences.find((entry) => entry.name === record.thresholdReference);
  if (!definitionThreshold) {
    return {
      resolved: false,
      thresholdReference: record.thresholdReference,
      reason: "Threshold reference is not present on this node definition."
    };
  }
  if (record.conditional === null) {
    return {
      resolved: false,
      thresholdReference: record.thresholdReference,
      reason: "Conditional amount and threshold requirement are unverified for this board."
    };
  }

  let threshold;
  if (placementIndex !== undefined) {
    threshold = resolvePlacedRareThreshold(definition, placementIndex);
    if (threshold.name !== record.thresholdReference) {
      return {
        resolved: false,
        thresholdReference: record.thresholdReference,
        reason: threshold.reason || "Pinned selector does not match the observed conditional bonus record."
      };
    }
  } else {
    threshold = boardRegistry?.thresholds[record.thresholdReference];
    if (threshold && definitionThreshold.snoId !== undefined && threshold.snoId !== definitionThreshold.snoId) {
      return {
        resolved: false,
        thresholdReference: record.thresholdReference,
        reason: "Threshold SNO does not match the node definition."
      };
    }
    if (threshold && threshold.observedBoardEquipIndex !== boardRegistry?.observedBoardEquipIndex) {
      return {
        resolved: false,
        thresholdReference: record.thresholdReference,
        reason: "No verified threshold is available for this board equip position."
      };
    }
  }
  if (threshold && threshold.requiredValue === null) {
    return {
      resolved: false,
      thresholdReference: record.thresholdReference,
      requiredAttribute: threshold.requiredAttribute || null,
      requirements: threshold.requirements || null,
      provenance: threshold.provenance,
      formula: threshold.formula || null,
      reason: threshold.unresolvedReason || "The threshold depends on unresolved runtime state."
    };
  }
  const thresholdContext = placementIndex === undefined
    ? { observedBoardEquipIndex: threshold?.observedBoardEquipIndex }
    : {
      placementIndex,
      selectorSnoId: threshold.selectorSnoId,
      ...(threshold.selectorProvenance && { selectorProvenance: threshold.selectorProvenance })
    };
  if (threshold && Array.isArray(threshold.requirements)) {
    const requirementsValid = threshold.combination === "all"
      && threshold.requirements.length > 0
      && threshold.requirements.every((requirement) => ATTRIBUTE_NAMES.includes(requirement.requiredAttribute)
        && Number.isSafeInteger(requirement.requiredValue) && requirement.requiredValue >= 0);
    if (!requirementsValid) {
      return {
        resolved: false,
        thresholdReference: record.thresholdReference,
        reason: "No verified composite threshold requirement is available for this reference."
      };
    }
    const requirements = threshold.requirements.map((requirement) => {
      const currentValue = totalAttributes[requirement.requiredAttribute];
      return {
        ...requirement,
        currentValue,
        remaining: Math.max(0, requirement.requiredValue - currentValue),
        satisfied: currentValue >= requirement.requiredValue
      };
    });
    return {
      resolved: true,
      thresholdReference: record.thresholdReference,
      combination: "all",
      requirements,
      satisfied: requirements.every((requirement) => requirement.satisfied),
      ...thresholdContext,
      provenance: threshold.provenance
    };
  }
  if (!threshold || !ATTRIBUTE_NAMES.includes(threshold.requiredAttribute)
    || !Number.isSafeInteger(threshold.requiredValue) || threshold.requiredValue < 0) {
    return {
      resolved: false,
      thresholdReference: record.thresholdReference,
      reason: "No verified threshold requirement is available for this reference."
    };
  }

  const currentValue = totalAttributes[threshold.requiredAttribute];
  return {
    resolved: true,
    thresholdReference: record.thresholdReference,
    requiredAttribute: threshold.requiredAttribute,
    requiredAttributeId: threshold.requiredAttributeId,
    requiredValue: threshold.requiredValue,
    currentValue,
    remaining: Math.max(0, threshold.requiredValue - currentValue),
    satisfied: currentValue >= threshold.requiredValue,
    ...thresholdContext,
    provenance: threshold.provenance,
    formula: threshold.formula
  };
}

export function calculateParagonBonuses(
  board,
  nodeDatabase,
  allocatedNodeIndices,
  externalAttributeInput = ZERO_EXTERNAL_ATTRIBUTES,
  calculationContext = {}
) {
  const width = Number(board?.nWidth);
  if (!Number.isInteger(width) || width < 1 || !Array.isArray(board.arEntries) || board.arEntries.length < width * width) {
    throw new Error("Calculation requires a valid board width and complete entry grid.");
  }
  if (!nodeDatabase || !Array.isArray(nodeDatabase.nodes) || !nodeDatabase.source) {
    throw new Error("Calculation requires a resolved node database and source metadata.");
  }
  if (!(allocatedNodeIndices instanceof Set)) {
    throw new Error("Allocated node indices must be provided as a Set.");
  }
  if (!calculationContext || typeof calculationContext !== "object" || Array.isArray(calculationContext)) {
    throw new Error("Calculation context must be an object.");
  }

  const definitions = new Map(nodeDatabase.nodes.map((definition) => [definition.name, definition]));
  if (definitions.size !== nodeDatabase.nodes.length) {
    throw new Error("Node database contains duplicate definitions.");
  }

  const externalAttributes = normalizeExternalAttributes(externalAttributeInput);
  const candidateRegistry = BOARD_BONUS_REGISTRIES[board.__snoID__] || null;
  const usesPlacement = Object.hasOwn(calculationContext, "placementIndex");
  const placementIndex = usesPlacement ? calculationContext.placementIndex : undefined;
  if (usesPlacement) {
    if (Object.hasOwn(calculationContext, "boardEquipIndex")) {
      throw new Error("Use either a placement index or a legacy board equip index.");
    }
    const starting = board.__snoID__ === PARAGON_BONUS_REGISTRY.boardSnoId;
    if (!Number.isInteger(placementIndex) || (starting ? placementIndex !== 0 : (placementIndex < 1 || placementIndex > 4))) {
      throw new Error("Invalid placement index. Starting uses index 0 and additional boards use indices 1–4.");
    }
  }
  // Single-board inspection retains its historical evidence context.
  const boardEquipIndex = usesPlacement ? null : calculationContext.boardEquipIndex ?? candidateRegistry?.observedBoardEquipIndex ?? null;
  if (boardEquipIndex !== null && (!Number.isSafeInteger(boardEquipIndex) || boardEquipIndex < 0)) {
    throw new Error("Board equip index must be a non-negative whole number.");
  }
  const boardRegistry = candidateRegistry
    && nodeDatabase.source.commit === candidateRegistry.sourceRevision
    && nodeDatabase.source.boardSnoId === candidateRegistry.boardSnoId
    && board.__snoID__ === candidateRegistry.boardSnoId
    && (usesPlacement || boardEquipIndex === candidateRegistry.observedBoardEquipIndex)
    ? candidateRegistry
    : null;
  const verifiedFormulas = nodeDatabase.source.formulaSourcePath === FORMULA_SOURCE_PATH
    ? VERIFIED_FORMULAS_BY_REVISION.get(nodeDatabase.source.commit)
    : null;
  const coreAttributes = {
    Strength: 0,
    Intelligence: 0,
    Willpower: 0,
    Dexterity: 0
  };
  const bonusCategories = BONUS_CATEGORIES.concat(candidateRegistry?.additionalBonusCategories || []);
  const bonusTotals = createBonusTotals(bonusCategories);
  const verifiedDetails = [];
  const registeredAttributesByNode = new Map();
  const thresholdResultsByAttribute = new Map();
  const unresolvedByBonus = new Map();

  function addUnresolved(nodeIndex, definition, attribute, attributeIndex, reason, conditional, formulaUnresolved = true) {
    const key = `${nodeIndex}:${attributeIndex}`;
    if (unresolvedByBonus.has(key)) return;
    unresolvedByBonus.set(key, {
      nodeIndex,
      nodeName: definition.name,
      attributeName: attribute.name,
      formulaReference: attribute.formulaReference || null,
      formulaValue: attribute.formulaValue ?? null,
      nodeLiteral: attribute.literalFormula || null,
      thresholdReferences: definition.thresholdReferences.map((threshold) => threshold.name),
      reason,
      formulaUnresolved,
      conditional: Boolean(conditional)
    });
  }

  for (const index of allocatedNodeIndices) {
    if (!Number.isInteger(index) || index < 0 || index >= width * width) {
      throw new Error(`Allocated node index ${String(index)} is outside the board.`);
    }

    const entry = board.arEntries[index];
    if (!entry || typeof entry.name !== "string") {
      throw new Error(`Allocated node index ${index} is empty on this board.`);
    }
    const definition = definitions.get(entry.name);
    if (!definition || definition.snoId !== entry.__raw__) {
      throw new Error(`Resolved node definition is missing or mismatched for ${entry.name}.`);
    }
    if (!Array.isArray(definition.attributes) || !Array.isArray(definition.thresholdReferences)) {
      throw new Error(`Node definition ${definition.name} has an invalid attribute or threshold list.`);
    }

    const nodeRecord = getRegistryNode(definition, boardRegistry);
    const registeredAttributes = new Map();
    registeredAttributesByNode.set(index, registeredAttributes);

    if (definition.passivePower && !nodeRecord) {
      addUnresolved(
        index,
        definition,
        { name: "Legendary_Power", formulaReference: null, formulaValue: null, literalFormula: null },
        -1,
        `Legendary power ${definition.passivePower.name} has no verified numerical model for this board.`,
        false,
        false
      );
    }

    for (let attributeIndex = 0; attributeIndex < definition.attributes.length; attributeIndex += 1) {
      const attribute = definition.attributes[attributeIndex];
      const formulaReference = attribute.formulaReference || null;
      const registered = getRegisteredAttribute(nodeRecord, attribute, attributeIndex);
      if (registered?.invalid) {
        addUnresolved(index, definition, attribute, attributeIndex, "Observed bonus registry does not match the node attribute identity.", false);
        continue;
      }
      if (registered) {
        const record = registered.record;
        if (!Number.isFinite(record.base) || record.base < 0
          || (record.conditional !== null && (!Number.isFinite(record.conditional) || record.conditional < 0))
          || (record.category !== "coreAttribute" && !bonusCategories.includes(record.category))) {
          addUnresolved(index, definition, attribute, attributeIndex, "Observed bonus registry contains an invalid value or category.", record.conditional > 0);
          continue;
        }
        registeredAttributes.set(attributeIndex, record);
        if (record.category === "coreAttribute") {
          const resultAttribute = CORE_ATTRIBUTES[attribute.name];
          if (!resultAttribute) {
            addUnresolved(index, definition, attribute, attributeIndex, "Registered core attribute does not map to a supported total.", false);
            continue;
          }
          coreAttributes[resultAttribute] += record.base;
        } else {
          bonusTotals[record.category].unconditional += record.base;
        }
        if (record.category === "coreAttribute") {
          verifiedDetails.push({
            nodeIndex: index,
            nodeName: definition.name,
            attributeName: attribute.name,
            formulaReference,
            value: record.base,
            provenance: record.provenance
          });
        }
        continue;
      }

      const verifiedValue = formulaReference && verifiedFormulas
        ? verifiedFormulas.get(formulaReference)
        : undefined;
      const isVerifiedFormula = Number.isFinite(verifiedValue)
        && attribute.formulaValue === verifiedValue
        && attribute.verifiedBonus === verifiedValue;
      const resultAttribute = CORE_ATTRIBUTES[attribute.name];
      if (!isVerifiedFormula || !resultAttribute || definition.thresholdReferences.length > 0) {
        const reason = !verifiedFormulas
          ? "No verified formula registry is available for this source revision."
          : !formulaReference || !Number.isFinite(verifiedValue)
            ? "Formula reference has no verified numerical value."
            : !resultAttribute
              ? "This calculator does not yet resolve this attribute."
              : definition.thresholdReferences.length > 0
                ? "Thresholded attribute is not in the observed bonus registry."
                : "Node formula metadata does not match the verified numerical value.";
        const hasUnresolvedConditional = candidateRegistry?.unverifiedRareThresholds
          ? definition.ptBonusAttributeIndices?.includes(attributeIndex)
          : definition.thresholdReferences.length > 0;
        addUnresolved(index, definition, attribute, attributeIndex, reason, hasUnresolvedConditional);
        continue;
      }

      coreAttributes[resultAttribute] += verifiedValue;
      verifiedDetails.push({
        nodeIndex: index,
        nodeName: definition.name,
        attributeName: attribute.name,
        formulaReference,
        value: verifiedValue,
        provenance: "verified-game-formula"
      });
    }
  }

  function getTotalAttributes() {
    return Object.fromEntries(ATTRIBUTE_NAMES.map((name) => [name, externalAttributes[name] + coreAttributes[name]]));
  }

  let totalAttributes = getTotalAttributes();
  for (const index of allocatedNodeIndices) {
    const entry = board.arEntries[index];
    const definition = definitions.get(entry.name);
    const nodeRecord = getRegistryNode(definition, boardRegistry);
    const registeredAttributes = registeredAttributesByNode.get(index);
    for (const [attributeIndex, record] of registeredAttributes) {
      if (record.conditional === 0) continue;
      const threshold = evaluateThreshold(definition, nodeRecord, record, totalAttributes, boardRegistry, placementIndex);
      thresholdResultsByAttribute.set(`${index}:${attributeIndex}`, threshold);
      if (!threshold.resolved) {
        addUnresolved(index, definition, definition.attributes[attributeIndex], attributeIndex, threshold.reason, true, false);
        continue;
      }
      if (!threshold.satisfied) continue;
      if (record.category === "coreAttribute") {
        const resultAttribute = CORE_ATTRIBUTES[definition.attributes[attributeIndex].name];
        coreAttributes[resultAttribute] += record.conditional;
      } else {
        bonusTotals[record.category].conditional += record.conditional;
      }
    }
  }
  totalAttributes = getTotalAttributes();

  const nodeEvaluations = [];
  for (let index = 0; index < width * width; index += 1) {
    const entry = board.arEntries[index];
    if (!entry) continue;
    const definition = definitions.get(entry.name);
    const nodeRecord = getRegistryNode(definition, boardRegistry);
    const isAllocated = allocatedNodeIndices.has(index);
    const attributeEvaluations = [];
    const thresholdEvaluations = [];

    for (let attributeIndex = 0; attributeIndex < definition.attributes.length; attributeIndex += 1) {
      const attribute = definition.attributes[attributeIndex];
      const registered = getRegisteredAttribute(nodeRecord, attribute, attributeIndex);
      const formulaReference = attribute.formulaReference || null;
      const verifiedValue = formulaReference && verifiedFormulas ? verifiedFormulas.get(formulaReference) : undefined;
      const isVerifiedFormula = Number.isFinite(verifiedValue)
        && attribute.formulaValue === verifiedValue
        && attribute.verifiedBonus === verifiedValue;
      const resultAttribute = CORE_ATTRIBUTES[attribute.name];
      let record = registered && !registered.invalid ? registered.record : null;
      let unconditional = null;
      let conditional = candidateRegistry?.unverifiedRareThresholds
        && definition.ptBonusAttributeIndices?.includes(attributeIndex) ? null : 0;
      let provenance = null;

      if (record) {
        unconditional = record.base;
        conditional = record.conditional;
        provenance = record.provenance;
      } else if (isVerifiedFormula && resultAttribute && definition.thresholdReferences.length === 0) {
        unconditional = verifiedValue;
        provenance = "verified-game-formula";
      }

      let threshold = null;
      if (record && (record.conditional === null || record.conditional > 0)) {
        threshold = thresholdResultsByAttribute.get(`${index}:${attributeIndex}`)
          || evaluateThreshold(definition, nodeRecord, record, totalAttributes, boardRegistry, placementIndex);
        thresholdEvaluations.push(threshold);
      }
      attributeEvaluations.push({
        attributeIndex,
        attributeId: attribute.id,
        attributeName: attribute.name,
        formulaReference,
        category: record?.category || (resultAttribute ? "coreAttribute" : null),
        unconditional,
        conditional,
        thresholdReference: record?.thresholdReference || null,
        conditionalApplied: Boolean(isAllocated && threshold?.resolved && threshold.satisfied),
        threshold,
        provenance,
        unresolved: unconditional === null
      });
    }

    nodeEvaluations.push({
      nodeIndex: index,
      nodeName: definition.name,
      displayName: nodeRecord?.displayName || definition.displayName || null,
      snoId: definition.snoId,
      allocated: isAllocated,
      ptBonusAttributeIndices: nodeRecord?.ptBonusAttributeIndices || definition.ptBonusAttributeIndices || [],
      attributes: attributeEvaluations,
      thresholds: thresholdEvaluations
    });
  }

  for (const category of bonusCategories) {
    const totals = bonusTotals[category];
    totals.total = totals.unconditional + totals.conditional;
  }

  const unresolvedBonuses = [...unresolvedByBonus.values()];
  const unresolvedFormulaReferences = unresolvedBonuses.filter((bonus) => bonus.formulaUnresolved);
  const conditionalBonuses = nodeEvaluations.flatMap((node) => (node.allocated ? node.attributes : [])
    .filter((attribute) => attribute.conditional > 0)
    .map((attribute) => ({
      nodeIndex: node.nodeIndex,
      nodeName: node.nodeName,
      attributeName: attribute.attributeName,
      conditionalValue: attribute.conditional,
      threshold: attribute.threshold,
      applied: attribute.conditionalApplied
    })));
  const totalCoreAttributes = Object.values(coreAttributes).reduce((total, value) => total + value, 0);

  return {
    sourceRevision: nodeDatabase.source.commit,
    allocatedNodeCount: allocatedNodeIndices.size,
    externalAttributes,
    totalAttributes,
    nodeEvaluations,
    verifiedParagonBonuses: {
      coreAttributes,
      totalCoreAttributes,
      rawBonuses: bonusTotals,
      details: verifiedDetails
    },
    unresolvedFormulaReferences,
    conditionalBonuses,
    unresolvedBonusCount: unresolvedBonuses.length
  };
}
