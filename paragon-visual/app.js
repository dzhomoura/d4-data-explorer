import { calculateParagonBonuses } from "./paragon-calculator.js";

(() => {
  "use strict";

  const CELL_SIZE = 36;
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.15;
  const STORAGE_KEY = "d4-paragon-paladin-00-v1";
  const EXTERNAL_ATTRIBUTES_STORAGE_KEY = "d4-paragon-paladin-00-external-attributes-v1";
  const BUILD_SCHEMA_VERSION = 1;
  const POINT_COSTS = Object.freeze({
    start: 0,
    normal: 1,
    magic: 1,
    rare: 1,
    socket: 1,
    gate: 1,
    default: 1
  });

  const stage = document.getElementById("board-stage");
  const frame = document.getElementById("board-frame");
  const status = document.getElementById("board-status");
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
    maximumLifePercent: {
      unconditional: document.getElementById("raw-life-base"),
      conditional: document.getElementById("raw-life-conditional"),
      total: document.getElementById("raw-life-total")
    },
    totalArmorPercent: {
      unconditional: document.getElementById("raw-armor-base"),
      conditional: document.getElementById("raw-armor-conditional"),
      total: document.getElementById("raw-armor-total")
    }
  };
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
    Damage_Type_Percent_Bonus: "Damage bonus"
  };
  const KIND_LABELS = {
    normal: "Normal",
    magic: "Magic",
    rare: "Rare",
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
  let startNodeId = null;
  let allocatedConnectionLayer = null;
  let boardIdentity = null;
  let currentBoardDefinition = null;
  let currentNodeDatabase = null;
  let externalAttributes = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
  let currentCalculation = null;

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
    if (category === "coreAttribute") return `${sign}${value}`;
    return `${sign}${Number.isInteger(value) ? value : value.toFixed(1)}%`;
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
            : {
              damage: "Damage",
              damageToElites: "Damage to Elites",
              maximumLifePercent: "Maximum Life",
              totalArmorPercent: "Total Armor"
            }[calculation.category];
          const basePrefix = calculation.provenance === "verified-game-formula"
            ? "Verified bonus"
            : calculation.conditional > 0 ? "Base bonus" : "Raw bonus";
          addText(
            row,
            "p",
            "tooltip-bonus tooltip-bonus--verified",
            `${basePrefix}: ${formatBonusValue(calculation.unconditional, calculation.category)} ${valueLabel}`
          );
          if (calculation.conditional > 0) {
            addText(
              row,
              "p",
              "tooltip-bonus tooltip-bonus--conditional",
              `Additional threshold bonus: ${formatBonusValue(calculation.conditional, calculation.category)} ${valueLabel}`
            );
            const threshold = calculation.threshold;
            if (threshold?.resolved) {
              const thresholdText = `${threshold.requiredAttribute} ${threshold.currentValue} / ${threshold.requiredValue} · ${threshold.satisfied ? "satisfied" : `${threshold.remaining} needed`}`;
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
                    ? "Formula-derived value"
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
        const label = evaluation?.resolved
          ? `${threshold.name}: ${evaluation.requiredAttribute} ${evaluation.currentValue}/${evaluation.requiredValue} · ${evaluation.satisfied ? "met" : "not met"}`
          : `${threshold.name}: not evaluated`;
        const className = evaluation?.resolved
          ? `tooltip-threshold${evaluation.satisfied ? " tooltip-threshold--met" : ""}`
          : "tooltip-threshold tooltip-threshold--unresolved";
        addText(list, "li", className, label);
      }
      thresholds.appendChild(list);
      addText(thresholds, "p", "tooltip-formula-note", "Only the in-game verified starting-board requirement is evaluated.");
      tooltip.appendChild(thresholds);
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

  function renderBoard(board, database) {
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
    if (startingNodes.length !== 1) {
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
    startNodeId = startingNodes[0].id;
    allocatedNodeIds = new Set([startNodeId]);
    boardIdentity = {
      identifier: board.__fileName__,
      snoId: board.__snoID__,
      sourceRevision: database.source.commit
    };
    currentBoardDefinition = board;
    currentNodeDatabase = database;

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
    setStatus(`${width} × ${width} board · ${entries.slice(0, width * width).filter(Boolean).length} occupied nodes · ${nodeDefinitions.size} definitions`);
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

  function getReachableAllocatedNodeIds(allocatedIds) {
    if (startNodeId === null || !allocatedIds.has(startNodeId)) return new Set();
    const reachable = new Set([startNodeId]);
    const pending = [startNodeId];
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

  function validateAllocatedNodeIndices(indices) {
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
    if (!validated.has(startNodeId)) {
      throw new Error("The allocation does not include the starting node.");
    }

    const reachable = getReachableAllocatedNodeIds(validated);
    if (reachable.size !== validated.size) {
      throw new Error("The allocation contains nodes disconnected from the starting node.");
    }
    return validated;
  }

  function restoreSavedAllocation() {
    let serialized;
    try {
      serialized = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      setSaveStatus("Storage unavailable", "error");
      setAllocationMessage(`Could not read saved allocation: ${error.message}`, true);
      return;
    }

    if (serialized === null) {
      setSaveStatus("Not saved yet", "unsaved");
      setAllocationMessage("Starting node is active.");
      return;
    }

    let restored;
    try {
      restored = validateAllocatedNodeIndices(JSON.parse(serialized));
    } catch (error) {
      allocatedNodeIds = new Set([startNodeId]);
      updateAllocationDisplay();
      setSaveStatus("Invalid save rejected", "error");
      setAllocationMessage(`Saved allocation rejected; starting node only. ${error.message}`, true);
      return;
    }

    allocatedNodeIds = restored;
    updateAllocationDisplay();
    setSaveStatus("Saved locally", "saved");
    setAllocationMessage("Restored saved allocation.");
  }

  function saveAllocation() {
    const indices = [...allocatedNodeIds].sort((a, b) => a - b);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(indices));
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
      externalAttributes
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
    for (const [category, totals] of Object.entries(categories)) {
      const displays = rawBonusDisplays[category];
      displays.unconditional.textContent = formatPercentValue(totals.unconditional);
      displays.conditional.textContent = formatPercentValue(totals.conditional);
      displays.total.textContent = formatPercentValue(totals.total);
    }

    if (activeTooltipMarker) {
      const node = boardNodes.get(Number(activeTooltipMarker.dataset.nodeIndex));
      if (node) showTooltip(activeTooltipMarker, node.definition);
    }
  }

  function formatPercentValue(value) {
    const rounded = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
    return `${value >= 0 ? "+" : ""}${rounded}%`;
  }

  function allocateNode(id) {
    if (allocatedNodeIds.has(id)) {
      setAllocationMessage("That node is already allocated.");
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
    if (id === startNodeId) {
      setAllocationMessage("The starting node cannot be refunded.", true);
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
    if (startNodeId === null) return;
    allocatedNodeIds = new Set([startNodeId]);
    updateAllocationDisplay();
    if (saveAllocation()) setAllocationMessage("Allocation reset. Starting node is active.");
  }

  allocationResetButton.addEventListener("click", resetAllocation);
  exportBuildButton.addEventListener("click", exportBuild);
  importBuildButton.addEventListener("click", () => buildFileInput.click());
  buildFileInput.addEventListener("change", async () => {
    const file = buildFileInput.files?.[0];
    if (file) await importBuildFile(file);
    buildFileInput.value = "";
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

  Promise.all([
    fetch("../paladin-board-00.json"),
    fetch("node-data.json")
  ])
    .then(async ([boardResponse, databaseResponse]) => {
      if (!boardResponse.ok) throw new Error(`Board request failed (${boardResponse.status}).`);
      if (!databaseResponse.ok) throw new Error(`Node database request failed (${databaseResponse.status}).`);
      return Promise.all([boardResponse.json(), databaseResponse.json()]);
    })
    .then(([board, database]) => renderBoard(board, database))
    .catch((error) => {
      console.error("Could not load the Paragon board:", error);
      setStatus(`Could not load board data. Serve the project over HTTP and check the local JSON files. (${error.message})`, true);
    });
})();
