import { BOARD_ROTATIONS, rotateBoardPoint } from "./board-rotation.js";
import { calculateParagonBonuses } from "./paragon-calculator.js";

const SOURCE_REVISION = "75e619f0d90a0951945747f45feef59c076a5db0";
const BOARD_IDS = ["board00", "board01"];
const BOARD_SNOS = [2436481, 2436511];
const WIDTH = 21;
const GATE_SNO = 994337;
const DIRECTIONS = {
  North: { x: 0, y: -1, opposite: "South" },
  East: { x: 1, y: 0, opposite: "West" },
  South: { x: 0, y: 1, opposite: "North" },
  West: { x: -1, y: 0, opposite: "East" }
};
const ATTRIBUTES = ["Strength", "Intelligence", "Willpower", "Dexterity"];

export const CONNECTED_SAVE_KEY = "d4-paragon-paladin-connected-v1";
export const DEFAULT_ATTACHMENT = Object.freeze({
  startingGateIndex: 10,
  castleEntryIndex: 430,
  castleRotation: 0
});

function nodeId(boardId, sourceIndex) {
  return `${boardId}:${sourceIndex}`;
}

function project(sourceIndex, rotation) {
  return rotateBoardPoint(sourceIndex % WIDTH, Math.floor(sourceIndex / WIDTH), WIDTH, rotation);
}

function gateDirection({ x, y }) {
  const midpoint = Math.floor(WIDTH / 2);
  if (x === midpoint && y === 0) return "North";
  if (x === WIDTH - 1 && y === midpoint) return "East";
  if (x === midpoint && y === WIDTH - 1) return "South";
  if (x === 0 && y === midpoint) return "West";
  return null;
}

export function getAttachmentGates(board, rotation = 0) {
  return board.arEntries.flatMap((entry, sourceIndex) => {
    if (entry?.__raw__ !== GATE_SNO || entry.name !== "Generic_Gate") return [];
    const direction = gateDirection(project(sourceIndex, rotation));
    return direction ? [{ sourceIndex, direction }] : [];
  });
}

// The prototype places two facing edge gates one world-grid step apart.
export function buildConnectedLayout(resources, attachment) {
  const boards = BOARD_IDS.map((id, equipIndex) => {
    const resource = resources.get(id);
    if (resource?.board.__snoID__ !== BOARD_SNOS[equipIndex]
      || resource.board.nWidth !== WIDTH || resource.board.arEntries.length !== WIDTH * WIDTH
      || resource.database.source.boardSnoId !== BOARD_SNOS[equipIndex]
      || resource.database.source.commit !== SOURCE_REVISION) {
      throw new Error("Connected Boards requires the pinned Starting Board and Castle definitions.");
    }
    return { ...resource, id, equipIndex };
  });
  const [starting, castle] = boards;
  const { startingGateIndex, castleEntryIndex, castleRotation } = attachment ?? {};
  if (!BOARD_ROTATIONS.includes(castleRotation)) throw new Error("Choose a supported Castle rotation.");
  const startGate = getAttachmentGates(starting.board).find(gate => gate.sourceIndex === startingGateIndex);
  const entryGate = getAttachmentGates(castle.board, castleRotation).find(gate => gate.sourceIndex === castleEntryIndex);
  if (!startGate || !entryGate || DIRECTIONS[startGate.direction].opposite !== entryGate.direction) {
    throw new Error("Choose a Castle entry gate that faces the Starting Board gate.");
  }
  const startPoint = project(startingGateIndex, 0);
  const entryPoint = project(castleEntryIndex, castleRotation);
  const direction = DIRECTIONS[startGate.direction];
  const offset = {
    x: startPoint.x + direction.x - entryPoint.x,
    y: startPoint.y + direction.y - entryPoint.y
  };
  const minX = Math.min(0, offset.x);
  const minY = Math.min(0, offset.y);
  const width = WIDTH + Math.abs(offset.x);
  const height = WIDTH + Math.abs(offset.y);
  starting.origin = { x: -minX, y: -minY };
  castle.origin = { x: offset.x - minX, y: offset.y - minY };

  const nodes = new Map();
  const graph = new Map();
  const roots = [];
  for (const board of boards) {
    const rotation = board.equipIndex === 0 ? 0 : castleRotation;
    const definitions = new Map(board.database.nodes.map(definition => [definition.name, definition]));
    for (const [sourceIndex, entry] of board.board.arEntries.entries()) {
      if (!entry) continue;
      const definition = definitions.get(entry.name);
      if (definition?.snoId !== entry.__raw__) throw new Error("Connected node identity does not match its source.");
      const id = nodeId(board.id, sourceIndex);
      const point = project(sourceIndex, rotation);
      nodes.set(id, {
        id, boardId: board.id, sourceIndex, definition,
        displayPosition: { x: point.x + board.origin.x, y: point.y + board.origin.y },
        gateDirection: definition.isGate ? gateDirection(point) : null
      });
      if (definition.kind === "start") roots.push(id);
      const x = sourceIndex % WIDTH;
      const neighbors = [
        x > 0 ? sourceIndex - 1 : -1,
        x < WIDTH - 1 ? sourceIndex + 1 : -1,
        sourceIndex - WIDTH,
        sourceIndex + WIDTH
      ];
      graph.set(id, neighbors.filter(index => board.board.arEntries[index]).map(index => nodeId(board.id, index)));
    }
  }

  if (roots.length !== 1 || nodes.get(roots[0]).boardId !== starting.id) {
    throw new Error("Connected Boards requires one Starting Board root.");
  }
  const bridge = [nodeId(starting.id, startingGateIndex), nodeId(castle.id, castleEntryIndex)];
  graph.get(bridge[0]).push(bridge[1]);
  graph.get(bridge[1]).push(bridge[0]);
  return { boards, nodes, graph, root: roots[0], bridge, width, height };
}

