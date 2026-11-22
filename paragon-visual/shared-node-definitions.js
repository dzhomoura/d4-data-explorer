const SOURCE_REVISION = "75e619f0d90a0951945747f45feef59c076a5db0";
const FORMULA_SOURCE_PATH = "json/base/meta/GameBalance/AttributeFormulas.gam.json";
const BOARD_SNO_IDS = Object.freeze({
  board00: 2436481,
  board01: 2436511,
  board02: 2436844
});
const ALL_BOARD_SNO_IDS = Object.freeze(Object.values(BOARD_SNO_IDS));

export const SHARED_NODE_DEFINITIONS = Object.freeze([
  share(createNormalNode("Generic_Normal_Str", 678769, "Strength_Core", 9), ALL_BOARD_SNO_IDS),
  share(createNormalNode("Generic_Normal_Int", 678776, "Intelligence_Core", 10), ALL_BOARD_SNO_IDS),
  share(createNormalNode("Generic_Normal_Will", 678773, "Willpower_Core", 11), ALL_BOARD_SNO_IDS),
  share(createNormalNode("Generic_Normal_Dex", 678775, "Dexterity_Core", 12), ALL_BOARD_SNO_IDS),
  share(createGateNode(), ALL_BOARD_SNO_IDS),
  share(createMagicNode("Generic_Magic_Armor", 671247, "Armor_Percent", 482, -1, "", "ParagonNodeArmorBonus_Magic"), [BOARD_SNO_IDS.board00, BOARD_SNO_IDS.board01]),
  share(createMagicNode("Generic_Magic_BlockChance", 2063114, "Block_Chance", 331, -1, "0", "ParagonNodeBlockChance_Magic"), [BOARD_SNO_IDS.board01, BOARD_SNO_IDS.board02]),
  share(createMagicNode("Generic_Magic_Damage", 678754, "Damage_Percent_All_From_Skills", 252, -1, "", "ParagonNodeDamageBonus_Magic"), [BOARD_SNO_IDS.board00, BOARD_SNO_IDS.board02]),
  share(createMagicNode("Generic_Magic_DamagePhysical", 678822, "Damage_Type_Percent_Bonus", 254, 0, "", "ParagonNodeDamageBonus_Magic"), [BOARD_SNO_IDS.board01, BOARD_SNO_IDS.board02]),
  share(createMagicNode("Generic_Magic_DamageToCC", 678792, "Damage_Percent_Bonus_Vs_CC_All", 959, -1, "", "ParagonNodeDamageBonusToCC_Magic"), [BOARD_SNO_IDS.board01, BOARD_SNO_IDS.board02]),
  share(createMagicNode("Generic_Magic_HPPercent", 679184, "Hitpoints_Max_Percent_Bonus", 142, -1, "0", "ParagonNodeHPMaxBonus_Magic"), ALL_BOARD_SNO_IDS),
  share(createMagicNode("Generic_Magic_Int", 678627, "Intelligence_Core", 10, -1, "", "ParagonNodeCoreStat_Magic", 7), ALL_BOARD_SNO_IDS),
  share(createMagicNode("Generic_Magic_Will", 678629, "Willpower_Core", 11, -1, "", "ParagonNodeCoreStat_Magic", 7), ALL_BOARD_SNO_IDS)
]);

function share(definition, boardSnoIds) {
  return Object.freeze({
    definition,
    boardSnoIds: Object.freeze([...boardSnoIds])
  });
}

function createNode(name, snoId, kind, rarityOverride, attributes, isGate = false) {
  return Object.freeze({
    name,
    displayName: null,
    snoId,
    sourcePath: `json/base/meta/ParagonNode/${name}.pgn.json`,
    kind,
    rarityOverride,
    attributes: Object.freeze(attributes),
    ptBonusAttributeIndices: Object.freeze([]),
    thresholdReferences: Object.freeze([]),
    passivePower: null,
    hasSocket: false,
    isGate
  });
}

function createAttribute(name, id, param, literalFormula, formulaReference, verifiedValue = null) {
  return Object.freeze({
    name,
    id,
    param,
    literalFormula,
    formulaReference,
    formulaValue: verifiedValue,
    verifiedBonus: verifiedValue
  });
}

