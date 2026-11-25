import { calculateParagonBonuses } from "./paragon-calculator.js";
import { mergeSharedNodeDefinitions } from "./shared-node-definitions.js";
import { BOARD_ROTATIONS, getBoardControlPositions, rotateBoardPoint } from "./board-rotation.js";
import { getPaladinGlyph } from "./paladin-glyph-catalogue.js";
import { getGlyphProgression } from "./glyph-progression.js";
import { createGlyphEmblem, createGlyphPicker, describeAdditionalEffects, describeAdditionalRequirement, describeLegendaryEffects, describePrimaryGlyph, formatAmplifiedCore, formatGlyphPrimary } from "./glyph-picker.js";
import { evaluatePrimaryGlyph } from "./glyph-primary.js";
import { evaluateAmplificationGlyph } from "./glyph-amplification.js";
import { evaluateGlyphEffects } from "./glyph-effects.js";
import {
  attachBoard, calculateConnectedBonuses, CONNECTED_SAVE_KEY, CONNECTED_SAVE_KEY_V2, createStartingLayout, MAX_BOARDS,
  configureConnectedGlyph, planConnectedBoardReset, readConnectedSave, readConnectedSaveV2, removeConnectedBoard,
  retainConnectedGlyphs, rotateConnectedBoard, writeConnectedSaveV2
} from "./connected-boards.js";

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
  const CONNECTED_CONFIG = Object.freeze({
    label: "Connected Boards",
    requiresEntryGate: false,
    supportsBuildFiles: false,
    calculationScope: "These totals combine all equipped boards. Rare requirements use each board’s placement."
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
  const rotationLabel = document.getElementById("board-rotation-label");
  const rotationSelect = document.getElementById("board-rotation");
  const inspectorMode = new URLSearchParams(window.location.search).get("inspect") === "1";
  document.getElementById("board-inspector-controls").hidden = !inspectorMode;
  const connectedToggle = document.getElementById("connected-mode-toggle");
  const boardPicker = document.getElementById("board-picker");
  const boardPickerHint = document.getElementById("board-picker-hint");
  const boardPickerOptions = document.getElementById("board-picker-options");
  const boardPickerDescription = document.getElementById("board-picker-description");
  const boardPickerError = document.getElementById("board-picker-error");
  const boardManagement = document.getElementById("board-management");
  const glyphDialog = document.getElementById("glyph-picker");
  const glyphCalculationDetails = document.getElementById("glyph-calculation-details");
  const glyphCalculationList = document.getElementById("glyph-calculation-list");
  const amplificationGlobalDetails = document.getElementById("amplification-global-details");
  const showGlyphRadii = document.getElementById("show-glyph-radii");
  const glyphPicker = createGlyphPicker(glyphDialog, showBoardDialog);
  const managementActions = document.getElementById("board-management-actions");
  const managementFeedback = document.getElementById("board-management-feedback");
  const connectedHeaders = document.getElementById("connected-board-headers");
  const connectedBoardError = document.getElementById("connected-board-error");
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
  const totalStats = document.getElementById("total-stats");
  const totalStatsList = document.getElementById("total-stats-list");
  const totalStatsEmpty = document.getElementById("total-stats-empty");
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
  let boardPixelWidth = 0;
  let boardPixelHeight = 0;
  let activeTooltipMarker = null;
  let boardNodes = new Map();
  let allocationGraph = new Map();
  let allocatedNodeIds = new Set();
  let allocationRootId = null;
  let boardRotation = 0;
  let boardGrid = null;
  let boardCells = [];
  let connectionLayer = null;
  let glyphRadiusLayer = null;
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
  let connectedLayout = null;
  let connectedAllocation = null;
  let connectedGlyphs = new Map();
  const inspectorGlyphs = new Map();
  let invalidGlyphBoards = [];
  let connectedSaveReadError = null;
  let storedConnectedDraft = null;
  let boardPickerGate = null;
  let managedInstance = null;
  let managementFocusGate = null;
  let pendingBoardReset = null;

  function isConnectedMode() {
    return currentBoardKey === "connected";
  }

  function canAttachAtGate(node) {
    return isConnectedMode() && node?.gateDirection && connectedLayout.boards.length < MAX_BOARDS
      && !connectedLayout.gateOccupancy.has(node.id);
  }

  function freeBoardGates(board) {
    return [...board.gates.keys()].map(index => boardNodes.get(`${board.instanceId}:${index}`))
      .filter(canAttachAtGate);
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("board-status--error", Boolean(isError));
  }

  function setAllocationMessage(message, isError) {
    connectedBoardError.hidden = true;
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

  function buildTooltip(node) {
    const { definition, id, boardId } = node;
    const boardKey = boardId ?? currentBoardKey;
    const config = BOARD_CONFIGS[boardKey];
    const nodeEvaluation = currentCalculation?.nodeEvaluations.find(evaluation => (evaluation.nodeId ?? evaluation.nodeIndex) === id);
    tooltip.replaceChildren();

    const header = document.createElement("header");
    header.className = "tooltip-header";
    addText(header, "h2", "tooltip-title", definition.name);
    addText(header, "span", `tooltip-kind tooltip-kind--${definition.kind}`, KIND_LABELS[definition.kind] || "Node");
    tooltip.appendChild(header);

    if (boardId) addText(tooltip, "p", "tooltip-meta", config.label);
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
          if (calculation.amplification) {
            const { baseAmplificationDelta, effectiveAmount } = calculation.amplification;
            const category = calculation.category === "coreAttribute" ? "core" : calculation.category;
            addText(row, "p", "glyph-primary-result", `Glyph amplification ${formatRawBonusValue(baseAmplificationDelta, category)} · Effective ${formatRawBonusValue(effectiveAmount, category)} ${valueLabel}`);
          }
          if (calculation.conditionalAmplificationStatus) {
            addText(row, "p", "tooltip-formula-note", "Conditional amplification unresolved · native conditional value used.");
          }
          if (calculation.conditional === null) {
            addText(row, "p", "tooltip-bonus tooltip-bonus--unresolved", calculation.threshold?.reason ?? "Conditional amount unresolved.");
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
                ? threshold.requirements.map((requirement) => `${requirement.requiredAttribute} ${formatAmplifiedCore(requirement.currentValue)} / ${requirement.requiredValue}`).join("; ")
                : `${threshold.requiredAttribute} ${formatAmplifiedCore(threshold.currentValue)} / ${threshold.requiredValue}`;
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
            addText(row, "p", "tooltip-evidence", `Native value · ${evidenceLabel}`);
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
            ? `${threshold.name}: ${evaluation.requirements.map((requirement) => `${requirement.requiredAttribute} ${formatAmplifiedCore(requirement.currentValue)}/${requirement.requiredValue}`).join("; ")} · ${evaluation.satisfied ? "met" : "not met"}`
            : `${threshold.name}: ${evaluation.requiredAttribute} ${formatAmplifiedCore(evaluation.currentValue)}/${evaluation.requiredValue} · ${evaluation.satisfied ? "met" : "not met"}`
          : evaluation || config.unverifiedRareThresholds
            ? `${threshold.name}: unresolved${unresolvedFormula ? ` · ${unresolvedFormula}` : ""}`
            : `${threshold.name}: not evaluated`;
        const className = evaluation?.resolved
          ? `tooltip-threshold${evaluation.satisfied ? " tooltip-threshold--met" : ""}`
          : "tooltip-threshold tooltip-threshold--unresolved";
        addText(list, "li", className, label);
      }
      thresholds.appendChild(list);
      const thresholdNote = node.instanceId
        ? "Rare thresholds use this board’s placement and total character attributes."
        : config.unverifiedRareThresholds
        ? "This board’s Rare conditional amounts and requirements remain unverified."
        : config.observedRareThresholds
          ? `Rare thresholds use total attributes and the observed equip-index-${config.boardEquipIndex} requirements.`
          : boardKey === "board00"
            ? "Only the in-game verified starting-board requirement is evaluated."
            : boardKey === "board03"
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
    if (definition.hasSocket) {
      const configuration = getSocketGlyph(node);
      const progression = configuration && getGlyphProgression(configuration.level);
      const detail = progression
        ? `${getPaladinGlyph(configuration.snoId).displayName} · Level ${progression.level} · Radius ${progression.radius} · ${progression.rarity}`
        : "Empty glyph socket";
      addText(tooltip, "p", "tooltip-trait", `${detail}. Open to manage.`);
      const instanceId = node.instanceId ?? boardKey;
      const index = nodeEvaluation?.nodeIndex;
      const primary = [...(currentCalculation?.glyphEvaluations ?? []), ...(currentCalculation?.glyphPrimaryPreviews ?? [])]
        .find(entry => entry.instanceId === instanceId && entry.socketSourceIndex === index);
      if (primary) {
        const label = primary.status === "unpurchased" ? "Primary preview" : "Primary";
        addText(tooltip, "p", "glyph-primary-result", `${label} · ${describePrimaryGlyph(primary)}`);
        const summary = primary.deltasByAttribute?.map(line => describeSocketDelta(line)).join(" · ");
        if (summary) addText(tooltip, "p", "glyph-primary-result", summary);
      }
      const { additional, preview, modifiers } = getSocketEffects(currentCalculation, instanceId, index);
      if (additional) {
        addText(tooltip, "p", "glyph-primary-result", describeAdditionalRequirement(additional));
        addText(tooltip, "p", "glyph-primary-result", describeAdditionalEffects(additional));
      }
      const legendary = describeLegendaryEffects(preview, modifiers);
      if (legendary) addText(tooltip, "p", "glyph-primary-result", legendary);
    }
    for (const primary of currentCalculation?.glyphEvaluations ?? []) {
      if (primary.instanceId !== (node.instanceId ?? boardKey)) continue;
      if (primary.kind === "amplification") continue;
      const contribution = primary.contributions?.find(entry => entry.nodeId === id);
      if (contribution) {
        const amount = formatGlyphPrimary(contribution.percentagePoints, primary.destination);
        addText(tooltip, "p", "glyph-primary-result", `${primary.glyphName} Primary · ${amount} ${primary.label}`);
      }
    }
    if (definition.isGate) {
      const direction = node.marker.dataset.gateDirection;
      addText(tooltip, "p", "tooltip-trait", direction ? `Board gate · ${direction}` : "Board gate");
      if (canAttachAtGate(node)) {
        addText(tooltip, "p", "tooltip-trait", "Use + beside this gate or its board menu to attach a board.");
      }
    }
  }

  function positionTooltip(marker) {
    const markerRect = marker.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 10;
    const topMargin = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--tooltip-top-margin"));
    let left = markerRect.left - stageRect.left + markerRect.width / 2 - tooltipRect.width / 2;
    let top = markerRect.top - stageRect.top - tooltipRect.height - margin;

    left = Math.max(margin, Math.min(left, stage.clientWidth - tooltipRect.width - margin));
    if (top < topMargin) top = markerRect.bottom - stageRect.top + margin;
    top = Math.max(topMargin, Math.min(top, stage.clientHeight - tooltipRect.height - margin));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(node) {
    const marker = node.marker;
    activeTooltipMarker = marker;
    buildTooltip(node);
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
    if (isConnectedMode()) {
      const compact = zoom < 0.6;
      connectedHeaders.classList.toggle("connected-headers--compact", compact);
      connectedHeaders.style.width = `${boardGrid.offsetWidth}px`;
      connectedHeaders.style.height = `${boardGrid.offsetHeight}px`;
      connectedHeaders.style.transform = frame.style.transform;
      const fit = Math.min(1 / zoom, (5 * CELL_SIZE - 6) / (compact ? 126 : 230));
      connectedHeaders.style.setProperty("--connected-header-scale", fit);
      connectedHeaders.style.setProperty("--gate-control-scale", Math.min(1 / zoom, (CELL_SIZE - 4) / 36));
    }
    if (activeTooltipMarker) {
      requestAnimationFrame(() => {
        if (activeTooltipMarker) positionTooltip(activeTooltipMarker);
      });
    }
  }

  function setZoom(nextZoom) {
    const minimum = isConnectedMode() ? 0.05 : MIN_ZOOM;
    zoom = Math.max(minimum, Math.min(MAX_ZOOM, nextZoom));
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
    // A quarter turn preserves orthogonal adjacency. Keep the graph in source indices.
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
    connectedHeaders.hidden = true;
    connectedBoardError.hidden = true;
    boardPickerHint.hidden = true;
    connectedToggle.setAttribute("aria-pressed", "false");
    boardRotation = 0;
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

    const grid = createBoardGrid(width, width, `Paragon board, ${width} by ${width}`);
    boardCells = Array.from({ length: width * width }, (_, index) => createBoardCell(boardNodes.get(index)));
    frame.replaceChildren(grid);
    setStatus(`${config.label} · ${width} × ${width} · ${boardNodes.size} occupied nodes · ${nodeDefinitions.size} definitions`);
    restoreSavedAllocation();
    rotationLabel.hidden = !config.requiresEntryGate;
    renderBoardOrientation();
    updateAllocationDisplay();

    fitBoardView();
  }

  function connectedViewPadding() {
    const style = getComputedStyle(stage);
    return {
      top: parseFloat(style.getPropertyValue("--connected-fit-top")),
      bottom: parseFloat(style.getPropertyValue("--connected-fit-bottom"))
    };
  }

  function fittedBoardZoom(padding) {
    const availableWidth = Math.max(100, stage.clientWidth - 48);
    const availableHeight = Math.max(100, stage.clientHeight - (padding ? padding.top + padding.bottom : 48));
    return Math.min(1, availableWidth / boardPixelWidth, availableHeight / boardPixelHeight);
  }

  function fitBoardView() {
    const padding = isConnectedMode() ? connectedViewPadding() : null;
    zoom = fittedBoardZoom(padding);
    if (padding) panY = (padding.top - padding.bottom) / 2;
    applyTransform();
  }

  function setConnectedLocation(active) {
    if (active) {
      window.history.replaceState(null, "", "#connected");
    } else if (window.location.hash === "#connected") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function controlButton(parent, caption, label) {
    const button = addText(parent, "button", "", caption);
    button.type = "button";
    if (label) {
      button.title = label;
      button.setAttribute("aria-label", label);
    }
    return button;
  }

  function renderConnectedHeaders(boards) {
    const existing = new Map([...connectedHeaders.querySelectorAll(".connected-board-header")]
      .map(header => [header.dataset.instanceId, header]));
    const focused = document.activeElement;
    const controls = [];
    for (const board of boards) {
      const { instanceId, boardId, rotation, origin, placementIndex } = board;
      const [, name] = BOARD_CONFIGS[boardId].label.split(" — ");
      const freeGates = freeBoardGates(board);
      const { management, attachments } = getBoardControlPositions(board.board, rotation,
        freeGates.map(node => ({ id: node.id, x: node.displayPosition.x - origin.x, y: node.displayPosition.y - origin.y })));
      let header = existing.get(instanceId);
      if (!header) {
        header = document.createElement("div");
        header.className = "connected-board-header";
        header.dataset.instanceId = instanceId;
        header.dataset.boardId = boardId;
        header.setAttribute("role", "group");
        header.setAttribute("aria-label", name);
        const title = addText(header, "h3", "", "");
        addText(title, "span", "", "");
        title.append(name);
        if (board.incoming) {
          const rotationControls = addText(header, "div", "connected-board-rotation", "");
          controlButton(rotationControls, "↶", `Rotate ${name} 90° counterclockwise`).dataset.rotationStep = "-90";
          const angle = addText(rotationControls, "output", "", "");
          angle.setAttribute("aria-label", `${name} rotation`);
          controlButton(rotationControls, "↷", `Rotate ${name} 90° clockwise`).dataset.rotationStep = "90";
        }
        const menu = controlButton(header, "⋯", `Manage ${name}`);
        menu.dataset.manageBoard = "";
        menu.setAttribute("aria-haspopup", "dialog");
        menu.setAttribute("aria-controls", boardManagement.id);
      }
      header.querySelector("h3 span").textContent = `#${placementIndex + 1}`;
      if (board.incoming) header.querySelector("output").textContent = `${rotation}°`;
      const rightEdge = origin.x + management.x + management.columns;
      header.style.right = `${(connectedLayout.width - rightEdge) * CELL_SIZE + 4}px`;
      header.style.top = `${(origin.y + management.y) * CELL_SIZE + 4}px`;
      header.style.setProperty("--connected-header-height-scale", (management.rows * CELL_SIZE - 6) / 42);
      header.toggleAttribute("data-tight-inset", management.rows === 1);
      controls.push(header);

      for (const [id, spot] of attachments) {
        const node = boardNodes.get(id);
        const label = `Attach at ${name}'s ${node.gateDirection.toLowerCase()} gate`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gate-attachment";
        button.textContent = "+";
        button.title = label;
        button.setAttribute("aria-label", label);
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-controls", boardPicker.id);
        button.dataset.attachGate = id;
        button.style.left = `${(origin.x + spot.x + 0.5) * CELL_SIZE + 1}px`;
        button.style.top = `${(origin.y + spot.y + 0.5) * CELL_SIZE + 1}px`;
        controls.push(button);
      }
    }
    connectedHeaders.replaceChildren(...controls);
    connectedHeaders.hidden = false;
    if (connectedHeaders.contains(focused)) focused.focus({ preventScroll: true });
  }

  function renderConnectedLayout() {
    const { width, height, nodes, graph, root, boards } = connectedLayout;
    hideTooltip();
    currentBoardKey = "connected";
    currentBoardConfig = CONNECTED_CONFIG;
    currentBoardDefinition = null;
    currentNodeDatabase = null;
    boardNodes = nodes;
    allocationGraph = graph;
    allocationRootId = root;
    allocatedNodeIds = connectedAllocation;
    rotationLabel.hidden = true;
    boardPickerHint.hidden = boards.length >= MAX_BOARDS;
    connectedToggle.setAttribute("aria-pressed", "true");
    exportBuildButton.hidden = importBuildButton.hidden = !inspectorMode;
    exportBuildButton.disabled = true;
    importBuildButton.disabled = true;
    exportBuildButton.title = importBuildButton.title = "Build files are available in the Starting Board view.";
    calculationScopeNote.textContent = CONNECTED_CONFIG.calculationScope;

    const grid = createBoardGrid(width, height, "Connected Paragon boards");
    const displayedNodes = new Map([...nodes.values()].map(node => {
      const { x, y } = node.displayPosition;
      return [y * width + x, node];
    }));
    grid.append(...Array.from({ length: width * height }, (_, index) => createBoardCell(displayedNodes.get(index))));
    const outlines = boards.map(board => {
      const outline = document.createElement("div");
      outline.className = "connected-board-outline";
      outline.setAttribute("aria-hidden", "true");
      outline.style.left = `${board.origin.x * CELL_SIZE + 1}px`;
      outline.style.top = `${board.origin.y * CELL_SIZE + 1}px`;
      outline.style.width = outline.style.height = `${board.board.nWidth * CELL_SIZE}px`;
      return outline;
    });
    frame.replaceChildren(grid, ...outlines);
    renderConnectedHeaders(boards);
    renderGlyphRadii();
    renderConnections(connectionLayer, boardNodes);
    setStatus(`${CONNECTED_CONFIG.label} · ${boards.length}/${MAX_BOARDS} equipped`);
    updateAllocationDisplay();
  }

  function writeConnectedDraft(allocations = connectedAllocation, glyphs = connectedGlyphs) {
    if (connectedSaveReadError) throw new Error("The existing connected save could not be read and was preserved.");
    if (window.localStorage.getItem(CONNECTED_SAVE_KEY_V2) !== storedConnectedDraft) {
      throw new Error("The stored connected draft changed. Reload before saving again.");
    }
    const serialized = JSON.stringify(writeConnectedSaveV2(connectedLayout, allocations, glyphs));
    window.localStorage.setItem(CONNECTED_SAVE_KEY_V2, serialized);
    storedConnectedDraft = serialized;
    invalidGlyphBoards = [];
  }

  function openConnectedMode() {
    let migrated = false;
    if (!connectedLayout) {
      try {
        storedConnectedDraft = window.localStorage.getItem(CONNECTED_SAVE_KEY_V2);
        const legacy = storedConnectedDraft === null ? window.localStorage.getItem(CONNECTED_SAVE_KEY) : null;
        const restored = storedConnectedDraft !== null
          ? readConnectedSaveV2(boardResources, JSON.parse(storedConnectedDraft))
          : legacy !== null ? readConnectedSave(boardResources, JSON.parse(legacy)) : null;
        if (restored) {
          connectedLayout = restored.layout;
          connectedAllocation = restored.allocated;
          connectedGlyphs = restored.glyphs ?? new Map();
          invalidGlyphBoards = restored.invalidGlyphBoards ?? [];
          migrated = legacy !== null;
        }
      } catch (error) {
        connectedSaveReadError = error;
      }
      if (!connectedLayout) {
        connectedLayout = createStartingLayout(boardResources);
        connectedAllocation = new Set([connectedLayout.root]);
      }
    }
    panX = panY = 0;
    renderConnectedLayout();
    fitBoardView();
    if (inspectorMode) setConnectedLocation(true);
    if (connectedSaveReadError) {
      setSaveStatus("Connected save unavailable", "error");
      setAllocationMessage(`Connected save could not be restored: ${connectedSaveReadError.message}`, true);
      return;
    }
    if (migrated) {
      if (saveConnectedAllocation("Legacy draft")) setAllocationMessage("Legacy connected draft restored and copied to version 2.");
      return;
    }
    setSaveStatus(storedConnectedDraft !== null ? "Connected draft restored" : "Separate connected draft",
      storedConnectedDraft !== null ? "saved" : "unsaved");
    if (invalidGlyphBoards.length) {
      const names = new Intl.ListFormat("en").format(invalidGlyphBoards.map(boardName));
      setAllocationMessage(`Restored the board draft. Invalid or obsolete glyph data was ignored on ${names}.`, true);
      return;
    }
    setAllocationMessage(connectedLayout.boards.length < MAX_BOARDS
      ? "Use + beside a free gate to attach a board." : "All five board positions are equipped.");
  }

  function saveConnectedAllocation(change) {
    connectedAllocation = allocatedNodeIds;
    try {
      writeConnectedDraft();
    } catch (error) {
      setSaveStatus("Connected save failed", "error");
      setAllocationMessage(`${change} changed, but the connected draft could not be saved: ${error.message}`, true);
      return false;
    }
    setSaveStatus("Connected draft saved locally", "saved");
    return true;
  }

  function commitConnectedLayout(layout, message, fit) {
    const before = connectedLayout.boards[0].origin;
    const after = layout.boards[0].origin;
    // Keep the Starting Board at its previous screen position when grid bounds move.
    panX += ((before.x - after.x) + (layout.width - connectedLayout.width) / 2) * CELL_SIZE * zoom;
    panY += ((before.y - after.y) + (layout.height - connectedLayout.height) / 2) * CELL_SIZE * zoom;
    connectedLayout = layout;
    connectedAllocation = allocatedNodeIds;
    connectedGlyphs = retainConnectedGlyphs(layout, connectedGlyphs);
    connectedBoardError.hidden = true;
    renderConnectedLayout();
    if (fit) {
      panX = panY = 0;
      fitBoardView();
    } else {
      applyTransform();
    }
    if (saveAllocation("Layout")) setAllocationMessage(message);
  }

  function boardChangeError(error, showInCanvas = true) {
    const message = `Attachment change rejected: ${error.message}`;
    setAllocationMessage(message, true);
    connectedBoardError.textContent = message;
    connectedBoardError.hidden = !showInCanvas;
  }

  function positionBoardDialog(dialog) {
    const bounds = stage.getBoundingClientRect();
    const left = Math.max(0, bounds.left);
    const top = Math.max(0, bounds.top);
    const right = Math.min(document.documentElement.clientWidth, bounds.right);
    const bottom = Math.min(document.documentElement.clientHeight, bounds.bottom);
    const height = Math.max(0, bottom - top);
    Object.assign(dialog.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${height}px`
    });
    return height;
  }

  function showBoardDialog(dialog, minimumHeight) {
    hideTooltip();
    if (positionBoardDialog(dialog) < Math.min(minimumHeight, stage.clientHeight)) {
      stage.scrollIntoView({ block: "center" });
      positionBoardDialog(dialog);
    }
    dialog.showModal();
  }

  function openBoardPicker(node) {
    if (boardPicker.open || !canAttachAtGate(node)) return;
    boardPickerGate = node;
    boardPickerDescription.textContent = `${BOARD_CONFIGS[node.boardId].label} · ${node.gateDirection} gate. Choose an unused board. Attachment costs no points.`;
    boardPickerError.hidden = true;
    connectedBoardError.hidden = true;
    const equipped = new Set(connectedLayout.boards.map(board => board.boardId));
    for (const option of boardPickerOptions.querySelectorAll("button")) {
      const boardId = option.dataset.boardId;
      const optionReason = equipped.has(boardId) ? "Equipped" : !boardResources.has(boardId) ? "Data unavailable" : "";
      option.querySelector("span").textContent = optionReason;
      option.disabled = Boolean(optionReason);
    }
    showBoardDialog(boardPicker, 360);
    boardPickerOptions.querySelector("button:enabled")?.focus({ preventScroll: true });
  }

  function getSocketGlyph(node) {
    return node.instanceId ? connectedGlyphs.get(node.instanceId) : inspectorGlyphs.get(currentBoardKey);
  }

  function renderSocketGlyph(node, allocationState) {
    const configuration = getSocketGlyph(node);
    const glyph = getPaladinGlyph(configuration?.snoId);
    node.marker.classList.toggle("node--occupied-socket", Boolean(glyph));
    node.marker.replaceChildren(...(glyph ? [createGlyphEmblem(glyph)] : []));
    const board = BOARD_CONFIGS[node.boardId ?? currentBoardKey].label;
    const detail = glyph ? `${glyph.displayName}, level ${configuration.level}` : "empty";
    node.marker.setAttribute("aria-label", `${board}, glyph socket, ${detail}, ${allocationState}`);
  }

  function socketAllocationState(id, eligible) {
    return allocatedNodeIds.has(id) ? "allocated" : eligible ? "eligible to allocate" : "outside the allocated path";
  }

  function openGlyphPicker(node) {
    const persistent = Boolean(node.instanceId);
    const boardKey = node.boardId ?? currentBoardKey;
    glyphPicker.open({
      boardName: BOARD_CONFIGS[boardKey].label.split(" — ")[1],
      configuration: getSocketGlyph(node),
      allocated: allocatedNodeIds.has(node.id),
      eligible: getEligibleNodeIds().has(node.id),
      persistent,
      evaluateGlyph(configuration, saved) {
        const board = boardResources.get(boardKey);
        const input = {
          board: board.board, instanceId: node.instanceId ?? boardKey, sourceRevision: board.database.source.commit,
          configuration, nodeEvaluations: currentCalculation.nodeEvaluations
        };
        const primary = evaluateAmplificationGlyph(input) ?? evaluatePrimaryGlyph(input);
        return { primary, ...evaluateGlyphEffects(input, primary, saved) };
      },
      describeSocketDelta,
      onAllocate() {
        allocateNode(node.id);
        return allocatedNodeIds.has(node.id);
      },
      onSave(configuration) {
        if (persistent) {
          const next = configureConnectedGlyph(connectedLayout, connectedGlyphs, node.instanceId, configuration);
          writeConnectedDraft(connectedAllocation, next);
          connectedGlyphs = next;
          setSaveStatus("Connected draft saved locally", "saved");
        } else if (configuration) {
          inspectorGlyphs.set(boardKey, configuration);
        } else {
          inspectorGlyphs.delete(boardKey);
        }
        renderSocketGlyph(node, socketAllocationState(node.id, getEligibleNodeIds().has(node.id)));
        renderGlyphRadii();
        updateParagonCalculation();
        setAllocationMessage(configuration
          ? `${getPaladinGlyph(configuration.snoId).displayName} saved at planner level ${configuration.level}.`
          : "Glyph removed.");
      },
      onClose() {
        node.marker.focus({ preventScroll: true });
        if (!node.marker.matches(":focus-visible")) hideTooltip();
      }
    });
  }

  function managementButton(instanceId) {
    return connectedHeaders.querySelector(`[data-instance-id="${CSS.escape(instanceId)}"] [data-manage-board]`);
  }

  function boardName(instanceId) {
    const board = connectedLayout.boards.find(instance => instance.instanceId === instanceId);
    return BOARD_CONFIGS[board.boardId].label.split(" — ")[1];
  }

  function showManagementFeedback(message) {
    managementFeedback.textContent = message;
    managementFeedback.hidden = !message;
  }

  function renderManagementActions(board, focusReset = false) {
    managementActions.replaceChildren();
    showManagementFeedback("");
    const name = boardName(board.instanceId);
    document.getElementById("board-management-title").textContent = `#${board.placementIndex + 1} ${name}${board.incoming ? ` · ${board.rotation}°` : ""}`;
    if (board.incoming) {
      controlButton(managementActions, "Rotate 90° counterclockwise").dataset.rotationStep = "-90";
      controlButton(managementActions, "Rotate 90° clockwise").dataset.rotationStep = "90";
    }
    const reset = controlButton(managementActions, "Reset this board’s points");
    reset.dataset.resetBoard = "";
    const hasPoints = [...allocatedNodeIds].some(id => id !== connectedLayout.root && boardNodes.get(id).instanceId === board.instanceId);
    reset.disabled = !hasPoints;
    if (!hasPoints) showManagementFeedback("This board has no points to refund.");
    if (board.incoming && !hasPoints && !connectedLayout.attachments.some(edge => edge.parentInstanceId === board.instanceId)) {
      controlButton(managementActions, "Remove this board").dataset.removeBoard = "";
    }
    for (const gate of freeBoardGates(board)) {
      controlButton(managementActions, `Attach at ${gate.gateDirection.toLowerCase()} gate`).dataset.attachGate = gate.id;
    }
    if (focusReset) reset.focus({ preventScroll: true });
  }

  function openBoardManagement(instanceId) {
    const board = connectedLayout.boards.find(instance => instance.instanceId === instanceId);
    managedInstance = instanceId;
    managementFocusGate = null;
    pendingBoardReset = null;
    connectedBoardError.hidden = true;
    renderManagementActions(board);
    showBoardDialog(boardManagement, 300);
  }

  function previewBoardReset(board) {
    const { candidate, refunded, dependentBoards } = planConnectedBoardReset(connectedLayout, allocatedNodeIds, board.instanceId);
    const name = boardName(board.instanceId);
    if (dependentBoards.size) {
      const names = new Intl.ListFormat("en").format([...dependentBoards].map(boardName));
      showManagementFeedback(`Cannot reset ${name}. Allocated nodes on ${names} depend on its path. Refund those nodes first.`);
      return;
    }
    if (!refunded) return;
    pendingBoardReset = candidate;
    showManagementFeedback(`Reset ${name} and refund ${refunded} ${refunded === 1 ? "point" : "points"}?`);
    managementActions.replaceChildren();
    controlButton(managementActions, "Refund points").dataset.confirmReset = "";
    const cancel = controlButton(managementActions, "Cancel");
    cancel.dataset.cancelReset = "";
    cancel.focus({ preventScroll: true });
  }

  function commitBoardReset(board) {
    try {
      writeConnectedDraft(pendingBoardReset);
    } catch (error) {
      showManagementFeedback(`Could not reset ${boardName(board.instanceId)}. ${error.message}`);
      return;
    }
    const refunded = allocatedNodeIds.size - pendingBoardReset.size;
    allocatedNodeIds = connectedAllocation = pendingBoardReset;
    updateAllocationDisplay();
    setSaveStatus("Connected draft saved locally", "saved");
    setAllocationMessage(`Refunded ${refunded} ${refunded === 1 ? "point" : "points"} on ${boardName(board.instanceId)}.`);
    boardManagement.close();
  }

  function rotateBoardFromControl(board, step) {
    const candidate = rotateConnectedBoard(boardResources, connectedLayout, allocatedNodeIds, board.instanceId, step);
    commitConnectedLayout(candidate, `${BOARD_CONFIGS[board.boardId].label} rotated.`, false);
  }

  function createBoardGrid(width, height, label) {
    boardPixelWidth = width * CELL_SIZE;
    boardPixelHeight = height * CELL_SIZE;
    const grid = document.createElement("div");
    boardGrid = grid;
    grid.className = "board-grid";
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-label", label);
    grid.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;

    function makeLayer(className) {
      const layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      layer.setAttribute("class", className);
      layer.setAttribute("width", String(boardPixelWidth));
      layer.setAttribute("height", String(boardPixelHeight));
      layer.setAttribute("viewBox", `0 0 ${boardPixelWidth} ${boardPixelHeight}`);
      layer.setAttribute("aria-hidden", "true");
      grid.appendChild(layer);
      return layer;
    }

    glyphRadiusLayer = makeLayer("glyph-radius-layer");
    connectionLayer = makeLayer("board-connections");
    allocatedConnectionLayer = makeLayer("board-connections board-connections--allocated");
    return grid;
  }

  function createBoardCell(node) {
    const cell = document.createElement("div");
    cell.className = "board-cell";
    cell.setAttribute("role", "gridcell");
    if (!node) {
      cell.setAttribute("aria-label", "Empty");
      return cell;
    }

    const { id, definition, boardId, instanceId } = node;
    const marker = document.createElement("span");
    marker.className = `node node--${definition.kind}`;
    marker.dataset.nodeIndex = String(node.sourceIndex ?? id);
    marker.dataset.nodeName = definition.name;
    if (boardId) marker.dataset.boardId = boardId;
    if (instanceId) marker.dataset.boardInstanceId = instanceId;
    if (node.gateDirection) marker.dataset.gateDirection = node.gateDirection;
    marker.setAttribute("role", "button");
    marker.setAttribute("aria-describedby", tooltip.id);
    if (definition.hasSocket) marker.setAttribute("aria-haspopup", "dialog");
    else marker.setAttribute("aria-pressed", "false");
    marker.setAttribute("aria-keyshortcuts", "Enter Space Delete");
    marker.tabIndex = 0;
    node.marker = marker;
    cell.setAttribute("aria-label", definition.name);
    const activate = definition.hasSocket ? () => openGlyphPicker(node) : () => allocateNode(id);
    marker.addEventListener("click", event => {
      event.stopPropagation();
      if (event.button === 0) activate();
    });
    marker.addEventListener("contextmenu", event => {
      event.preventDefault();
      event.stopPropagation();
      refundNode(id);
    });
    marker.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Delete") return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Delete") refundNode(id);
      else activate();
    });
    marker.addEventListener("pointerenter", () => showTooltip(node));
    marker.addEventListener("pointerleave", () => {
      if (document.activeElement !== marker) hideTooltip(marker);
    });
    marker.addEventListener("focus", () => showTooltip(node));
    marker.addEventListener("blur", () => {
      if (!marker.matches(":hover")) hideTooltip(marker);
    });
    cell.appendChild(marker);
    return cell;
  }

  function renderBoardOrientation() {
    const width = Number(currentBoardDefinition.nWidth);
    const cells = [];
    for (const [index, cell] of boardCells.entries()) {
      const position = rotateBoardPoint(index % width, Math.floor(index / width), width, boardRotation);
      const { x, y } = position;
      cells[y * width + x] = cell;
      const node = boardNodes.get(index);
      if (!node) continue;
      node.displayPosition = position;
      if (node.definition.isGate) {
        const direction = y === 0 ? "North" : x === width - 1 ? "East" : y === width - 1 ? "South" : x === 0 ? "West" : "";
        node.marker.dataset.gateDirection = direction;
      }
    }
    const focusedMarker = boardGrid.contains(document.activeElement) ? document.activeElement : null;
    boardGrid.append(...cells);
    focusedMarker?.focus({ preventScroll: true });
    rotationSelect.value = String(boardRotation);
    renderGlyphRadii();
    renderConnections(connectionLayer, boardNodes);
  }

  function renderGlyphRadii() {
    glyphRadiusLayer?.replaceChildren();
    if (!glyphRadiusLayer || !showGlyphRadii.checked) return;
    for (const node of boardNodes.values()) {
      if (!node.definition.hasSocket) continue;
      const configuration = getSocketGlyph(node);
      if (!configuration) continue;
      const { radius, rarity } = getGlyphProgression(configuration.level);
      const centerX = (node.displayPosition.x + 0.5) * CELL_SIZE;
      const centerY = (node.displayPosition.y + 0.5) * CELL_SIZE;
      // Place the outline between the last included and first excluded grid centers.
      const reach = (radius + 0.5) * CELL_SIZE;
      const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      diamond.setAttribute("points", `${centerX},${centerY - reach} ${centerX + reach},${centerY} ${centerX},${centerY + reach} ${centerX - reach},${centerY}`);
      diamond.dataset.boardInstanceId = node.instanceId ?? currentBoardKey;
      diamond.dataset.socketSourceIndex = node.sourceIndex ?? node.id;
      diamond.dataset.radius = radius;
      diamond.dataset.rarity = rarity.toLowerCase();
      glyphRadiusLayer.append(diamond);
    }
  }

  showGlyphRadii.addEventListener("change", renderGlyphRadii);

  function renderConnections(layer, nodeIds) {
    layer.replaceChildren();
    for (const id of nodeIds.keys()) {
      const from = boardNodes.get(id).displayPosition;
      for (const neighborId of allocationGraph.get(id)) {
        if (neighborId <= id || !nodeIds.has(neighborId)) continue;
        const to = boardNodes.get(neighborId).displayPosition;
        const line = addConnection(layer, from.x, from.y, to.x, to.y);
        if (isConnectedMode() && boardNodes.get(id).instanceId !== boardNodes.get(neighborId).instanceId) {
          line.classList.add("board-connection--bridge");
        }
      }
    }
  }

  function addConnection(svg, x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(x1 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("y1", String(y1 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("x2", String(x2 * CELL_SIZE + CELL_SIZE / 2));
    line.setAttribute("y2", String(y2 * CELL_SIZE + CELL_SIZE / 2));
    svg.appendChild(line);
    return line;
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
        boardRotation = memoryAllocation.rotation;
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
        ? "Choose a gate as this board's local entry anchor."
        : "Starting node is active.");
      allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices: [...allocatedNodeIds], rotation: boardRotation });
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
        if (BOARD_ROTATIONS.includes(parsed.rotation)) boardRotation = parsed.rotation;
      } else {
        restored = validateAllocatedNodeIndices(parsed, allocationRootId);
      }
    } catch (error) {
      allocationRootId = currentBoardConfig.requiresEntryGate ? null : allocationRootId;
      allocatedNodeIds = allocationRootId === null ? new Set() : new Set([allocationRootId]);
      setSaveStatus("Invalid save rejected", "error");
      setAllocationMessage(`Saved allocation rejected; starting node only. ${error.message}`, true);
      return;
    }

    allocatedNodeIds = restored;
    allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices: [...allocatedNodeIds], rotation: boardRotation });
    setSaveStatus("Saved locally", "saved");
    setAllocationMessage("Restored saved allocation.");
  }

  function saveAllocation(change = "Allocation") {
    if (isConnectedMode()) return saveConnectedAllocation(change);
    const indices = [...allocatedNodeIds].sort((a, b) => a - b);
    allocationsByBoard.set(currentBoardKey, { rootId: allocationRootId, indices, rotation: boardRotation });
    const persistedValue = currentBoardConfig.requiresEntryGate
      ? { entryNodeIndex: allocationRootId, allocatedNodeIndices: indices, rotation: boardRotation }
      : indices;
    try {
      window.localStorage.setItem(currentBoardConfig.storageKey, JSON.stringify(persistedValue));
    } catch (error) {
      setSaveStatus("Save failed", "error");
      setAllocationMessage(`${change} changed, but could not be saved: ${error.message}`, true);
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
      if (node.definition.hasSocket) {
        renderSocketGlyph(node, socketAllocationState(id, isEligible));
        continue;
      }
      node.marker.setAttribute("aria-pressed", String(isAllocated));
      const state = isAllocated ? "allocated" : isEligible ? "eligible to allocate" : "not connected to the allocated path";
      const boardLabel = node.boardId ? `${BOARD_CONFIGS[node.boardId].label}, ` : "";
      node.marker.setAttribute("aria-label", `${boardLabel}${node.definition.name}, ${KIND_LABELS[node.definition.kind] || "node"}, ${state}`);
    }

    pointsSpent.textContent = String(spent);
    allocatedCount.textContent = String(allocatedNodeIds.size);
    updateParagonCalculation();
    renderConnections(allocatedConnectionLayer, allocatedNodeIds);
  }

  function updateParagonCalculation() {
    if (!isConnectedMode() && (!currentBoardDefinition || !currentNodeDatabase)) return;
    const result = isConnectedMode()
      ? calculateConnectedBonuses(connectedLayout, allocatedNodeIds, externalAttributes, connectedGlyphs)
      : calculateParagonBonuses(
        currentBoardDefinition,
        currentNodeDatabase,
        allocatedNodeIds,
        externalAttributes,
        { boardEquipIndex: currentBoardConfig.boardEquipIndex, instanceId: currentBoardKey, glyph: inspectorGlyphs.get(currentBoardKey) }
      );
    currentCalculation = result;
    const attributes = result.verifiedParagonBonuses.coreAttributes;
    strengthTotal.textContent = `+${formatAmplifiedCore(attributes.Strength)}`;
    intelligenceTotal.textContent = `+${formatAmplifiedCore(attributes.Intelligence)}`;
    willpowerTotal.textContent = `+${formatAmplifiedCore(attributes.Willpower)}`;
    dexterityTotal.textContent = `+${formatAmplifiedCore(attributes.Dexterity)}`;
    coreAttributeTotal.textContent = `+${formatAmplifiedCore(result.verifiedParagonBonuses.totalCoreAttributes)}`;
    unresolvedBonusCount.textContent = String(result.unresolvedBonusCount);
    for (const [name, value] of Object.entries(result.totalAttributes)) {
      totalAttributeDisplays[name].textContent = String(formatAmplifiedCore(value));
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
      displays.total.textContent = formatRawBonusValue(totals.unconditional + totals.conditional + (totals.amplification ?? 0), category);
    }
    const evaluations = [...(result.glyphEvaluations ?? []), ...(result.glyphPrimaryPreviews ?? [])];
    glyphCalculationList.replaceChildren();
    glyphCalculationDetails.hidden = evaluations.length === 0;
    const activeAmplification = evaluations.some(primary => primary.kind === "amplification" && primary.status === "active");
    amplificationGlobalDetails.hidden = !activeAmplification;
    if (activeAmplification) {
      const exact = Object.entries(result.totalAttributes).map(([name, value]) => `${name} ${value}`).join(" · ");
      amplificationGlobalDetails.textContent = `Exact global threshold inputs · ${exact}. Integer core displays are provisional.`;
    }
    const amplifiedNodes = new Set();
    for (const primary of evaluations) {
      const name = isConnectedMode() ? boardName(primary.instanceId) : currentBoardConfig.label.split(" — ")[1];
      const item = addText(glyphCalculationList, "li", "", `${name} · ${primary.glyphName} level ${primary.level}`);
      const evidence = primary.evidence === "source-derived-extrapolation" ? "Source-derived extrapolation"
        : primary.evidence === "experimentally-supported-amplification" ? "Experimentally supported"
          : "Calibrated with in-game observations";
      const label = primary.status === "unpurchased" ? "Primary preview" : "Primary";
      addText(item, "p", "glyph-primary-result", `${label} · ${describePrimaryGlyph(primary)} · ${evidence}`);
      renderSocketEffectDetails(item, getSocketEffects(result, primary.instanceId, primary.socketSourceIndex));
      if (primary.kind === "amplification" && primary.status === "active") {
        renderAmplificationDetails(item, primary, result.effectiveNodeContributions);
        for (const line of primary.contributions) amplifiedNodes.add(line.nodeId);
      }
    }
    for (const [id, node] of boardNodes) {
      const amplified = amplifiedNodes.has(id);
      node.marker.classList.toggle("node--amplified", amplified);
      if (amplified) node.marker.setAttribute("aria-description", "Glyph-amplified");
      else node.marker.removeAttribute("aria-description");
    }
    renderTotalStats(result);

    if (activeTooltipMarker) {
      const { boardInstanceId, nodeIndex } = activeTooltipMarker.dataset;
      const node = boardNodes.get(boardInstanceId ? `${boardInstanceId}:${nodeIndex}` : Number(nodeIndex));
      if (node) showTooltip(node);
    }
  }

  function describeSocketDelta(line, precise = false) {
    const core = line.units === "flat" && line.category === "coreAttribute";
    const value = precise ? line.delta : core ? formatAmplifiedCore(line.delta) : Number(line.delta.toFixed(2));
    const label = core ? attributeLabel(line.attributeName) : RAW_BONUS_LABELS[line.category] || attributeLabel(line.attributeName);
    return `+${value}${line.units === "percentage-points" ? "%" : ""} ${label}`;
  }

  function getSocketEffects(result, instanceId, socketSourceIndex) {
    const ownsSocket = record => record.instanceId === instanceId && record.socketSourceIndex === socketSourceIndex;
    return {
      additional: result?.additionalGlyphEffects?.find(ownsSocket),
      preview: result?.legendaryGlyphPreviews?.find(ownsSocket),
      modifiers: result?.legendaryGlyphModifiers?.filter(ownsSocket) ?? []
    };
  }

  function renderSocketEffectDetails(item, { additional, preview, modifiers }) {
    if (additional) {
      addText(item, "p", "glyph-primary-result", describeAdditionalRequirement(additional));
      addText(item, "p", "", describeAdditionalEffects(additional));
      for (const requirement of additional.requirements) {
        addText(item, "p", "", `${attributeLabel(requirement.attribute.name)} · ${requirement.resolved ? "Native" : "Known native"} ${requirement.native} · Effective ${requirement.resolved ? requirement.effective : "unresolved"} · Required ${requirement.required}`);
      }
      const evidence = additional.parameterEvidence === "tooltip-calibrated-intrinsic"
        ? "Tooltip-calibrated intrinsic. Runtime binding unresolved." : "Authored parameters match the observed tooltip.";
      addText(item, "p", "", `${evidence} Passive combat application unresolved.`);
    }
    const legendary = describeLegendaryEffects(preview, modifiers);
    if (legendary) {
      addText(item, "p", "glyph-primary-result", legendary);
      for (const { destination, fraction, aggregationOperator } of preview?.destinations ?? modifiers) {
        addText(item, "p", "", `${destination.name} [${destination.id}/${destination.parameter}] · Fraction ${fraction} · Operator ${aggregationOperator}`);
      }
      addText(item, "p", "", "Tooltip-supported Legendary scaling. Combat stacking unresolved.");
    }
  }

  function renderAmplificationDetails(item, primary, effectiveLines) {
    const { glyphSnoId, instanceId } = primary;
    addText(item, "p", "", `Amplification fraction ${primary.fraction} · ${primary.percentagePoints}%`);
    if (primary.deltasByAttribute.length) {
      addText(item, "p", "", primary.deltasByAttribute.map(line => describeSocketDelta(line, true)).join(" · "));
    }
    if (primary.conditionalAmplificationPending) {
      addText(item, "p", "", "Rare conditional amplification unresolved. Active conditional bonuses keep their native values.");
    }
    if (primary.unresolvedLines.length) {
      addText(item, "p", "", `${primary.unresolvedLines.length} eligible lines have unresolved native values.`);
    }
    const lines = effectiveLines.filter(line => line.instanceId === instanceId && line.glyphSnoId === glyphSnoId);
    if (lines.length) {
      const breakdown = document.createElement("details");
      item.appendChild(breakdown);
      addText(breakdown, "summary", "", "Exact node contributions");
      const list = document.createElement("ul");
      breakdown.appendChild(list);
      for (const line of lines) {
        const unit = line.units === "percentage-points" ? "%" : "";
        addText(list, "li", "", `Cell ${line.sourceIndex} · ${attributeLabel(line.attributeName)} [${line.attributeId}/${line.attributeParam}] · Native ${line.nativeBase}${unit} · Glyph +${line.baseAmplificationDelta}${unit} · Active conditional ${line.activeNativeConditional}${unit} · Effective ${line.effectiveAmount}${unit}`);
      }
    }
  }

  function formatPercentValue(value) {
    const rounded = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
    return `${value >= 0 ? "+" : ""}${rounded}%`;
  }

  function formatRawBonusValue(value, category) {
    if (category === "core" || FLAT_BONUS_CATEGORIES.has(category)) {
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

  function renderTotalStats(result) {
    const contributors = new Map();
    const glyphDestinations = new Map();
    for (const node of result.nodeEvaluations) {
      if (!node.allocated) continue;
      for (const attribute of node.attributes) {
        const key = attribute.category === "coreAttribute"
          ? `core:${CORE_ATTRIBUTE_NAMES[attribute.attributeName] || attribute.attributeName}`
          : attribute.category ? `raw:${attribute.category}` : null;
        if (!key) continue;
        if (Number.isFinite(attribute.unconditional) && attribute.unconditional !== 0) {
          addStatContribution(contributors, key, node.nodeId ?? node.nodeIndex, false);
        }
        if (attribute.conditional > 0 && attribute.conditionalApplied) {
          addStatContribution(contributors, key, node.nodeId ?? node.nodeIndex, true);
        }
      }
    }
    for (const primary of result.glyphEvaluations ?? []) {
      if (primary.status !== "active" || primary.kind === "amplification") continue;
      glyphDestinations.set(primary.category, primary);
      for (const { nodeId } of primary.contributions) {
        addStatContribution(contributors, `raw:${primary.category}`, nodeId, false);
      }
    }
    statContributors = new Map([...contributors].map(([key, nodes]) => [key, [...nodes.values()]]));
    clearStatHighlights();

    const entries = [];
    for (const [attributeName, amount] of Object.entries(result.verifiedParagonBonuses.coreAttributes)) {
      if (amount !== 0) entries.push({ key: `core:${attributeName}`, label: attributeName, value: formatAmplifiedCore(amount), flat: true });
    }
    for (const [category, totals] of Object.entries(result.verifiedParagonBonuses.rawBonuses)) {
      if (totals.total !== 0) {
        const primary = glyphDestinations.get(category);
        const glyphOnlyDisplay = primary && totals.unconditional + totals.conditional + (totals.amplification ?? 0) === 0
          ? formatGlyphPrimary(totals.total, primary.destination) : null;
        entries.push({ key: `raw:${category}`, label: RAW_BONUS_LABELS[category] || primary?.label || category,
          value: totals.total, flat: FLAT_BONUS_CATEGORIES.has(category), glyphOnlyDisplay });
      }
    }
    totalStatsList.replaceChildren();
    for (const entry of entries) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "total-stats-item";
      button.dataset.statKey = entry.key;
      const accessibleValue = entry.glyphOnlyDisplay ?? `${entry.value >= 0 ? "+" : ""}${entry.value}${entry.flat ? "" : "%"}`;
      button.setAttribute("aria-label", `${accessibleValue} ${entry.label}; highlight contributing nodes`);
      const label = document.createElement("span");
      label.textContent = entry.label;
      const value = document.createElement("strong");
      value.textContent = entry.glyphOnlyDisplay ?? `${entry.value >= 0 ? "+" : ""}${Number.isInteger(entry.value) ? entry.value : Number(entry.value.toFixed(2))}${entry.flat ? "" : "%"}`;
      button.append(label, value);
      button.addEventListener("pointerenter", () => highlightStatContributors(entry.key));
      button.addEventListener("pointerleave", clearStatHighlights);
      button.addEventListener("focus", () => highlightStatContributors(entry.key));
      button.addEventListener("blur", clearStatHighlights);
      item.appendChild(button);
      totalStatsList.appendChild(item);
    }
    totalStatsEmpty.hidden = entries.length !== 0;
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

  connectedToggle.addEventListener("click", () => {
    if (!inspectorMode) return;
    if (isConnectedMode()) {
      boardSelector.dispatchEvent(new Event("change"));
    } else {
      openConnectedMode();
    }
  });
  for (const [key, config] of Object.entries(BOARD_CONFIGS).slice(1)) {
    const item = document.createElement("li");
    const option = addText(item, "button", "board-picker-option", config.label);
    option.type = "button";
    option.dataset.boardId = key;
    addText(option, "span", "board-picker-option-status", "");
    boardPickerOptions.appendChild(item);
  }
  boardPickerOptions.addEventListener("click", event => {
    const option = event.target.closest("button:enabled");
    if (!option || !boardPicker.open) return;
    const boardId = option.dataset.boardId;
    const instanceId = `${boardId}-${crypto.getRandomValues(new Uint32Array(4)).join("-")}`;
    try {
      const candidate = attachBoard(boardResources, connectedLayout, allocatedNodeIds, boardPickerGate.id, boardId, instanceId);
      const padding = connectedViewPadding();
      const fit = panX === 0 && panY === (padding.top - padding.bottom) / 2 && zoom === fittedBoardZoom(padding);
      commitConnectedLayout(candidate, `${BOARD_CONFIGS[boardId].label} attached.`, fit);
      boardPicker.close();
    } catch (error) {
      boardPickerError.textContent = `Attachment rejected: ${error.message}`;
      boardPickerError.hidden = false;
    }
  });
  document.getElementById("board-picker-close").addEventListener("click", () => boardPicker.close());
  const boardDialogs = [boardPicker, boardManagement, glyphDialog];
  for (const dialog of boardDialogs) {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("wheel", event => {
      if (event.target === dialog) event.preventDefault();
    }, { passive: false });
  }
  boardPicker.addEventListener("close", () => {
    if (boardPicker.open) return;
    const { id } = boardPickerGate;
    boardPickerGate = null;
    const attachment = connectedHeaders.querySelector(`[data-attach-gate="${CSS.escape(id)}"]`);
    const target = attachment || boardNodes.get(id)?.marker;
    target?.focus({ preventScroll: true });
    if (target && !target.matches(":focus-visible")) hideTooltip();
  });
  document.getElementById("board-management-close").addEventListener("click", () => boardManagement.close());
  boardManagement.addEventListener("close", () => {
    if (boardManagement.open) return;
    const target = managementFocusGate ? boardNodes.get(managementFocusGate)?.marker : managementButton(managedInstance);
    managedInstance = null;
    pendingBoardReset = null;
    if (!boardPicker.open) target?.focus({ preventScroll: true });
  });
  managementActions.addEventListener("click", event => {
    const button = event.target.closest("button:enabled");
    if (!button || !boardManagement.open) return;
    const board = connectedLayout.boards.find(instance => instance.instanceId === managedInstance);
    try {
      if (button.hasAttribute("data-reset-board")) previewBoardReset(board);
      else if (button.hasAttribute("data-cancel-reset")) {
        pendingBoardReset = null;
        renderManagementActions(board, true);
      } else if (button.hasAttribute("data-confirm-reset")) commitBoardReset(board);
      else if (button.hasAttribute("data-attach-gate")) {
        boardManagement.close();
        openBoardPicker(boardNodes.get(button.dataset.attachGate));
      } else if (button.hasAttribute("data-remove-board")) {
        const candidate = removeConnectedBoard(boardResources, connectedLayout, allocatedNodeIds, board.instanceId);
        if (!window.confirm(`Remove ${boardName(board.instanceId)}?`)) return;
        managementFocusGate = connectedLayout.attachments.find(edge => edge.childInstanceId === board.instanceId).parentGateId;
        commitConnectedLayout(candidate, `${boardName(board.instanceId)} removed.`, false);
        boardManagement.close();
      } else {
        rotateBoardFromControl(board, Number(button.dataset.rotationStep));
        renderManagementActions(connectedLayout.boards.find(instance => instance.instanceId === board.instanceId));
        managementActions.querySelector(`[data-rotation-step="${button.dataset.rotationStep}"]`).focus({ preventScroll: true });
      }
    } catch (error) {
      boardChangeError(error, false);
      showManagementFeedback(error.message);
    }
  });
  connectedHeaders.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-attach-gate")) {
      openBoardPicker(boardNodes.get(button.dataset.attachGate));
      return;
    }
    const { instanceId } = button.closest(".connected-board-header").dataset;
    if (button.hasAttribute("data-manage-board")) {
      openBoardManagement(instanceId);
      return;
    }
    const board = connectedLayout.boards.find(instance => instance.instanceId === instanceId);
    try {
      rotateBoardFromControl(board, Number(button.dataset.rotationStep));
    } catch (error) {
      boardChangeError(error);
    }
  });
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
      if (isConnectedMode()) setConnectedLocation(false);
      renderBoard(boardKey, resource.board, resource.database);
    } catch (error) {
      console.error("Could not switch Paragon boards:", error);
      setStatus(`Could not render selected board. (${error.message})`, true);
    }
  });
  rotationSelect.addEventListener("change", () => {
    if (!currentBoardConfig.requiresEntryGate) {
      rotationSelect.value = "0";
      return;
    }
    const rotation = Number(rotationSelect.value);
    if (!BOARD_ROTATIONS.includes(rotation) || rotation === boardRotation) return;
    boardRotation = rotation;
    hideTooltip();
    renderBoardOrientation();
    renderConnections(allocatedConnectionLayer, allocatedNodeIds);
    saveAllocation("Rotation");
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
    if (isConnectedMode()) {
      fitBoardView();
      return;
    }
    zoom = Math.min(1, (stage.clientWidth - 48) / boardPixelWidth, (stage.clientHeight - 48) / boardPixelHeight);
    applyTransform();
  });

  totalStats.addEventListener("toggle", () => {
    if (!totalStats.open) clearStatHighlights();
  });

  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.target.closest(".connected-board-header, .gate-attachment")) return;
    setZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".node, .connected-board-header, .gate-attachment")) return;
    if (isConnectedMode()) hideTooltip();
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
    for (const dialog of boardDialogs) if (dialog.open) positionBoardDialog(dialog);
  });
  window.addEventListener("scroll", () => {
    for (const dialog of boardDialogs) if (dialog.open) positionBoardDialog(dialog);
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
      if (inspectorMode && window.location.hash !== "#connected") {
        renderBoard("board00", startingBoard.board, startingBoard.database);
      }
    } catch (error) {
      console.error("Could not load the starting Paragon board:", error);
      setStatus(`Could not load Board 00 data. Serve the project over HTTP and check the local JSON files. (${error.message})`, true);
      return;
    }

    await Promise.all(Object.entries(BOARD_CONFIGS).slice(1).map(async ([boardKey, config]) => {
      try {
        const resource = await loadBoardResource(boardKey);
        boardResources.set(boardKey, resource);
        boardSelector.querySelector(`option[value="${boardKey}"]`).disabled = false;
      } catch (error) {
        console.error(`Could not load ${config.label}:`, error);
        setAllocationMessage(`${config.label} could not be loaded. (${error.message})`, true);
      }
    }));
    connectedToggle.disabled = false;
    if (!inspectorMode || window.location.hash === "#connected") openConnectedMode();
  })();
})();