export function reachableAllocations(graph, allocated, root) {
  const reached = new Set();
  if (!allocated.has(root)) return reached;
  reached.add(root);
  const queue = [root];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const next of graph.get(queue[cursor])) {
      if (!allocated.has(next) || reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  return reached;
}

export function validateConnectedAllocation(layout, allocated) {
  if (reachableAllocations(layout.graph, allocated, layout.root).size !== allocated.size
    || !allocated.has(layout.root)) {
    throw new Error("The allocation must stay connected to the Starting Board's starting node.");
  }
}

export function readConnectedSave(resources, saved) {
  if (saved?.version !== 1 || saved.sourceRevision !== SOURCE_REVISION || !Array.isArray(saved.allocations)) {
    throw new Error("The Connected Boards save has an unsupported schema or source revision.");
  }
  const layout = buildConnectedLayout(resources, saved.attachment);
  const allocated = new Set();
  for (const pair of saved.allocations) {
    if (!Array.isArray(pair) || pair.length !== 2 || !BOARD_IDS.includes(pair[0]) || !Number.isInteger(pair[1])) {
      throw new Error("Invalid board and source index in the Connected Boards save.");
    }
    const id = nodeId(...pair);
    if (!layout.nodes.has(id) || allocated.has(id)) throw new Error("Unknown or duplicate saved node.");
    allocated.add(id);
  }
  validateConnectedAllocation(layout, allocated);
  return { layout, attachment: saved.attachment, allocated };
}

export function writeConnectedSave(layout, attachment, allocated) {
  validateConnectedAllocation(layout, allocated);
  const allocations = [...allocated].sort().map(id => {
    const { boardId, sourceIndex } = layout.nodes.get(id);
    return [boardId, sourceIndex];
  });
  return { version: 1, sourceRevision: SOURCE_REVISION, attachment, allocations };
}

export function calculateConnectedBonuses(layout, allocated, externalAttributes) {
  validateConnectedAllocation(layout, allocated);
  const indices = new Map(BOARD_IDS.map(id => [id, new Set()]));
  for (const id of allocated) {
    const node = layout.nodes.get(id);
    indices.get(node.boardId).add(node.sourceIndex);
  }

  const evaluate = (board, external) => calculateParagonBonuses(
    board.board, board.database, indices.get(board.id), external, { boardEquipIndex: board.equipIndex }
  );
  const initial = layout.boards.map(board => evaluate(board));
  // Both supported boards have unconditional core gains. Reject a dependency
  // this two-pass wrapper cannot evaluate if their evidence changes.
  for (const result of initial) {
    if (result.nodeEvaluations.some(node => node.allocated && node.attributes.some(attribute =>
      attribute.category === "coreAttribute" && attribute.conditional !== 0
    ))) {
      throw new Error("Connected thresholds do not support conditional core attribute gains.");
    }
  }
  const coreAttributes = Object.fromEntries(ATTRIBUTES.map(name => [
    name, initial.reduce((sum, result) => sum + result.verifiedParagonBonuses.coreAttributes[name], 0)
  ]));
  const totalAttributes = Object.fromEntries(ATTRIBUTES.map(name => [name, externalAttributes[name] + coreAttributes[name]]));
  const rawBonuses = {};
  const nodeEvaluations = [];
  let unresolvedBonusCount = 0;
  for (const [index, board] of layout.boards.entries()) {
    const external = Object.fromEntries(ATTRIBUTES.map(name => [
      name, externalAttributes[name] + initial[1 - index].verifiedParagonBonuses.coreAttributes[name]
    ]));
    const result = evaluate(board, external);
    unresolvedBonusCount += result.unresolvedBonusCount;
    for (const node of result.nodeEvaluations) {
      nodeEvaluations.push({ ...node, nodeId: nodeId(board.id, node.nodeIndex) });
    }
    for (const [category, totals] of Object.entries(result.verifiedParagonBonuses.rawBonuses)) {
      const combined = rawBonuses[category] ??= { unconditional: 0, conditional: 0, total: 0 };
      combined.unconditional += totals.unconditional;
      combined.conditional += totals.conditional;
      combined.total = combined.unconditional + combined.conditional;
    }
  }
  return {
    totalAttributes, nodeEvaluations, unresolvedBonusCount,
    verifiedParagonBonuses: {
      coreAttributes, rawBonuses,
      totalCoreAttributes: Object.values(coreAttributes).reduce((sum, value) => sum + value, 0)
    }
  };
}
