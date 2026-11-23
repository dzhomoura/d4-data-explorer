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

// Fervent Rare bonuses and requirements are direct in-game observations at equip index 3.
export const FERVENT_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2438913,
  observedBoardEquipIndex: 3,
  additionalBonusCategories: ["criticalStrikeDamage", "maximumFaith"],
  thresholds: {
    StrengthMain1: {
      snoId: 1015345,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1085,
      observedBoardEquipIndex: 3,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide1: {
      snoId: 1015350,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 265,
      observedBoardEquipIndex: 3,
      provenance: DIRECT_IN_GAME
    },
    "Paladin_Strength+Willpower": {
      snoId: 2504901,
      combination: "all",
      requirements: [
        { requiredAttribute: "Strength", requiredAttributeId: 18, requiredValue: 1155 },
        { requiredAttribute: "Willpower", requiredAttributeId: 20, requiredValue: 260 }
      ],
      observedBoardEquipIndex: 3,
      provenance: DIRECT_IN_GAME
    },
    "Paladin_Strength+Intelligence": {
      snoId: 2504903,
      combination: "all",
      requirements: [
        { requiredAttribute: "Strength", requiredAttributeId: 18, requiredValue: 1155 },
        { requiredAttribute: "Intelligence", requiredAttributeId: 19, requiredValue: 260 }
      ],
      observedBoardEquipIndex: 3,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      observedBoardEquipIndex: 3,
      provenance: DIRECT_IN_GAME
    }
  },
  reuseNodeRecords: [
    {
      sourceBoardSnoId: 2436481,
      nodeSnoIds: [679184]
    },
    {
      sourceBoardSnoId: 2436511,
      nodeSnoIds: [2127186, 678822, 678750]
    }
  ],
  nodes: {
    "2449944": {
      name: "Paladin_Rare_055",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_055.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMajor", category: "allResistance", base: 3, conditional: 3, thresholdReference: "StrengthMain1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449942": {
      name: "Paladin_Rare_054",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_054.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMajor", category: "totalArmorPercent", base: 3, conditional: 3, thresholdReference: "IntelligenceSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449723": {
      name: "Paladin_Rare_010",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_010.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", attributeParam: 0, formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "physicalDamage", base: 10, conditional: 10, thresholdReference: "Paladin_Strength+Willpower", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449771": {
      name: "Paladin_Rare_021",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_021.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 288, attributeName: "Crit_Damage_Percent", attributeParam: -1, formulaReference: "ParagonNodeCritDamage_RareMajor", category: "criticalStrikeDamage", base: 15, conditional: 15, thresholdReference: "Paladin_Strength+Intelligence", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449765": {
      name: "Paladin_Rare_018",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_018.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 161, attributeName: "Resource_Max_Bonus", attributeParam: 9, formulaReference: "ParagonNodeResourceBonus_RareMajor", category: "maximumFaith", base: 4, conditional: 4, thresholdReference: "StrengthMain3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 288, attributeName: "Crit_Damage_Percent", attributeParam: -1, formulaReference: "ParagonNodeCritDamage_RareMinor", category: "criticalStrikeDamage", base: 15, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449763": {
      name: "Paladin_Rare_017",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_017.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 254, attributeName: "Damage_Type_Percent_Bonus", attributeParam: 0, formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "physicalDamage", base: 10, conditional: 10, thresholdReference: "Paladin_Strength+Willpower", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMinor", category: "totalArmorPercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2525975": {
      name: "Paladin_Magic_Faith",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Magic_Faith.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 161, attributeName: "Resource_Max_Bonus", attributeParam: 9, formulaReference: "ParagonNodeResourceBonus_Magic", category: "maximumFaith", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "671242": {
      name: "Generic_Magic_CriticalDamage",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_CriticalDamage.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 288, attributeName: "Crit_Damage_Percent", attributeParam: -1, formulaReference: "ParagonNodeCritDamage_Magic", category: "criticalStrikeDamage", base: 7.5, conditional: 0, thresholdReference: null, provenance: FORMULA_DERIVED, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};

// Board-scoped observations preserve the pinned selectors and the measured
// requirements for each equip context.
export const PREACHER_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2438973,
  observedBoardEquipIndex: 4,
  additionalBonusCategories: ["attackSpeed", "fortifyGeneration", "healingReceived", "damageWhileFortified", "damageWhileHealthy"],
  thresholds: {
    StrengthMain2: {
      snoId: 1015344,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1215,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain1: {
      snoId: 1015345,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1085,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide1: {
      snoId: 1015310,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 265,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide1: {
      snoId: 1015350,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 265,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide2: {
      snoId: 1015277,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 285,
      observedBoardEquipIndex: 4,
      provenance: DIRECT_IN_GAME
    }
  },
  reuseNodeRecords: [
    { sourceBoardSnoId: 2436481, nodeSnoIds: [679184] },
    { sourceBoardSnoId: 2436511, nodeSnoIds: [678750] }
  ],
  nodes: {
    "2449777": {
      name: "Paladin_Rare_024",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_024.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMajor", category: "allResistance", base: 3, conditional: 3, thresholdReference: "StrengthMain2", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 221, attributeName: "Attack_Speed_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeAttackSpeed_RareMinor", category: "attackSpeed", base: 1.3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449780": {
      name: "Paladin_Rare_025",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_025.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 65, attributeName: "Bonus_Healing_Received_Percent", attributeParam: -1, formulaReference: "ParagonNodeHealingBonus_RareMajor", category: "healingReceived", base: 6, conditional: 6, thresholdReference: "StrengthMain3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449782": {
      name: "Paladin_Rare_026",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_026.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 747, attributeName: "Fortified_Health_Application_Bonus", attributeParam: -1, formulaReference: "ParagonNodeFortifyBonus_RareMajor", category: "fortifyGeneration", base: 3.2, conditional: 3.2, thresholdReference: "StrengthMain1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449784": {
      name: "Paladin_Rare_027",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_027.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMajor", category: "maximumLifePercent", base: 4, conditional: 4, thresholdReference: "WillPowerSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449786": {
      name: "Paladin_Rare_028",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_028.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 221, attributeName: "Attack_Speed_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeAttackSpeed_RareMajor", category: "attackSpeed", base: 1.3, conditional: 1.3, thresholdReference: "IntelligenceSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679987": {
      name: "Generic_Rare_026",
      sourcePath: "json/base/meta/ParagonNode/Generic_Rare_026.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 748, attributeName: "Damage_Percent_Bonus_When_Fortified", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusWhileFortified_RareMajor", category: "damageWhileFortified", base: 10, conditional: 10, thresholdReference: "WillPowerSide2", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 1123, attributeName: "Damage_Bonus_At_High_Health", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusWhileHealthy_RareMinor", category: "damageWhileHealthy", base: 12.5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679050": {
      name: "Generic_Magic_DamageWhileFortified",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageWhileFortified.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 748, attributeName: "Damage_Percent_Bonus_When_Fortified", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusWhileFortified_Magic", category: "damageWhileFortified", base: 5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679054": {
      name: "Generic_Magic_DamageWhileHealthy",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageWhileHealthy.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 1123, attributeName: "Damage_Bonus_At_High_Health", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusWhileHealthy_Magic", category: "damageWhileHealthy", base: 6.3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679060": {
      name: "Generic_Magic_AttackSpeed",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_AttackSpeed.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 221, attributeName: "Attack_Speed_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeAttackSpeedBySkillTag_Magic", category: "attackSpeed", base: 1.3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "1023952": {
      name: "Generic_Magic_BonusFortify",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_BonusFortify.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 747, attributeName: "Fortified_Health_Application_Bonus", attributeParam: -1, formulaReference: "ParagonNodeFortifyBonus_Magic", category: "fortifyGeneration", base: 1.6, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "1195913": {
      name: "Generic_Magic_HealingBonus",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_HealingBonus.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 65, attributeName: "Bonus_Healing_Received_Percent", attributeParam: -1, formulaReference: "ParagonNodeHealingBonus_Magic", category: "healingReceived", base: 3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};

export const DIVINITY_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2438992,
  observedBoardEquipIndex: 5,
  additionalBonusCategories: ["vulnerableDamage"],
  thresholds: {
    WillPowerSide1: {
      snoId: 1015310,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 265,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide2: {
      snoId: 1015277,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 285,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain1: {
      snoId: 1015345,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1085,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide2: {
      snoId: 1015351,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 285,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide1: {
      snoId: 1015350,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 265,
      observedBoardEquipIndex: 5,
      provenance: DIRECT_IN_GAME
    }
  },
  reuseNodeRecords: [
    { sourceBoardSnoId: 2436481, nodeSnoIds: [678754, 679184] },
    { sourceBoardSnoId: 2436511, nodeSnoIds: [2127186, 678750] }
  ],
  nodes: {
    "2449940": {
      name: "Paladin_Rare_053",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_053.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 252, attributeName: "Damage_Percent_All_From_Skills", attributeParam: -1, formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "damage", base: 10, conditional: 10, thresholdReference: "WillPowerSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "671197": {
      name: "Barbarian_Rare_004",
      sourcePath: "json/base/meta/ParagonNode/Barbarian_Rare_004.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 736, attributeName: "Vulnerable_Health_Damage_Bonus", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusToVulnerable_RareMajor", category: "vulnerableDamage", base: 13, conditional: 13, thresholdReference: "WillPowerSide2", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449796": {
      name: "Paladin_Rare_033",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_033.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 252, attributeName: "Damage_Percent_All_From_Skills", attributeParam: -1, formulaReference: "ParagonNodeDamageBonus_RareMajor", category: "damage", base: 10, conditional: 10, thresholdReference: "StrengthMain1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMinor", category: "allResistance", base: 3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2504935": {
      name: "Paladin_Rare_059",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_059.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 736, attributeName: "Vulnerable_Health_Damage_Bonus", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusToVulnerable_RareMajor", category: "vulnerableDamage", base: 13, conditional: 13, thresholdReference: "IntelligenceSide2", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMinor", category: "totalArmorPercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449713": {
      name: "Paladin_Rare_005",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_005.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMajor", category: "totalArmorPercent", base: 3, conditional: 3, thresholdReference: "StrengthMain3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMinor", category: "allResistance", base: 3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449942": {
      name: "Paladin_Rare_054",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_054.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMajor", category: "totalArmorPercent", base: 3, conditional: 3, thresholdReference: "IntelligenceSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 142, attributeName: "Hitpoints_Max_Percent_Bonus", attributeParam: -1, formulaReference: "ParagonNodeHPMaxBonus_RareMinor", category: "maximumLifePercent", base: 4, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "678863": {
      name: "Generic_Magic_DamageToVulnerable",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageToVulnerable.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 736, attributeName: "Vulnerable_Health_Damage_Bonus", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusToVulnerable_Magic", category: "vulnerableDamage", base: 6, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "691371": {
      name: "Generic_Magic_DamageReductionFromVulnerable",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_DamageReductionFromVulnerable.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_Magic", category: "totalArmorPercent", base: 1.5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};

export const RELENTLESS_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2439024,
  observedBoardEquipIndex: 6,
  additionalBonusCategories: ["vulnerableDamage", "movementSpeed", "cooldownReduction"],
  thresholds: {
    IntelligenceSide3: {
      snoId: 1015352,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 305,
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    },
    WillPowerSide3: {
      snoId: 1015322,
      requiredAttribute: "Willpower",
      requiredAttributeId: 20,
      requiredValue: 305,
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    },
    IntelligenceSide1: {
      snoId: 1015350,
      requiredAttribute: "Intelligence",
      requiredAttributeId: 19,
      requiredValue: 265,
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    },
    StrengthMain3: {
      snoId: 1015346,
      requiredAttribute: "Strength",
      requiredAttributeId: 18,
      requiredValue: 1345,
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    },
    "Paladin_Strength+Intelligence": {
      snoId: 2504903,
      combination: "all",
      requirements: [
        { requiredAttribute: "Strength", requiredAttributeId: 18, requiredValue: 1155 },
        { requiredAttribute: "Intelligence", requiredAttributeId: 19, requiredValue: 260 }
      ],
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    },
    "Paladin_Strength+Willpower": {
      snoId: 2504901,
      combination: "all",
      requirements: [
        { requiredAttribute: "Strength", requiredAttributeId: 18, requiredValue: 1155 },
        { requiredAttribute: "Willpower", requiredAttributeId: 20, requiredValue: 260 }
      ],
      observedBoardEquipIndex: 6,
      provenance: DIRECT_IN_GAME
    }
  },
  reuseNodeRecords: [
    { sourceBoardSnoId: 2436511, nodeSnoIds: [2127186, 678750] },
    { sourceBoardSnoId: 2438992, nodeSnoIds: [678863] }
  ],
  nodes: {
    "2449810": {
      name: "Paladin_Rare_040",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_040.pgn.json",
      ptBonusAttributeIndices: [1],
      attributes: [
        { attributeIndex: 0, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 237, attributeName: "Power_Cooldown_Reduction_Percent_All", attributeParam: -1, formulaReference: "ParagonNodeCDR_RareMajor", category: "cooldownReduction", base: 2, conditional: 2, thresholdReference: "IntelligenceSide3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449913": {
      name: "Paladin_Rare_041",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_041.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMajor", category: "allResistance", base: 3, conditional: 3, thresholdReference: "WillPowerSide3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 9, attributeName: "Strength_Core", attributeParam: -1, formulaReference: "ParagonNodeCoreStat_RareMinor", category: "coreAttribute", base: 10, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449804": {
      name: "Paladin_Rare_037",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_037.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 237, attributeName: "Power_Cooldown_Reduction_Percent_All", attributeParam: -1, formulaReference: "ParagonNodeCDR_RareMajor", category: "cooldownReduction", base: 2, conditional: 2, thresholdReference: "IntelligenceSide1", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMinor", category: "totalArmorPercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449713": {
      name: "Paladin_Rare_005",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_005.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMajor", category: "totalArmorPercent", base: 3, conditional: 3, thresholdReference: "StrengthMain3", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 79, attributeName: "Resistance_All_Bonus_Percent", attributeParam: -1, formulaReference: "ParagonNodeResistAll_RareMinor", category: "allResistance", base: 3, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449800": {
      name: "Paladin_Rare_035",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_035.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 208, attributeName: "Movement_Bonus_Run_Speed", attributeParam: -1, formulaReference: "ParagonNodeMoveSpeed_RareMajor", category: "movementSpeed", base: 5, conditional: 5, thresholdReference: "Paladin_Strength+Intelligence", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 482, attributeName: "Armor_Percent", attributeParam: -1, formulaReference: "ParagonNodeArmorBonus_RareMinor", category: "totalArmorPercent", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "2449802": {
      name: "Paladin_Rare_036",
      sourcePath: "json/base/meta/ParagonNode/Paladin_Rare_036.pgn.json",
      ptBonusAttributeIndices: [0],
      attributes: [
        { attributeIndex: 0, attributeId: 736, attributeName: "Vulnerable_Health_Damage_Bonus", attributeParam: -1, formulaReference: "ParagonNodeDamageBonusToVulnerable_RareMajor", category: "vulnerableDamage", base: 13, conditional: 13, thresholdReference: "Paladin_Strength+Willpower", provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION },
        { attributeIndex: 1, attributeId: 208, attributeName: "Movement_Bonus_Run_Speed", attributeParam: -1, formulaReference: "ParagonNodeMoveSpeed_RareMajor", category: "movementSpeed", base: 5, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679022": {
      name: "Generic_Magic_CDR",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_CDR.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 237, attributeName: "Power_Cooldown_Reduction_Percent_All", attributeParam: -1, formulaReference: "ParagonNodeCDR_Magic", category: "cooldownReduction", base: 1, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    },
    "679218": {
      name: "Generic_Magic_MoveSpeed",
      sourcePath: "json/base/meta/ParagonNode/Generic_Magic_MoveSpeed.pgn.json",
      ptBonusAttributeIndices: [],
      attributes: [
        { attributeIndex: 0, attributeId: 208, attributeName: "Movement_Bonus_Run_Speed", attributeParam: -1, formulaReference: "ParagonNodeMoveSpeed_Magic", category: "movementSpeed", base: 2, conditional: 0, thresholdReference: null, provenance: DIRECT_IN_GAME, glyphAmplificationApplied: NO_GLYPH_AMPLIFICATION }
      ]
    }
  }
};
