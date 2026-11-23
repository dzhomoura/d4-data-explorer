import { calculateParagonBonuses } from "./paragon-calculator.js";
import { mergeSharedNodeDefinitions } from "./shared-node-definitions.js";

(() => {
  "use strict";

  const CELL_SIZE = 36;
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.15;
  const LEGACY_BOARD_00_STORAGE_KEY = "d4-paragon-paladin-00-v1";
  const EXTERNAL_ATTRIBUTES_STORAGE_KEY = "d4-paragon-paladin-00-external-attributes-v1";
  const BUILD_SCHEMA_VERSION = 1;
  const BOARD_CONFIGS = Object.freeze({
    board00: Object.freeze({
      label: "Board 00 — Starting Board",
      boardUrl: "../paladin-board-00.json",
      nodeDatabaseUrl: "node-data.json",
      storageKey: LEGACY_BOARD_00_STORAGE_KEY,
      boardEquipIndex: 0,
      requiresEntryGate: false,
      supportsBuildFiles: true,
      calculationScope: "Board 00 uses its board-scoped verified bonus registry and pinned core-stat formulas."
    }),
    board01: Object.freeze({
      label: "Board 01 — Castle",
      boardUrl: "../paladin-board-01.json",
      nodeDatabaseUrl: "node-data-01.json",
      storageKey: "d4-paragon-paladin-01-v1",
      boardEquipIndex: 1,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      calculationScope: "Board 01 includes Castle bonuses and conditional thresholds observed unamplified at equip index 1. Other equip positions and the legendary power remain unresolved."
    }),
    board02: Object.freeze({
      label: "Board 02 — Shield Bearer",
      boardUrl: "../paladin-board-02.json",
      nodeDatabaseUrl: "node-data-02.json",
      storageKey: "d4-paragon-paladin-02-v1",
      boardEquipIndex: 2,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Shield Bearer resolves ordinary node bonuses and all six observed Rare thresholds at equip index 2. The Legendary power remains unresolved."
    }),
    board03: Object.freeze({
      label: "Board 03 — Fervent",
      boardUrl: "../paladin-board-03.json",
      nodeDatabaseUrl: "node-data-03.json",
      storageKey: "d4-paragon-paladin-03-v1",
      boardEquipIndex: 3,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      calculationScope: "Fervent resolves ordinary node bonuses and all six observed Rare thresholds at equip index 3. The Legendary power remains unresolved."
    }),
    board04: Object.freeze({
      label: "Board 04 — Preacher",
      boardUrl: "../paladin-board-04.json",
      nodeDatabaseUrl: "node-data-04.json",
      storageKey: "d4-paragon-paladin-04-v1",
      boardEquipIndex: 4,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Preacher resolves ordinary node bonuses and all six observed Rare thresholds at equip index 4. The Legendary power remains unresolved."
    }),
    board05: Object.freeze({
      label: "Board 05 — Divinity",
      boardUrl: "../paladin-board-05.json",
      nodeDatabaseUrl: "node-data-05.json",
      storageKey: "d4-paragon-paladin-05-v1",
      boardEquipIndex: 5,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Divinity resolves ordinary node bonuses and all six observed Rare thresholds at equip index 5. The Legendary power remains unresolved."
    }),
    board06: Object.freeze({
      label: "Board 06 — Relentless",
      boardUrl: "../paladin-board-06.json",
      nodeDatabaseUrl: "node-data-06.json",
      storageKey: "d4-paragon-paladin-06-v1",
      boardEquipIndex: 6,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Relentless resolves ordinary node bonuses and all six observed Rare thresholds at equip index 6. The Legendary power remains unresolved."
    }),
    board07: Object.freeze({
      label: "Board 07 — Sentencing",
      boardUrl: "../paladin-board-07.json",
      nodeDatabaseUrl: "node-data-07.json",
      storageKey: "d4-paragon-paladin-07-v1",
      boardEquipIndex: 7,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Sentencing resolves ordinary node bonuses and all six observed Rare thresholds at equip index 7. The Legendary power remains unresolved."
    }),
    board08: Object.freeze({
      label: "Board 08 — Endure",
      boardUrl: "../paladin-board-08.json",
      nodeDatabaseUrl: "node-data-08.json",
      storageKey: "d4-paragon-paladin-08-v1",
      boardEquipIndex: 8,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Endure resolves ordinary node bonuses and the observed thresholds for all six Rare cells at equip index 8. The Legendary power remains unresolved."
    }),
    board09: Object.freeze({
      label: "Board 09 — Beacon",
      boardUrl: "../paladin-board-09.json",
      nodeDatabaseUrl: "node-data-09.json",
      storageKey: "d4-paragon-paladin-09-v1",
      boardEquipIndex: 9,
      requiresEntryGate: true,
      supportsBuildFiles: false,
      observedRareThresholds: true,
      calculationScope: "Beacon resolves ordinary node bonuses and all six observed Rare thresholds at equip index 9. The Legendary power remains unresolved."
    })
  });
  const POINT_COSTS = Object.freeze({
    start: 0,
    normal: 1,
    magic: 1,
    rare: 1,
    legendary: 1,
    socket: 1,
    gate: 1,
    default: 1
  });

  const stage = document.getElementById("board-stage");
  const frame = document.getElementById("board-frame");
  const status = document.getElementById("board-status");
  const boardSelector = document.getElementById("board-selector");
  const calculationScopeNote = document.getElementById("calculation-scope-note");
  const allocationMessage = document.getElementById("allocation-message");
  const pointsSpent = document.getElementById("points-spent");
  const allocatedCount = document.getElementById("allocated-count");
  const strengthTotal = document.getElementById("paragon-strength");
  const intelligenceTotal = document.getElementById("paragon-intelligence");
  const willpowerTotal = document.getElementById("paragon-willpower");
  const dexterityTotal = document.getElementById("paragon-dexterity");
  const coreAttributeTotal = document.getElementById("paragon-core-total");
  const unresolvedBonusCount = document.getElementById("unresolved-bonus-count");
  const externalAttributeInputs = {
    Strength: document.getElementById("external-strength"),
    Intelligence: document.getElementById("external-intelligence"),
    Willpower: document.getElementById("external-willpower"),
    Dexterity: document.getElementById("external-dexterity")
  };
  const totalAttributeDisplays = {
    Strength: document.getElementById("total-strength"),
    Intelligence: document.getElementById("total-intelligence"),
    Willpower: document.getElementById("total-willpower"),
    Dexterity: document.getElementById("total-dexterity")
  };
  const externalSaveStatus = document.getElementById("external-save-status");
  const rawBonusDisplays = {
    damage: {
      unconditional: document.getElementById("raw-damage-base"),
      conditional: document.getElementById("raw-damage-conditional"),
      total: document.getElementById("raw-damage-total")
    },
    damageToElites: {
      unconditional: document.getElementById("raw-elites-base"),
      conditional: document.getElementById("raw-elites-conditional"),
      total: document.getElementById("raw-elites-total")
    },
    physicalDamage: {
      unconditional: document.getElementById("raw-physical-base"),
      conditional: document.getElementById("raw-physical-conditional"),
      total: document.getElementById("raw-physical-total")
    },
    holyDamage: {
      panel: document.getElementById("raw-holy-damage-panel"),
      unconditional: document.getElementById("raw-holy-damage-base"),
      conditional: document.getElementById("raw-holy-damage-conditional"),
      total: document.getElementById("raw-holy-damage-total")
    },
    judgementDamage: {
      panel: document.getElementById("raw-judgement-damage-panel"),
      unconditional: document.getElementById("raw-judgement-damage-base"),
      conditional: document.getElementById("raw-judgement-damage-conditional"),
      total: document.getElementById("raw-judgement-damage-total")
    },
    luckyHitChance: {
      panel: document.getElementById("raw-lucky-hit-panel"),
      unconditional: document.getElementById("raw-lucky-hit-base"),
      conditional: document.getElementById("raw-lucky-hit-conditional"),
      total: document.getElementById("raw-lucky-hit-total")
    },
    damageToCrowdControlled: {
      unconditional: document.getElementById("raw-cc-base"),
      conditional: document.getElementById("raw-cc-conditional"),
      total: document.getElementById("raw-cc-total")
    },
    maximumLifePercent: {
      unconditional: document.getElementById("raw-life-base"),
      conditional: document.getElementById("raw-life-conditional"),
      total: document.getElementById("raw-life-total")
    },
    lifePer5Seconds: {
      panel: document.getElementById("raw-life-per-5-seconds-panel"),
      unconditional: document.getElementById("raw-life-per-5-seconds-base"),
      conditional: document.getElementById("raw-life-per-5-seconds-conditional"),
      total: document.getElementById("raw-life-per-5-seconds-total")
    },
    totalArmorPercent: {
      unconditional: document.getElementById("raw-armor-base"),
      conditional: document.getElementById("raw-armor-conditional"),
      total: document.getElementById("raw-armor-total")
    },
    allResistance: {
      unconditional: document.getElementById("raw-resistance-base"),
      conditional: document.getElementById("raw-resistance-conditional"),
      total: document.getElementById("raw-resistance-total")
    },
    blockChance: {
      unconditional: document.getElementById("raw-block-base"),
      conditional: document.getElementById("raw-block-conditional"),
      total: document.getElementById("raw-block-total")
    },
    blockedDamageReduction: {
      unconditional: document.getElementById("raw-block-damage-base"),
      conditional: document.getElementById("raw-block-damage-conditional"),
      total: document.getElementById("raw-block-damage-total")
    },
    thorns: {
      unconditional: document.getElementById("raw-thorns-base"),
      conditional: document.getElementById("raw-thorns-conditional"),
      total: document.getElementById("raw-thorns-total")
    },
    criticalStrikeDamage: {
      panel: document.getElementById("raw-critical-damage-panel"),
      unconditional: document.getElementById("raw-critical-damage-base"),
      conditional: document.getElementById("raw-critical-damage-conditional"),
      total: document.getElementById("raw-critical-damage-total")
    },
    maximumFaith: {
      panel: document.getElementById("raw-faith-panel"),
      unconditional: document.getElementById("raw-faith-base"),
      conditional: document.getElementById("raw-faith-conditional"),
      total: document.getElementById("raw-faith-total")
    },
    attackSpeed: {
      panel: document.getElementById("raw-attack-speed-panel"),
      unconditional: document.getElementById("raw-attack-speed-base"),
      conditional: document.getElementById("raw-attack-speed-conditional"),
      total: document.getElementById("raw-attack-speed-total")
    },
    fortifyGeneration: {
      panel: document.getElementById("raw-fortify-panel"),
      unconditional: document.getElementById("raw-fortify-base"),
      conditional: document.getElementById("raw-fortify-conditional"),
      total: document.getElementById("raw-fortify-total")
    },
    healingReceived: {
      panel: document.getElementById("raw-healing-panel"),
      unconditional: document.getElementById("raw-healing-base"),
      conditional: document.getElementById("raw-healing-conditional"),
      total: document.getElementById("raw-healing-total")
    },
    damageWhileFortified: {
      panel: document.getElementById("raw-damage-fortified-panel"),
      unconditional: document.getElementById("raw-damage-fortified-base"),
      conditional: document.getElementById("raw-damage-fortified-conditional"),
      total: document.getElementById("raw-damage-fortified-total")
    },
    damageWhileHealthy: {
      panel: document.getElementById("raw-damage-healthy-panel"),
      unconditional: document.getElementById("raw-damage-healthy-base"),
      conditional: document.getElementById("raw-damage-healthy-conditional"),
      total: document.getElementById("raw-damage-healthy-total")
    },
    vulnerableDamage: {
      panel: document.getElementById("raw-vulnerable-panel"),
      unconditional: document.getElementById("raw-vulnerable-base"),
      conditional: document.getElementById("raw-vulnerable-conditional"),
      total: document.getElementById("raw-vulnerable-total")
    },
    cooldownReduction: {
      panel: document.getElementById("raw-cooldown-panel"),
      unconditional: document.getElementById("raw-cooldown-base"),
      conditional: document.getElementById("raw-cooldown-conditional"),
      total: document.getElementById("raw-cooldown-total")
    },
    movementSpeed: {
      panel: document.getElementById("raw-movement-speed-panel"),
      unconditional: document.getElementById("raw-movement-speed-base"),
      conditional: document.getElementById("raw-movement-speed-conditional"),
      total: document.getElementById("raw-movement-speed-total")
    }
  };
  const statsSidebarList = document.getElementById("stats-sidebar-list");
  const statsSidebarEmpty = document.getElementById("stats-sidebar-empty");
  const saveStatus = document.getElementById("save-status");
  const allocationResetButton = document.getElementById("allocation-reset");
  const exportBuildButton = document.getElementById("export-build");
  const importBuildButton = document.getElementById("import-build");
  const buildFileInput = document.getElementById("build-file");
  const zoomInButton = document.getElementById("zoom-in");
  const zoomOutButton = document.getElementById("zoom-out");
  const resetButton = document.getElementById("zoom-reset");
  const tooltip = document.getElementById("node-tooltip");
  const EXPECTED_SOURCE_COMMIT = "75e619f0d90a0951945747f45feef59c076a5db0";
  const ATTRIBUTE_LABELS = {
    Strength_Core: "Strength",
    Intelligence_Core: "Intelligence",
    Willpower_Core: "Willpower",
    Dexterity_Core: "Dexterity",
    Armor_Percent: "Total Armor",
    Armor_Bonus: "Armor",
    Hitpoints_Max_Percent_Bonus: "Maximum Life",
    Damage_Percent_All_From_Skills: "Damage from Skills",
    Damage_Percent_Bonus_Vs_Elites: "Damage to Elites",
    Damage_Type_Percent_Bonus: "Physical Damage",
    Damage_Percent_Bonus_Vs_CC_All: "Damage to Crowd Controlled",
    Resistance_All_Bonus_Percent: "Resistance to All Elements",
    Block_Chance: "Block Chance",
    Block_Damage_Percent_Bonus: "Blocked Damage Reduction",
    Thorns_Flat: "Thorns",
    Crit_Damage_Percent: "Critical Strike Damage",
    Resource_Max_Bonus: "Maximum Faith",
    Attack_Speed_Percent_Bonus: "Attack Speed",
    Fortified_Health_Application_Bonus: "Fortify Generation",
    Bonus_Healing_Received_Percent: "Healing Received",
    No_Damage_Taken_Flat_Hitpoints_Regen_Per_Second: "Life per 5 Seconds after taking no damage",
    Damage_Percent_Bonus_When_Fortified: "Damage while Fortified",
    Damage_Bonus_At_High_Health: "Damage while Healthy",
    Vulnerable_Health_Damage_Bonus: "Vulnerable Damage",
    Power_Cooldown_Reduction_Percent_All: "Cooldown Reduction",
    Movement_Bonus_Run_Speed: "Movement Speed"
  };
  const CORE_ATTRIBUTE_NAMES = Object.freeze({
    Strength_Core: "Strength",
    Intelligence_Core: "Intelligence",
    Willpower_Core: "Willpower",
    Dexterity_Core: "Dexterity"
  });
  const RAW_BONUS_LABELS = Object.freeze({
    damage: "Damage",
    damageToElites: "Damage to Elites",
    physicalDamage: "Physical Damage",
    holyDamage: "Holy Damage",
    judgementDamage: "Judgement Damage",
    luckyHitChance: "Lucky Hit Chance",
    damageToCrowdControlled: "Damage to Crowd Controlled",
    maximumLifePercent: "Maximum Life",
    lifePer5Seconds: "Life per 5 Seconds",
    totalArmorPercent: "Total Armor",
    allResistance: "Resistance to All Elements",
    blockChance: "Block Chance",
    blockedDamageReduction: "Blocked Damage Reduction",
    thorns: "Thorns",
    criticalStrikeDamage: "Critical Strike Damage",
    maximumFaith: "Maximum Faith",
    attackSpeed: "Attack Speed",
    fortifyGeneration: "Fortify Generation",
    healingReceived: "Healing Received",
    damageWhileFortified: "Damage while Fortified",
    damageWhileHealthy: "Damage while Healthy",
    vulnerableDamage: "Vulnerable Damage",
    cooldownReduction: "Cooldown Reduction",
    movementSpeed: "Movement Speed"
  });
  const FLAT_BONUS_CATEGORIES = new Set(["thorns", "maximumFaith", "lifePer5Seconds"]);
  const KIND_LABELS = {
    normal: "Normal",
    magic: "Magic",
    rare: "Rare",
    legendary: "Legendary",
    socket: "Glyph socket",
    gate: "Gate",
    start: "Starting node",
    unknown: "Node"
  };

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let drag = null;
  let boardSize = 0;
  let activeTooltipMarker = null;
  let boardNodes = new Map();
  let allocationGraph = new Map();
  let allocatedNodeIds = new Set();
  let allocationRootId = null;
  let allocatedConnectionLayer = null;
  let boardIdentity = null;
  let currentBoardDefinition = null;
  let currentNodeDatabase = null;
  let externalAttributes = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
  let currentCalculation = null;
  let statContributors = new Map();
  let currentBoardKey = "board00";
  let currentBoardConfig = BOARD_CONFIGS.board00;
  const boardResources = new Map();
  const allocationsByBoard = new Map();

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("board-status--error", Boolean(isError));
  }

  function setAllocationMessage(message, isError) {
    allocationMessage.textContent = message;
    allocationMessage.classList.toggle("allocation-message--error", Boolean(isError));
  }

  function setSaveStatus(message, state) {
    saveStatus.textContent = message;
    saveStatus.classList.toggle("save-status--saved", state === "saved");
    saveStatus.classList.toggle("save-status--error", state === "error");
    saveStatus.classList.toggle("save-status--unsaved", state === "unsaved");
  }

  function setExternalSaveStatus(message, isError) {
    externalSaveStatus.textContent = message;
    externalSaveStatus.classList.toggle("external-save-status--error", Boolean(isError));
  }

  function addText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function attributeLabel(name) {
    return ATTRIBUTE_LABELS[name] || name.replace(/_/g, " ");
  }

  function formatBonusValue(value, category) {
    const sign = value > 0 ? "+" : "";
    if (category === "coreAttribute" || FLAT_BONUS_CATEGORIES.has(category)) return `${sign}${value}`;
    return `${sign}${Number.isInteger(value) ? value : Number(value.toFixed(2))}%`;
  }

  function getThresholdEvaluation(nodeEvaluation, thresholdName) {
    return nodeEvaluation?.thresholds.find((threshold) => threshold.thresholdReference === thresholdName) || null;
  }

  function buildTooltip(definition, nodeIndex) {
    const nodeEvaluation = currentCalculation?.nodeEvaluations.find((node) => node.nodeIndex === nodeIndex) || null;
    tooltip.replaceChildren();

    const header = document.createElement("header");
    header.className = "tooltip-header";
    addText(header, "h2", "tooltip-title", definition.name);
    addText(header, "span", `tooltip-kind tooltip-kind--${definition.kind}`, KIND_LABELS[definition.kind] || "Node");
    tooltip.appendChild(header);

    if (nodeEvaluation?.displayName) {
      addText(tooltip, "p", "tooltip-display-name", nodeEvaluation.displayName);
    }
    addText(
      tooltip,
      "p",
      "tooltip-meta",
      `SNO ${definition.snoId} · Rarity override ${definition.rarityOverride ?? "unknown"}`
    );

    if (definition.attributes.length === 0) {
      addText(tooltip, "p", "tooltip-empty", "No bonus attributes are defined for this node.");
    } else {
      const attributes = document.createElement("section");
      attributes.className = "tooltip-attributes";
      addText(attributes, "h3", "tooltip-section-title", "Attributes");

      for (let attributeIndex = 0; attributeIndex < definition.attributes.length; attributeIndex += 1) {
        const attribute = definition.attributes[attributeIndex];
        const calculation = nodeEvaluation?.attributes[attributeIndex];
        const row = document.createElement("article");
        row.className = "tooltip-attribute";
        addText(row, "p", "tooltip-attribute-name", attributeLabel(attribute.name));
        addText(row, "code", "tooltip-attribute-source", attribute.name);

        if (calculation && !calculation.unresolved && calculation.unconditional !== null) {
          const valueLabel = calculation.category === "coreAttribute"
            ? attributeLabel(attribute.name)
            : RAW_BONUS_LABELS[calculation.category];
          const basePrefix = calculation.provenance === "verified-game-formula"
            ? "Verified bonus"
            : calculation.threshold ? "Base bonus" : "Raw bonus";
          addText(
            row,
            "p",
            "tooltip-bonus tooltip-bonus--verified",
            `${basePrefix}: ${formatBonusValue(calculation.unconditional, calculation.category)} ${valueLabel}`
          );
          if (calculation.conditional === null) {
            addText(row, "p", "tooltip-bonus tooltip-bonus--unresolved", calculation.threshold.reason);
          } else if (calculation.conditional > 0) {
            addText(
              row,
              "p",
              "tooltip-bonus tooltip-bonus--conditional",
              `Additional threshold bonus: ${formatBonusValue(calculation.conditional, calculation.category)} ${valueLabel}`
            );
            const threshold = calculation.threshold;
            if (threshold?.resolved) {
              const requirementProgress = threshold.requirements
                ? threshold.requirements.map((requirement) => `${requirement.requiredAttribute} ${requirement.currentValue} / ${requirement.requiredValue}`).join("; ")
                : `${threshold.requiredAttribute} ${threshold.currentValue} / ${threshold.requiredValue}`;
              const thresholdText = `${requirementProgress} · ${threshold.satisfied ? "satisfied" : "not satisfied"}`;
              addText(row, "p", `tooltip-threshold-progress${threshold.satisfied ? " tooltip-threshold-progress--met" : ""}`, thresholdText);
              if (!nodeEvaluation.allocated && threshold.satisfied) {
                addText(row, "p", "tooltip-formula-note", "Threshold met; bonus applies when this node is allocated.");
              } else if (nodeEvaluation.allocated) {
                addText(row, "p", "tooltip-formula-note", threshold.satisfied ? "Conditional bonus is active." : "Conditional bonus is inactive.");
              }
            } else {
              addText(row, "p", "tooltip-bonus tooltip-bonus--unresolved", `Threshold unresolved: ${threshold?.reason || "no verified requirement"}`);
            }
          }
          if (calculation.provenance) {
            const evidenceLabel = calculation.provenance === "verified-game-formula"
              ? "Verified from pinned game formula"
              : calculation.provenance === "direct-in-game"
                ? "Direct in-game observation"
                : calculation.provenance === "unamplified-planner"
                  ? "Unamplified planner observation"
                  : calculation.provenance === "formula-derived"
                    ? "Pinned formula derived from observed shared multiplier"
                    : "Unspecified evidence source";
            addText(row, "p", "tooltip-evidence", `${evidenceLabel}; glyph amplification is not applied here.`);
          }
        } else if (attribute.verifiedBonus !== null) {
          const value = Number(attribute.verifiedBonus);
          const sign = value > 0 ? "+" : "";
          addText(row, "p", "tooltip-bonus tooltip-bonus--verified", `Verified bonus: ${sign}${value} ${attributeLabel(attribute.name)}`);
        } else if (attribute.formulaReference && attribute.formulaValue !== null) {
          addText(row, "p", "tooltip-bonus tooltip-bonus--unresolved", `Formula constant: ${attribute.formulaValue}`);
          addText(row, "p", "tooltip-formula-note", "Effective node bonus unresolved; this attribute also has a separate node literal.");
        } else {
          addText(row, "p", "tooltip-bonus tooltip-bonus--unresolved", "Bonus value unresolved");
        }

        if (attribute.formulaReference) {
          addText(row, "p", "tooltip-formula", `Formula: ${attribute.formulaReference}`);
        }
        if (attribute.literalFormula !== null && attribute.literalFormula !== "") {
          addText(row, "p", "tooltip-formula-note", `Node literal: ${attribute.literalFormula} (not treated as a final bonus)`);
        }
        attributes.appendChild(row);
      }

      tooltip.appendChild(attributes);
    }

    if (definition.thresholdReferences.length > 0) {
      const thresholds = document.createElement("section");
      thresholds.className = "tooltip-thresholds";
      addText(thresholds, "h3", "tooltip-section-title", "Thresholds");
      const list = document.createElement("ul");
      for (const threshold of definition.thresholdReferences) {
        const evaluation = getThresholdEvaluation(nodeEvaluation, threshold.name);
        const unresolvedFormula = evaluation?.formula
          || evaluation?.requirements?.map((requirement) => `${requirement.requiredAttribute}: ${requirement.formula}`).join("; ")
          || null;
        const label = evaluation?.resolved
          ? evaluation.requirements
            ? `${threshold.name}: ${evaluation.requirements.map((requirement) => `${requirement.requiredAttribute} ${requirement.currentValue}/${requirement.requiredValue}`).join("; ")} · ${evaluation.satisfied ? "met" : "not met"}`
            : `${threshold.name}: ${evaluation.requiredAttribute} ${evaluation.currentValue}/${evaluation.requiredValue} · ${evaluation.satisfied ? "met" : "not met"}`
          : evaluation || currentBoardConfig.unverifiedRareThresholds
            ? `${threshold.name}: unresolved${unresolvedFormula ? ` · ${unresolvedFormula}` : ""}`
            : `${threshold.name}: not evaluated`;
        const className = evaluation?.resolved
          ? `tooltip-threshold${evaluation.satisfied ? " tooltip-threshold--met" : ""}`
          : "tooltip-threshold tooltip-threshold--unresolved";
        addText(list, "li", className, label);
      }
      thresholds.appendChild(list);
      const thresholdNote = currentBoardConfig.unverifiedRareThresholds
        ? "This board’s Rare conditional amounts and requirements remain unverified."
        : currentBoardConfig.observedRareThresholds
          ? `Rare thresholds use total attributes and the observed equip-index-${currentBoardConfig.boardEquipIndex} requirements.`
          : currentBoardKey === "board00"
            ? "Only the in-game verified starting-board requirement is evaluated."
            : currentBoardKey === "board03"
              ? "Fervent thresholds use total attributes and the observed equip-index-3 requirements."
              : "Castle thresholds are evaluated only for the observed equip-index-1 context.";
      addText(
        thresholds,
        "p",
        "tooltip-formula-note",
        thresholdNote
      );
      tooltip.appendChild(thresholds);
    }

    if (definition.passivePower) {
      addText(tooltip, "p", "tooltip-trait", `Legendary power: ${definition.passivePower.name} (effect unresolved)`);
    }
    if (definition.hasSocket) addText(tooltip, "p", "tooltip-trait", "Glyph socket");
    if (definition.isGate) addText(tooltip, "p", "tooltip-trait", "Board gate");
  }

  function positionTooltip(marker) {
    const markerRect = marker.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 10;
    let left = markerRect.left - stageRect.left + markerRect.width / 2 - tooltipRect.width / 2;
    let top = markerRect.top - stageRect.top - tooltipRect.height - margin;

    left = Math.max(margin, Math.min(left, stage.clientWidth - tooltipRect.width - margin));
    if (top < margin) top = markerRect.bottom - stageRect.top + margin;
    top = Math.max(margin, Math.min(top, stage.clientHeight - tooltipRect.height - margin));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(marker, definition) {
    activeTooltipMarker = marker;
    buildTooltip(definition, Number(marker.dataset.nodeIndex));
    tooltip.hidden = false;
    tooltip.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => positionTooltip(marker));
  }

  function hideTooltip(marker) {
    if (marker && activeTooltipMarker !== marker) return;
    activeTooltipMarker = null;
    tooltip.hidden = true;
    tooltip.setAttribute("aria-hidden", "true");
  }

  function applyTransform() {
    frame.style.transform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`;
    if (activeTooltipMarker) {
      requestAnimationFrame(() => {
        if (activeTooltipMarker) positionTooltip(activeTooltipMarker);
      });
    }
  }

  function setZoom(nextZoom) {
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    applyTransform();
  }

  function renderBoard(boardKey, board, database) {
    const config = BOARD_CONFIGS[boardKey];
    if (!config) throw new Error(`Unknown board key: ${boardKey}.`);
    const width = Number(board.nWidth);
    if (!Number.isInteger(width) || width < 1 || !Array.isArray(board.arEntries) || board.arEntries.length < width * width) {
      throw new Error("Board data must include a valid nWidth and a complete arEntries grid.");
    }
    if (database.source?.commit !== EXPECTED_SOURCE_COMMIT || !Array.isArray(database.nodes)) {
      throw new Error("Node database is missing or does not match the verified DiabloTools revision.");
    }

    const nodeDefinitions = new Map(database.nodes.map((definition) => [definition.name, definition]));
    if (nodeDefinitions.size !== database.nodes.length) {
      throw new Error("Node database contains duplicate definitions.");
    }
    if (database.source.boardSnoId !== board.__snoID__) {
      throw new Error("Node database does not match this Paragon board.");
    }
    const referencedNames = new Set();
    const nextBoardNodes = new Map();
    for (const entry of board.arEntries.slice(0, width * width)) {
      if (!entry) continue;
      if (!entry.name || !nodeDefinitions.has(entry.name)) {
        throw new Error(`Node definition missing for ${entry.name || entry.__targetFileName__}.`);
      }
      const definition = nodeDefinitions.get(entry.name);
      if (definition.snoId !== entry.__raw__) {
        throw new Error(`SNO ID mismatch for ${entry.name}: board=${entry.__raw__}, database=${definition.snoId}.`);
      }
      referencedNames.add(entry.name);
    }
    if (referencedNames.size !== nodeDefinitions.size) {
      throw new Error(`Board references ${referencedNames.size} unique nodes but database contains ${nodeDefinitions.size}.`);
    }

    for (let index = 0; index < width * width; index += 1) {
      const entry = board.arEntries[index];
      if (!entry) continue;
      const definition = nodeDefinitions.get(entry.name);
      nextBoardNodes.set(index, {
        id: index,
        x: index % width,
        y: Math.floor(index / width),
        definition,
        marker: null
      });
    }

    const startingNodes = [...nextBoardNodes.values()].filter((node) => node.definition.kind === "start");
    const gateNodes = [...nextBoardNodes.values()].filter((node) => node.definition.kind === "gate");
    if (config.requiresEntryGate) {
      if (startingNodes.length !== 0 || gateNodes.length === 0) {
        throw new Error(`Additional board must have no starting node and at least one gate; found ${startingNodes.length} starting nodes and ${gateNodes.length} gates.`);
      }
    } else if (startingNodes.length !== 1) {
      throw new Error(`Expected exactly one starting node; found ${startingNodes.length}.`);
    }
    const nextGraph = new Map();
    for (const node of nextBoardNodes.values()) {
      const neighbors = [];
      if (node.x > 0 && nextBoardNodes.has(node.id - 1)) neighbors.push(node.id - 1);
      if (node.x + 1 < width && nextBoardNodes.has(node.id + 1)) neighbors.push(node.id + 1);
      if (node.y > 0 && nextBoardNodes.has(node.id - width)) neighbors.push(node.id - width);
      if (node.y + 1 < width && nextBoardNodes.has(node.id + width)) neighbors.push(node.id + width);
      nextGraph.set(node.id, neighbors);
    }

    boardNodes = nextBoardNodes;
    allocationGraph = nextGraph;
    currentBoardKey = boardKey;
    currentBoardConfig = config;
    allocationRootId = config.requiresEntryGate ? null : startingNodes[0].id;
    allocatedNodeIds = allocationRootId === null ? new Set() : new Set([allocationRootId]);
    boardIdentity = {
      identifier: board.__fileName__,
      snoId: board.__snoID__,
      sourceRevision: database.source.commit
    };
    currentBoardDefinition = board;
    currentNodeDatabase = database;
    calculationScopeNote.textContent = config.calculationScope;
    exportBuildButton.disabled = !config.supportsBuildFiles;
    importBuildButton.disabled = !config.supportsBuildFiles;
    const buildActionTitle = config.supportsBuildFiles
      ? ""
      : "Multi-board import/export is deferred to preserve the Board 00 schema.";
    exportBuildButton.title = buildActionTitle;
    importBuildButton.title = buildActionTitle;

    boardSize = width * CELL_SIZE;
    const grid = document.createElement("div");
    grid.className = "board-grid";
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-label", `Paragon board, ${width} by ${width}`);
    grid.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;

    const connections = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connections.classList.add("board-connections");
    connections.setAttribute("width", String(boardSize));
    connections.setAttribute("height", String(boardSize));
    connections.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
    connections.setAttribute("aria-hidden", "true");

    const allocatedConnections = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    allocatedConnections.classList.add("board-connections", "board-connections--allocated");
    allocatedConnections.setAttribute("width", String(boardSize));
    allocatedConnections.setAttribute("height", String(boardSize));
    allocatedConnections.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
    allocatedConnections.setAttribute("aria-hidden", "true");
    allocatedConnectionLayer = allocatedConnections;

    const entries = board.arEntries;
    for (let index = 0; index < width * width; index += 1) {
      const node = entries[index];
      const cell = document.createElement("div");
      cell.className = "board-cell";
      cell.setAttribute("role", "gridcell");

      if (node && typeof node.name === "string") {
        const x = index % width;
        const y = Math.floor(index / width);
        const definition = nodeDefinitions.get(node.name);
        const marker = document.createElement("span");
        marker.className = `node node--${definition.kind}`;
        marker.dataset.nodeIndex = String(index);
        marker.dataset.nodeName = node.name;
        marker.setAttribute("role", "button");
        marker.setAttribute("aria-label", `${node.name}, ${KIND_LABELS[definition.kind] || "node"}`);
        marker.setAttribute("aria-describedby", tooltip.id);
        marker.setAttribute("aria-pressed", "false");
        marker.tabIndex = 0;
        boardNodes.get(index).marker = marker;
        cell.setAttribute("aria-label", node.name);
        marker.addEventListener("click", (event) => {
          event.stopPropagation();
          if (event.button !== 0) return;
          allocateNode(index);
        });
        marker.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          event.stopPropagation();
          refundNode(index);
        });
        marker.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          allocateNode(index);
        });
        marker.addEventListener("pointerenter", () => showTooltip(marker, definition));
        marker.addEventListener("pointerleave", () => {
          if (document.activeElement !== marker) hideTooltip(marker);
        });
        marker.addEventListener("focus", () => showTooltip(marker, definition));
        marker.addEventListener("blur", () => {
          if (!marker.matches(":hover")) hideTooltip(marker);
        });

        if (x + 1 < width && nextGraph.get(index).includes(index + 1)) {
          addConnection(connections, x, y, x + 1, y);
        }
        if (y + 1 < width && nextGraph.get(index).includes(index + width)) {
          addConnection(connections, x, y, x, y + 1);
        }
        cell.appendChild(marker);
      } else {
        cell.setAttribute("aria-label", "Empty");
      }

      grid.appendChild(cell);
    }

    grid.prepend(allocatedConnections);
    grid.prepend(connections);
    frame.replaceChildren(grid);
    setStatus(`${config.label} · ${width} × ${width} · ${entries.slice(0, width * width).filter(Boolean).length} occupied nodes · ${nodeDefinitions.size} definitions`);
    updateAllocationDisplay();
    restoreSavedAllocation();

    const availableWidth = Math.max(100, stage.clientWidth - 48);
    const availableHeight = Math.max(100, stage.clientHeight - 48);
    zoom = Math.min(1, availableWidth / boardSize, availableHeight / boardSize);
    applyTransform();
  }

  function addConnection(svg, x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(x1 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("y1", String(y1 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("x2", String(x2 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("y2", String(y2 * CELL_SIZE + CELL_SIZE / 2));
    svg.appendChild(line);
  }

  function getEligibleNodeIds() {
    const eligible = new Set();
    for (const id of allocatedNodeIds) {
      for (const neighborId of allocationGraph.get(id) || []) {
        if (!allocatedNodeIds.has(neighborId)) eligible.add(neighborId);
      }
    }
    return eligible;
  }

  function getReachableAllocatedNodeIds(allocatedIds, rootId = allocationRootId) {
    if (rootId === null || !allocatedIds.has(rootId)) return new Set();
    const reachable = new Set([rootId]);
    const pending = [rootId];
    for (let cursor = 0; cursor < pending.length; cursor += 1) {
      const currentId = pending[cursor];
      for (const neighborId of allocationGraph.get(currentId) || []) {
        if (allocatedIds.has(neighborId) && !reachable.has(neighborId)) {
          reachable.add(neighborId);
          pending.push(neighborId);
        }
      }
    }
    return reachable;
  }

  function validateAllocatedNodeIndices(indices, rootId = allocationRootId) {
    if (!Array.isArray(indices)) {
      throw new Error("Allocated node indices must be an array.");
    }

    const validated = new Set();
    for (const id of indices) {
      if (!Number.isInteger(id) || !boardNodes.has(id)) {
        throw new Error(`Node index ${String(id)} does not exist on this board.`);
      }
      if (validated.has(id)) {
        throw new Error(`Node index ${id} is duplicated.`);
      }
      validated.add(id);
    }
    if (rootId === null) {
      if (validated.size !== 0) throw new Error("An entry gate is required before allocating this board.");
      return validated;
    }
    if (!validated.has(rootId)) {
      throw new Error(currentBoardConfig.requiresEntryGate
        ? "The allocation does not include its entry gate."
        : "The allocation does not include the starting node.");
    }

    const reachable = getReachableAllocatedNodeIds(validated, rootId);
    if (reachable.size !== validated.size) {
      throw new Error("The allocation contains nodes disconnected from the starting node.");
    }
    return validated;
  }

  function restoreSavedAllocation() {
    const memoryAllocation = allocationsByBoard.get(currentBoardKey);
    if (memoryAllocation) {
      try {
        allocationRootId = memoryAllocation.rootId;
        allocatedNodeIds = validateAllocatedNodeIndices(memoryAllocation.indices, allocationRootId);
        updateAllocationDisplay();
        setSaveStatus("Saved locally", "saved");
        setAllocationMessage(currentBoardConfig.requiresEntryGate
          ? "Restored this board's independent allocation."
          : "Restored saved allocation.");
        return;
      } catch (error) {
        allocationsByBoard.delete(currentBoardKey);
      }
    }

    let serialized;
    try {
      serialized = window.localStorage.getItem(currentBoardConfig.storageKey);
    } catch (error) {
      setSaveStatus("Storage unavailable", "error");
      setAllocationMessage(`Could not read saved allocation: ${error.message}`, true);
      return;
    }

    if (serialized === null) {
      setSaveStatus("Not saved yet", "unsaved");
      setAllocationMessage(currentBoardConfig.requiresEntryGate
        ? "Choose a gate as this board's local entry anchor. Board attachment and rotation are not modeled."
        : "Starting node is active.");
      allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices: [...allocatedNodeIds] });
      return;
    }

    let restored;
    try {
      const parsed = JSON.parse(serialized);
      if (currentBoardConfig.requiresEntryGate) {
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
          || !Array.isArray(parsed.allocatedNodeIndices)) {
          throw new Error("Additional-board save must include an entry gate and allocated node indices.");
        }
        if (parsed.entryNodeIndex === null && parsed.allocatedNodeIndices.length === 0) {
          allocationRootId = null;
        } else {
          const entryNode = boardNodes.get(parsed.entryNodeIndex);
          if (!Number.isInteger(parsed.entryNodeIndex) || !entryNode || entryNode.definition.kind !== "gate") {
            throw new Error("Saved entry node is not a gate on this board.");
          }
          allocationRootId = parsed.entryNodeIndex;
        }
        restored = validateAllocatedNodeIndices(parsed.allocatedNodeIndices, allocationRootId);
      } else {
        restored = validateAllocatedNodeIndices(parsed, allocationRootId);
      }
    } catch (error) {
      allocationRootId = currentBoardConfig.requiresEntryGate ? null : allocationRootId;
      allocatedNodeIds = allocationRootId === null ? new Set() : new Set([allocationRootId]);
      updateAllocationDisplay();
      setSaveStatus("Invalid save rejected", "error");
      setAllocationMessage(`Saved allocation rejected; starting node only. ${error.message}`, true);
      return;
    }

    allocatedNodeIds = restored;
    allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices: [...allocatedNodeIds] });
    updateAllocationDisplay();
    setSaveStatus("Saved locally", "saved");
    setAllocationMessage("Restored saved allocation.");
  }

  function saveAllocation() {
    const indices = [...allocatedNodeIds].sort((a, b) => a - b);
    allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices });
    const persistedValue = currentBoardConfig.requiresEntryGate
      ? { entryNodeIndex: allocationRootId, allocatedNodeIndices: indices }
      : indices;
    try {
      window.localStorage.setItem(currentBoardConfig.storageKey, JSON.stringify(persistedValue));
    } catch (error) {
      setSaveStatus("Save failed", "error");
      setAllocationMessage(`Allocation changed, but could not be saved: ${error.message}`, true);
      return false;
    }
    setSaveStatus("Saved locally", "saved");
    return true;
  }

  function validateExternalAttributes(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Saved external attributes must be an object.");
    }
    const validated = {};
    for (const name of Object.keys(externalAttributeInputs)) {
      const amount = value[name];
      if (!Number.isSafeInteger(amount) || amount < 0) {
        throw new Error(`${name} must be a non-negative whole number.`);
      }
      validated[name] = amount;
    }
    return validated;
  }

  function renderExternalAttributeInputs() {
    for (const [name, input] of Object.entries(externalAttributeInputs)) {
      input.value = String(externalAttributes[name]);
      input.setAttribute("aria-invalid", "false");
    }
  }

  function restoreExternalAttributes() {
    let serialized;
    try {
      serialized = window.localStorage.getItem(EXTERNAL_ATTRIBUTES_STORAGE_KEY);
    } catch (error) {
      renderExternalAttributeInputs();
      setExternalSaveStatus(`Local storage unavailable: ${error.message}`, true);
      return;
    }

    if (serialized === null) {
      renderExternalAttributeInputs();
      setExternalSaveStatus("Using default external attributes; changes will be saved locally.");
      return;
    }

    try {
      externalAttributes = validateExternalAttributes(JSON.parse(serialized));
      renderExternalAttributeInputs();
      setExternalSaveStatus("External attributes restored from local storage.");
    } catch (error) {
      externalAttributes = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
      renderExternalAttributeInputs();
      setExternalSaveStatus(`Invalid saved external attributes rejected: ${error.message}`, true);
    }
  }

  function saveExternalAttributes() {
    try {
      window.localStorage.setItem(EXTERNAL_ATTRIBUTES_STORAGE_KEY, JSON.stringify(externalAttributes));
    } catch (error) {
      setExternalSaveStatus(`External attributes changed but could not be saved: ${error.message}`, true);
      return false;
    }
    setExternalSaveStatus("External attributes saved locally.");
    return true;
  }

  function updateExternalAttributesFromInputs() {
    const nextAttributes = {};
    let invalidInput = false;
    for (const [name, input] of Object.entries(externalAttributeInputs)) {
      const amount = input.valueAsNumber;
      const isValid = Number.isSafeInteger(amount) && amount >= 0;
      input.setAttribute("aria-invalid", String(!isValid));
      if (!isValid) {
        invalidInput = true;
      } else {
        nextAttributes[name] = amount;
      }
    }

    if (invalidInput) {
      setExternalSaveStatus("Enter a non-negative whole number for each external attribute.", true);
      return;
    }

    externalAttributes = nextAttributes;
    updateParagonCalculation();
    saveExternalAttributes();
  }

  function validateImportedBuild(build) {
    if (!currentBoardConfig.supportsBuildFiles) {
      throw new Error("Multi-board import is deferred; Board 00 schema version 1 remains unchanged.");
    }
    if (!build || typeof build !== "object" || Array.isArray(build)) {
      throw new Error("Build must be a JSON object.");
    }
    if (build.schemaVersion !== BUILD_SCHEMA_VERSION) {
      throw new Error(`Unsupported build schema version: ${String(build.schemaVersion)}.`);
    }
    if (build.boardIdentifier !== boardIdentity.identifier || build.boardSnoId !== boardIdentity.snoId) {
      throw new Error("Build belongs to a different Paragon board.");
    }
    if (build.sourceRevision !== boardIdentity.sourceRevision) {
      throw new Error("Build uses a different source revision.");
    }
    if (typeof build.exportedAt !== "string" || Number.isNaN(Date.parse(build.exportedAt))) {
      throw new Error("Build export timestamp is missing or invalid.");
    }
    return validateAllocatedNodeIndices(build.allocatedNodeIndices);
  }

  async function importBuildFile(file) {
    let text;
    try {
      text = await file.text();
    } catch (error) {
      setAllocationMessage(`Could not read build file: ${error.message}`, true);
      return;
    }

    let build;
    try {
      build = JSON.parse(text);
    } catch (error) {
      setAllocationMessage(`Import rejected: invalid JSON (${error.message}).`, true);
      return;
    }

    let imported;
    try {
      imported = validateImportedBuild(build);
    } catch (error) {
      setAllocationMessage(`Import rejected: ${error.message}`, true);
      return;
    }

    allocatedNodeIds = imported;
    updateAllocationDisplay();
    if (saveAllocation()) setAllocationMessage("Build imported and saved locally.");
  }

  function exportBuild() {
    if (!currentBoardConfig.supportsBuildFiles) {
      setAllocationMessage("Board 01 export is deferred until a safe multi-board build schema is defined.", true);
      return;
    }
    const build = {
      schemaVersion: BUILD_SCHEMA_VERSION,
      boardIdentifier: boardIdentity.identifier,
      boardSnoId: boardIdentity.snoId,
      sourceRevision: boardIdentity.sourceRevision,
      allocatedNodeIndices: [...allocatedNodeIds].sort((a, b) => a - b),
      exportedAt: new Date().toISOString()
    };

    let downloadUrl;
    try {
      const blob = new Blob([JSON.stringify(build, null, 2)], { type: "application/json" });
      downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "paladin-paragon-build.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setAllocationMessage(`Could not export build: ${error.message}`, true);
      return;
    }

    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    setAllocationMessage("Build exported.");
  }

  function getNodePointCost(node) {
    return POINT_COSTS[node.definition.kind] ?? POINT_COSTS.default;
  }

  function updateAllocationDisplay() {
    const eligibleNodeIds = getEligibleNodeIds();
    let spent = 0;

    for (const id of allocatedNodeIds) {
      const node = boardNodes.get(id);
      spent += getNodePointCost(node);
    }

    for (const [id, node] of boardNodes) {
      const isAllocated = allocatedNodeIds.has(id);
      const isEligible = eligibleNodeIds.has(id);
      node.marker.classList.toggle("node--allocated", isAllocated);
      node.marker.classList.toggle("node--eligible", isEligible);
      node.marker.setAttribute("aria-pressed", String(isAllocated));
      const state = isAllocated ? "allocated" : isEligible ? "eligible to allocate" : "not connected to the allocated path";
      node.marker.setAttribute("aria-label", `${node.definition.name}, ${KIND_LABELS[node.definition.kind] || "node"}, ${state}`);
    }

    pointsSpent.textContent = String(spent);
    allocatedCount.textContent = String(allocatedNodeIds.size);
    updateParagonCalculation();
    allocatedConnectionLayer.replaceChildren();
    for (const id of allocatedNodeIds) {
      const node = boardNodes.get(id);
      for (const neighborId of allocationGraph.get(id) || []) {
        if (neighborId <= id || !allocatedNodeIds.has(neighborId)) continue;
        const neighbor = boardNodes.get(neighborId);
        addConnection(allocatedConnectionLayer, node.x, node.y, neighbor.x, neighbor.y);
      }
    }
  }

  function updateParagonCalculation() {
    if (!currentBoardDefinition || !currentNodeDatabase) return;
    const result = calculateParagonBonuses(
      currentBoardDefinition,
      currentNodeDatabase,
      allocatedNodeIds,
      externalAttributes,
      { boardEquipIndex: currentBoardConfig.boardEquipIndex }
    );
    currentCalculation = result;
    const attributes = result.verifiedParagonBonuses.coreAttributes;
    strengthTotal.textContent = `+${attributes.Strength}`;
    intelligenceTotal.textContent = `+${attributes.Intelligence}`;
    willpowerTotal.textContent = `+${attributes.Willpower}`;
    dexterityTotal.textContent = `+${attributes.Dexterity}`;
    coreAttributeTotal.textContent = `+${result.verifiedParagonBonuses.totalCoreAttributes}`;
    unresolvedBonusCount.textContent = String(result.unresolvedBonusCount);
    for (const [name, value] of Object.entries(result.totalAttributes)) {
      totalAttributeDisplays[name].textContent = String(value);
    }

    const categories = result.verifiedParagonBonuses.rawBonuses;
    const unresolvedConditionals = new Set(result.nodeEvaluations
      .filter((node) => node.allocated)
      .flatMap((node) => node.attributes.filter((attribute) => attribute.conditional === null).map((attribute) => attribute.category)));
    for (const [category, displays] of Object.entries(rawBonusDisplays)) {
      const totals = categories[category];
      if (displays.panel) displays.panel.hidden = !totals;
      if (!totals) continue;
      displays.unconditional.textContent = formatRawBonusValue(totals.unconditional, category);
      displays.conditional.textContent = unresolvedConditionals.has(category)
        ? "Unresolved"
        : formatRawBonusValue(totals.conditional, category);
      displays.total.textContent = formatRawBonusValue(totals.total, category);
    }
    renderStatsSidebar(result);

    if (activeTooltipMarker) {
      const node = boardNodes.get(Number(activeTooltipMarker.dataset.nodeIndex));
      if (node) showTooltip(activeTooltipMarker, node.definition);
    }
  }

  function formatPercentValue(value) {
    const rounded = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
    return `${value >= 0 ? "+" : ""}${rounded}%`;
  }

  function formatRawBonusValue(value, category) {
    if (FLAT_BONUS_CATEGORIES.has(category)) {
      const rounded = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
      return `${value >= 0 ? "+" : ""}${rounded}`;
    }
    return formatPercentValue(value);
  }

  function clearStatHighlights() {
    for (const node of boardNodes.values()) {
      node.marker?.classList.remove("node--stat-highlight", "node--stat-highlight-conditional");
    }
  }

  function highlightStatContributors(key) {
    clearStatHighlights();
    for (const contributor of statContributors.get(key) || []) {
      const marker = boardNodes.get(contributor.nodeIndex)?.marker;
      if (!marker) continue;
      marker.classList.add("node--stat-highlight");
      marker.classList.toggle("node--stat-highlight-conditional", contributor.conditional);
    }
  }

  function addStatContribution(contributors, key, nodeIndex, conditional) {
    if (!contributors.has(key)) contributors.set(key, new Map());
    const nodeContribution = contributors.get(key);
    const existing = nodeContribution.get(nodeIndex);
    nodeContribution.set(nodeIndex, { nodeIndex, conditional: Boolean(existing?.conditional || conditional) });
  }

  function renderStatsSidebar(result) {
    const contributors = new Map();
    for (const node of result.nodeEvaluations) {
      if (!node.allocated) continue;
      for (const attribute of node.attributes) {
        const key = attribute.category === "coreAttribute"
          ? `core:${CORE_ATTRIBUTE_NAMES[attribute.attributeName] || attribute.attributeName}`
          : attribute.category ? `raw:${attribute.category}` : null;
        if (!key) continue;
        if (Number.isFinite(attribute.unconditional) && attribute.unconditional !== 0) {
          addStatContribution(contributors, key, node.nodeIndex, false);
        }
        if (attribute.conditional > 0 && attribute.conditionalApplied) {
          addStatContribution(contributors, key, node.nodeIndex, true);
        }
      }
    }
    statContributors = new Map([...contributors].map(([key, nodes]) => [key, [...nodes.values()]]));
    clearStatHighlights();

    const entries = [];
    for (const [attributeName, amount] of Object.entries(result.verifiedParagonBonuses.coreAttributes)) {
      if (amount !== 0) entries.push({ key: `core:${attributeName}`, label: attributeName, value: amount, flat: true });
    }
    for (const [category, totals] of Object.entries(result.verifiedParagonBonuses.rawBonuses)) {
      if (totals.total !== 0) {
        entries.push({ key: `raw:${category}`, label: RAW_BONUS_LABELS[category] || category, value: totals.total, flat: FLAT_BONUS_CATEGORIES.has(category) });
      }
    }
    statsSidebarList.replaceChildren();
    for (const entry of entries) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stats-sidebar-item";
      button.dataset.statKey = entry.key;
      button.setAttribute("aria-label", `${entry.value >= 0 ? "+" : ""}${entry.value}${entry.flat ? "" : "%"} ${entry.label}; highlight contributing nodes`);
      const label = document.createElement("span");
      label.textContent = entry.label;
      const value = document.createElement("strong");
      value.textContent = `${entry.value >= 0 ? "+" : ""}${Number.isInteger(entry.value) ? entry.value : Number(entry.value.toFixed(2))}${entry.flat ? "" : "%"}`;
      button.append(label, value);
      button.addEventListener("pointerenter", () => highlightStatContributors(entry.key));
      button.addEventListener("pointerleave", clearStatHighlights);
      button.addEventListener("focus", () => highlightStatContributors(entry.key));
      button.addEventListener("blur", clearStatHighlights);
      item.appendChild(button);
      statsSidebarList.appendChild(item);
    }
    statsSidebarEmpty.hidden = entries.length !== 0;
  }

  function allocateNode(id) {
    if (allocatedNodeIds.has(id)) {
      setAllocationMessage("That node is already allocated.");
      return;
    }
    if (allocationRootId === null) {
      const node = boardNodes.get(id);
      if (!currentBoardConfig.requiresEntryGate || node?.definition.kind !== "gate") {
        setAllocationMessage("Choose one of this board's gates as the local entry anchor before allocating adjacent nodes.", true);
        return;
      }
      allocationRootId = id;
      allocatedNodeIds.add(id);
      updateAllocationDisplay();
      if (saveAllocation()) {
        setAllocationMessage(`Selected ${node.definition.name} as this board's local entry anchor. Boards remain unattached.`);
      }
      return;
    }
    if (!(allocationGraph.get(id) || []).some((neighborId) => allocatedNodeIds.has(neighborId))) {
      setAllocationMessage("Cannot allocate that node: it is not orthogonally connected to the allocated path.", true);
      return;
    }
    allocatedNodeIds.add(id);
    updateAllocationDisplay();
    if (saveAllocation()) setAllocationMessage(`Allocated ${boardNodes.get(id).definition.name}.`);
  }

  function refundNode(id) {
    if (id === allocationRootId) {
      setAllocationMessage(currentBoardConfig.requiresEntryGate
        ? "The entry gate cannot be refunded while it anchors this board. Use Reset Allocation to choose another gate."
        : "The starting node cannot be refunded.", true);
      return;
    }
    if (!allocatedNodeIds.has(id)) {
      setAllocationMessage("That node is not allocated.");
      return;
    }

    const remainingIds = new Set(allocatedNodeIds);
    remainingIds.delete(id);
    const reachableIds = getReachableAllocatedNodeIds(remainingIds);
    if ([...remainingIds].some((remainingId) => !reachableIds.has(remainingId))) {
      setAllocationMessage("Cannot refund that node: it would disconnect other allocated nodes from the starting node.", true);
      return;
    }

    allocatedNodeIds = remainingIds;
    updateAllocationDisplay();
    if (saveAllocation()) setAllocationMessage(`Refunded ${boardNodes.get(id).definition.name}.`);
  }

  function resetAllocation() {
    allocationRootId = currentBoardConfig.requiresEntryGate ? null : allocationRootId;
    allocatedNodeIds = allocationRootId === null ? new Set() : new Set([allocationRootId]);
    updateAllocationDisplay();
    if (saveAllocation()) {
      setAllocationMessage(currentBoardConfig.requiresEntryGate
        ? "Allocation reset. Choose a gate as this board's local entry anchor."
        : "Allocation reset. Starting node is active.");
    }
  }

  allocationResetButton.addEventListener("click", resetAllocation);
  exportBuildButton.addEventListener("click", exportBuild);
  importBuildButton.addEventListener("click", () => buildFileInput.click());
  buildFileInput.addEventListener("change", async () => {
    const file = buildFileInput.files?.[0];
    if (file) await importBuildFile(file);
    buildFileInput.value = "";
  });
  boardSelector.addEventListener("change", () => {
    const boardKey = boardSelector.value;
    const resource = boardResources.get(boardKey);
    if (!resource) {
      setStatus(`Board data is not loaded for ${boardKey}.`, true);
      return;
    }
    hideTooltip();
    panX = 0;
    panY = 0;
    try {
      renderBoard(boardKey, resource.board, resource.database);
    } catch (error) {
      console.error("Could not switch Paragon boards:", error);
      setStatus(`Could not render selected board. (${error.message})`, true);
    }
  });
  for (const input of Object.values(externalAttributeInputs)) {
    input.addEventListener("input", updateExternalAttributesFromInputs);
  }
  restoreExternalAttributes();

  zoomInButton.addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
  zoomOutButton.addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
  resetButton.addEventListener("click", () => {
    panX = 0;
    panY = 0;
    zoom = Math.min(1, (stage.clientWidth - 48) / boardSize, (stage.clientHeight - 48) / boardSize);
    applyTransform();
  });

  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".node")) return;
    drag = { x: event.clientX, y: event.clientY, panX, panY };
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    panX = drag.panX + event.clientX - drag.x;
    panY = drag.panY + event.clientY - drag.y;
    applyTransform();
  });

  function endDrag() {
    drag = null;
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("lostpointercapture", endDrag);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideTooltip();
  });
  window.addEventListener("resize", () => {
    if (activeTooltipMarker) positionTooltip(activeTooltipMarker);
  });

  async function loadBoardResource(boardKey) {
    const config = BOARD_CONFIGS[boardKey];
    const [boardResponse, databaseResponse] = await Promise.all([
      fetch(config.boardUrl),
      fetch(config.nodeDatabaseUrl)
    ]);
    if (!boardResponse.ok) throw new Error(`${config.label} request failed (${boardResponse.status}).`);
    if (!databaseResponse.ok) throw new Error(`${config.label} node database request failed (${databaseResponse.status}).`);
    const [board, boardDatabase] = await Promise.all([boardResponse.json(), databaseResponse.json()]);
    const database = mergeSharedNodeDefinitions(boardDatabase);
    return { board, database };
  }

  (async () => {
    try {
      const startingBoard = await loadBoardResource("board00");
      boardResources.set("board00", startingBoard);
      renderBoard("board00", startingBoard.board, startingBoard.database);
    } catch (error) {
      console.error("Could not load the starting Paragon board:", error);
      setStatus(`Could not load Board 00 data. Serve the project over HTTP and check the local JSON files. (${error.message})`, true);
      return;
    }

    try {
      const additionalBoard = await loadBoardResource("board01");
      boardResources.set("board01", additionalBoard);
      const board01Option = boardSelector.querySelector('option[value="board01"]');
      if (board01Option) board01Option.disabled = false;
    } catch (error) {
      console.error("Could not load the Castle board:", error);
      setAllocationMessage(`Board 00 is available, but Board 01 could not be loaded. (${error.message})`, true);
    }

    try {
      const board02 = await loadBoardResource("board02");
      boardResources.set("board02", board02);
      const board02Option = boardSelector.querySelector('option[value="board02"]');
      if (board02Option) board02Option.disabled = false;
    } catch (error) {
      console.error("Could not load Paladin Board 02:", error);
      setAllocationMessage(`Board 02 could not be loaded. (${error.message})`, true);
    }

    try {
      const board03 = await loadBoardResource("board03");
      boardResources.set("board03", board03);
      const board03Option = boardSelector.querySelector('option[value="board03"]');
      if (board03Option) board03Option.disabled = false;
    } catch (error) {
      console.error("Could not load Paladin Board 03:", error);
      setAllocationMessage(`Board 03 could not be loaded. (${error.message})`, true);
    }

    for (const boardKey of ["board04", "board05", "board06", "board07", "board08", "board09"]) {
      const { label } = BOARD_CONFIGS[boardKey];
      try {
        const resource = await loadBoardResource(boardKey);
        boardResources.set(boardKey, resource);
        const option = boardSelector.querySelector(`option[value="${boardKey}"]`);
        if (option) option.disabled = false;
      } catch (error) {
        console.error(`Could not load ${label}:`, error);
        setAllocationMessage(`${label} could not be loaded. (${error.message})`, true);
      }
    }
  })();
})();
