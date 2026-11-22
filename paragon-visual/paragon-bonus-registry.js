const DIRECT_IN_GAME = "direct-in-game";
const FORMULA_DERIVED = "formula-derived";
const UNAMPLIFIED_PLANNER = "unamplified-planner";
const NO_GLYPH_AMPLIFICATION = false;

export const PARAGON_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2436481,
  observedBoardEquipIndex: 0,
  thresholds: {
    StrengthMain1: {
      snoId: 1015345,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 630,
      formula: "630 + (455 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 0,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide2: {
      snoId: 1015351,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 210,
      formula: "210 + (75 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 0,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide1: {
      snoId: 1015310,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 190,
      formula: "190 + (75 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 0,
      provenance: DIRECT_IN_GAME
    }
  },
  nodes: {
    "678754": {
      name: "Generic_Magic_Damage",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_Damage.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 252,
          attributeName: "Damage_Percent_All_From_Skills",
          formulaReference: "ParagonNodeDamageBonus_Magic",
          category: "damage",
          base: 5,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "678842": {
      name: "Generic_Magic_DamageToElite",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageToElite.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 953,
          attributeName: "Damage_Percent_Bonus_Vs_Elites",
          formulaReference: "ParagonNodeDamageBonusToElite_Magic",
          category: "damageToElites",
          base: 7.5,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "679184": {
      name: "Generic_Magic_HPPercent",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_HPPercent.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 142,
          attributeName: "Hitpoints_Max_Percent_Bonus",
          formulaReference: "ParagonNodeHPMaxBonus_Magic",
          category: "maximumLifePercent",
          base: 2,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "671247": {
      name: "Generic_Magic_Armor",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_Armor.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 482,
          attributeName: "Armor_Percent",
          formulaReference: "ParagonNodeArmorBonus_Magic",
          category: "totalArmorPercent",
          base: 1.5,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "675448": {
      name: "Barbarian_Rare_022",
      displayName: "Brawn",
      sourcePath: "json/base/meta/ParagonNode/Barbarian_Rare_022.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 252,
          attributeName: "Damage_Percent_All_From_Skills",
          formulaReference: "ParagonNodeDamageBonus_RareMajor",
          category: "damage",
          base: 10,
          conditional: 10,
          thresholdReference: "StrengthMain1",
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        },
        {
          attributeIndex: 1,
          attributeId: 142,
          attributeName: "Hitpoints_Max_Percent_Bonus",
          formulaReference: "ParagonNodeHPMaxBonus_RareMinor",
          category: "maximumLifePercent",
          base: 4,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "675186": {
      name: "Barbarian_Rare_015",
      displayName: "Tenacity",
      sourcePath: "json/base/meta/ParagonNode/Barbarian_Rare_015.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 142,
          attributeName: "Hitpoints_Max_Percent_Bonus",
          formulaReference: "ParagonNodeHPMaxBonus_RareMajor",
          category: "maximumLifePercent",
          base: 4,
          conditional: 4,
          thresholdReference: "StrengthMain1",
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        },
        {
          attributeIndex: 1,
          attributeId: 482,
          attributeName: "Armor_Percent",
          formulaReference: "ParagonNodeArmorBonus_RareMinor",
          category: "totalArmorPercent",
          base: 2,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "2549802": {
      name: "Generic_Rare_118",
      displayName: "Raw Power",
      sourcePath: "json/base/meta/ParagonNode/Generic_Rare_118.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 252,
          attributeName: "Damage_Percent_All_From_Skills",
          formulaReference: "ParagonNodeDamageBonus_RareMajor",
          category: "damage",
          base: 10,
          conditional: 10,
          thresholdReference: "IntelligenceSide2",
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        },
        {
          attributeIndex: 1,
          attributeId: 9,
          attributeName: "Strength_Core",
          formulaReference: "ParagonNodeCoreStat_RareMinor",
          category: "coreAttribute",
          base: 10,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    },
    "2126168": {
      name: "Barbarian_Rare_039",
      displayName: "Iron Strength",
      sourcePath: "json/base/meta/ParagonNode/Barbarian_Rare_039.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        {
          attributeIndex: 0,
          attributeId: 953,
          attributeName: "Damage_Percent_Bonus_Vs_Elites",
          formulaReference: "ParagonNodeDamageBonusToElite_RareMajor",
          category: "damageToElites",
          base: 15,
          conditional: 15,
          thresholdReference: "WillPowerSide1",
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        },
        {
          attributeIndex: 1,
          attributeId: 9,
          attributeName: "Strength_Core",
          formulaReference: "ParagonNodeCoreStat_RareMinor",
          category: "coreAttribute",
          base: 10,
          conditional: 0,
          thresholdReference: null,
          provenance: DIRECT_IN_GAME,
          glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION
        }
      ]
    }
  }
};

// Castle values are board-scoped. Formula-derived values combine the pinned
// AttributeFormulas coefficient with a multiplier calibrated by the existing
// direct in-game Board 00 observations. Rare values and requirements are
// scoped to the user-supplied unamplified Maxroll observation at equip index 1.
export const CASTLE_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2436511,
  observedBoardEquipIndex: 1,
  thresholds: {
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      formula: "890 + (455 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 1,
      provenance: UNAMPLIFIED_PLANNER
    },
    IntelligenceSide1: {
      snoId: 1015350,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 265,
      formula: "190 + (75 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 1,
      provenance: UNAMPLIFIED_PLANNER
    },
    WillPowerSide3: {
      snoId: 1015322,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 305,
      formula: "230 + (75 * ParagonBoardEquipIndex)",
      observedBoardEquipIndex: 1,
      provenance: UNAMPLIFIED_PLANNER
    },
    "Paladin_Strength+Willpower": {
      snoId: 2504901,
      combination: "all",
      requirements: [
        {
          requiredAttribute: "Strength",
          requiredAttributeId: 18,
          requiredValue: 1155,
          formula: "700 + (455 * ParagonBoardEquipIndex)"
        },
        {
          requiredAttribute: "Willpower",
          requiredAttributeId: 20,
          requiredValue: 260,
          formula: "190 + (70 * ParagonBoardEquipIndex)"
        }
      ],
      observedBoardEquipIndex: 1,
      provenance: UNAMPLIFIED_PLANNER
    }
  },
  nodes: {
    "671247": {
      name: "Generic_Magic_Armor",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_Armor.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", formulaReference: "ParagonNodeArmorBonus_Magic", category: "totalArmorPercent", base: 1.5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2127186": {
      name: "Generic_Magic_ArmorPercent",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_ArmorPercent.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", formulaReference: "ParagonNodeArmorBonus_Magic", category: "totalArmorPercent", base: 1.5, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2063114": {
      name: "Generic_Magic_BlockChance",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_BlockChance.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 331, attributeName: "Block_Chance", formulaReference: "ParagonNodeBlockChance_Magic", category: "blockChance", base: 2, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "678822": {
      name: "Generic_Magic_DamagePhysical",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamagePhysical.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", formulaReference: "ParagonNodeDamageBonus_Magic", category: "physicalDamage", base: 5, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "678792": {
      name: "Generic_Magic_DamageToCC",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageToCC.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 959, attributeName: "Damage_Percent_Bonus_Vs_CC_All", formulaReference: "ParagonNodeDamageBonusToCC_Magic", category: "damageToCrowdControlled", base: 8.75, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679184": {
      name: "Generic_Magic_HPPercent",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_HPPercent.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", formulaReference: "ParagonNodeHPMaxBonus_Magic", category: "maximumLifePercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "678750": {
      name: "Generic_Magic_ResistanceAll",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_ResistanceAll.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", formulaReference: "ParagonNodeResistAll_Magic", category: "allResistance", base: 1.5, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449713": {
      name: "Paladin_Rare_005",
      displayName: "Defiance",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_005.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", formulaReference: "ParagonNodeArmorBonus_RareMajor", category: "totalArmorPercent", base: 3, conditional: 3, thresholdReference: "StrengthMain3", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", formulaReference: "ParagonNodeResistAll_RareMinor", category: "allResistance", base: 3, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449715": {
      name: "Paladin_Rare_006",
      displayName: "Grappler",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_006.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "physicalDamage", base: 10, conditional: 10, thresholdReference: "IntelligenceSide1", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 959, attributeName: "Damage_Percent_Bonus_Vs_CC_All", formulaReference: "ParagonNodeCritDamageToCC_RareMinor", category: "damageToCrowdControlled", base: 10, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449717": {
      name: "Paladin_Rare_007",
      displayName: "Ironclad",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_007.pgn.json",
      ptBonusAttributeIndices: [1],
      attributes: [
        { attributeIndex: 0, attributeId: 9, attributeName: "Strength_Core", formulaReference: "ParagonNodeCoreStat_RareMajor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 482, attributeName: "Armor_Percent", formulaReference: "ParagonNodeArmorBonus_RareMinor", category: "totalArmorPercent", base: 2, conditional: 2, thresholdReference: "IntelligenceSide1", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449719": {
      name: "Paladin_Rare_008",
      displayName: "Stalwart",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_008.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 331, attributeName: "Block_Chance", formulaReference: "ParagonNodeBlockChance_RareMinor", category: "blockChance", base: 2.5, conditional: 2.5, thresholdReference: "WillPowerSide3", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 335, attributeName: "Block_Damage_Percent_Bonus", formulaReference: "ParagonNodeDamageBonusDot_RareMajor", category: "blockedDamageReduction", base: 15, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449721": {
      name: "Paladin_Rare_009",
      displayName: "Insulate",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_009.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 959, attributeName: "Damage_Percent_Bonus_Vs_CC_All", formulaReference: "ParagonNodeCritDamageToCC_RareMajor", category: "damageToCrowdControlled", base: 10, conditional: 10, thresholdReference: "Paladin_Strength+Willpower", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", formulaReference: "ParagonNodeResistAll_RareMinor", category: "allResistance", base: 3, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449723": {
      name: "Paladin_Rare_010",
      displayName: "Knight",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_010.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "physicalDamage", base: 10, conditional: 10, thresholdReference: "Paladin_Strength+Willpower", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};

// These records reuse only direct Board 00 observations for identical source
// node identities on Shield Bearer. They deliberately do not establish a
// formula-wide Damage or Maximum Life rule.
export const SHIELD_BEARER_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2436844,
  observedBoardEquipIndex: 2,
  thresholds: {
    StrengthMain2: {
      snoId: 1015344,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1215,
      observedBoardEquipIndex: 2,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide3: {
      snoId: 1015322,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 305,
      observedBoardEquipIndex: 2,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      observedBoardEquipIndex: 2,
      provenance: UNAMPLIFIED_PLANNER
    },
    "Paladin_Strength+Intelligence": {
      snoId: 2504903,
      combination: "all",
      requirements: [
        { requiredAttribute: "Strength", requiredAttributeId: 18, requiredValue: 1155 },
        { requiredAttribute: "Intelligence", requiredAttributeId: 19, requiredValue: 260 }
      ],
      observedBoardEquipIndex: 2,
      provenance: UNAMPLIFIED_PLANNER
    }
  },
  reuseNodeRecords: [
    {
      sourceBoardSnoId: 2436511,
      nodeSnoIds: [2063114, 678822, 678792]
    },
    {
      sourceBoardSnoId: 2436511,
      nodeSnoIds: [2449723],
      baseOnly: true
    }
  ],
  nodes: {
    "2066535": {
      name: "Generic_Magic_Thorns",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_Thorns.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 373, attributeName: "Thorns_Flat", formulaReference: "ParagonNodeThorns_Magic", category: "thorns", base: 100, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449719": {
      name: "Paladin_Rare_008",
      displayName: "Stalwart",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_008.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 331, attributeName: "Block_Chance", formulaReference: "ParagonNodeBlockChance_RareMinor", category: "blockChance", base: 2.5, conditional: 2.5, thresholdReference: "WillPowerSide3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 335, attributeName: "Block_Damage_Percent_Bonus", formulaReference: "ParagonNodeDamageBonusDot_RareMajor", category: "blockedDamageReduction", base: 15, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449751": {
      name: "Paladin_Rare_011",
      displayName: "Growth",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_011.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 373, attributeName: "Thorns_Flat", formulaReference: "ParagonNodeThorns_RareMajor", category: "thorns", base: 150, conditional: 150, thresholdReference: "StrengthMain2", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449755": {
      name: "Paladin_Rare_013",
      displayName: "Constrict",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_013.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 373, attributeName: "Thorns_Flat", formulaReference: "ParagonNodeThorns_RareMajor", category: "thorns", base: 150, conditional: 150, thresholdReference: "WillPowerSide3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "678754": {
      name: "Generic_Magic_Damage",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_Damage.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 252, attributeName: "Damage_Percent_All_From_Skills", formulaReference: "ParagonNodeDamageBonus_Magic", category: "damage", base: 5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679184": {
      name: "Generic_Magic_HPPercent",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_HPPercent.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", formulaReference: "ParagonNodeHPMaxBonus_Magic", category: "maximumLifePercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449753": {
      name: "Paladin_Rare_012",
      displayName: "Bludgeoning",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_012.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 252, attributeName: "Damage_Percent_All_From_Skills", formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "damage", base: 10, conditional: 10, thresholdReference: "StrengthMain3", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 959, attributeName: "Damage_Percent_Bonus_Vs_CC_All", formulaReference: "ParagonNodeCritDamageToCC_RareMinor", category: "damageToCrowdControlled", base: 10, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449759": {
      name: "Paladin_Rare_015",
      displayName: "Bodyguard",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_015.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "physicalDamage", base: 10, conditional: 10, thresholdReference: "Paladin_Strength+Intelligence", provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 331, attributeName: "Block_Chance", formulaReference: "ParagonNodeBlockChance_RareMinor", category: "blockChance", base: 2.5, conditional: 0, thresholdReference: null, provenance: UNAMPLIFIED_PLANNER, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};