function createNormalNode(name, snoId, attributeName, attributeId) {
  return createNode(name, snoId, "normal", 0, [
    createAttribute(attributeName, attributeId, -1, "", "ParagonNodeCoreStat_Normal", 5)
  ]);
}

function createMagicNode(name, snoId, attributeName, attributeId, param, literalFormula, formulaReference, verifiedValue = null) {
  return createNode(name, snoId, "magic", 2, [
    createAttribute(attributeName, attributeId, param, literalFormula, formulaReference, verifiedValue)
  ]);
}

function createGateNode() {
  return createNode("Generic_Gate", 994337, "gate", 0, [
    createAttribute("Strength_Core", 9, -1, "", "ParagonNodeCoreStat_Normal", 5),
    createAttribute("Intelligence_Core", 10, -1, "", "ParagonNodeCoreStat_Normal", 5),
    createAttribute("Willpower_Core", 11, -1, "", "ParagonNodeCoreStat_Normal", 5),
    createAttribute("Dexterity_Core", 12, -1, "", "ParagonNodeCoreStat_Normal", 5)
  ], true);
}

function indexDefinitions(nodes, label) {
  if (!Array.isArray(nodes)) throw new Error(`${label} node definitions are missing.`);
  const names = new Set();
  const snoIds = new Set();
  for (const definition of nodes) {
    if (!definition || typeof definition.name !== "string" || !Number.isSafeInteger(definition.snoId)) {
      throw new Error(`${label} contains an invalid node definition.`);
    }
    if (names.has(definition.name)) throw new Error(`${label} contains duplicate node name ${definition.name}.`);
    if (snoIds.has(definition.snoId)) throw new Error(`${label} contains duplicate node SNO ${definition.snoId}.`);
    names.add(definition.name);
    snoIds.add(definition.snoId);
  }
  return { names, snoIds };
}

function validateSharedDefinitions() {
  const knownBoardSnoIds = new Set(ALL_BOARD_SNO_IDS);
  const definitions = SHARED_NODE_DEFINITIONS.map((record) => record.definition);
  indexDefinitions(definitions, "Shared database");
  for (const record of SHARED_NODE_DEFINITIONS) {
    if (!Array.isArray(record.boardSnoIds) || record.boardSnoIds.length === 0
      || new Set(record.boardSnoIds).size !== record.boardSnoIds.length
      || record.boardSnoIds.some((snoId) => !knownBoardSnoIds.has(snoId))) {
      throw new Error(`Shared node ${record.definition.name} has invalid board applicability.`);
    }
  }
}

export function mergeSharedNodeDefinitions(boardDatabase) {
  if (!boardDatabase?.source || boardDatabase.source.commit !== SOURCE_REVISION) {
    throw new Error("Board node database does not match the shared-node source revision.");
  }
  if (boardDatabase.source.formulaSourcePath !== FORMULA_SOURCE_PATH) {
    throw new Error("Board node database does not match the shared-node formula source.");
  }
  if (!ALL_BOARD_SNO_IDS.includes(boardDatabase.source.boardSnoId)) {
    throw new Error(`Shared definitions do not support board SNO ${String(boardDatabase.source.boardSnoId)}.`);
  }

  validateSharedDefinitions();
  const boardIndex = indexDefinitions(boardDatabase.nodes, "Board database");
  const applicableDefinitions = SHARED_NODE_DEFINITIONS
    .filter((record) => record.boardSnoIds.includes(boardDatabase.source.boardSnoId))
    .map((record) => record.definition);
  indexDefinitions(applicableDefinitions, "Applicable shared database");
  for (const definition of applicableDefinitions) {
    if (boardIndex.names.has(definition.name) || boardIndex.snoIds.has(definition.snoId)) {
      throw new Error(`Board database conflicts with shared node ${definition.name} (${definition.snoId}).`);
    }
  }

  return {
    ...boardDatabase,
    nodes: [...boardDatabase.nodes, ...applicableDefinitions]
  };
}
