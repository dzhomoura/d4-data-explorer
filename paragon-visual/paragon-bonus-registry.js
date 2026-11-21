const DIRECT_IN_GAME = "direct-in-game";
const NO_GLYPH_AMPLIFICATION = false;

export const PARAGON_BONUS_REGISTRY = {
  sourceRevision: "75e619f0d90a0951945747f45feef59c076a5db0",
  boardSnoId: 2436481,
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
