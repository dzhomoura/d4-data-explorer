import { BOARD_ROTATIONS, rotateBoardPoint } from "./board-rotation.js";
import { calculateParagonBoards } from "./paragon-calculator.js";
import { getGlyphSocketSourceIndex, isGlyphConfiguration } from "./paladin-glyph-catalogue.js";
import { BOARD_SNO_IDS } from "./shared-node-definitions.js";

const SOURCE_REVISION = "75e619f0d90a0951945747f45feef59c076a5db0";
const STARTING_BOARD_ID = "board00";
const CASTLE_BOARD_ID = "board01";
export const MAX_BOARDS = 5;
const WIDTH = 21;
const GATE_SNO = 994337;
const DIRECTIONS = {
  North: { x: 0, y: -1, opposite: "South" },
  East: { x: 1, y: 0, opposite: "West" },
  South: { x: 0, y: 1, opposite: "North" },
  West: { x: -1, y: 0, opposite: "East" }
};

export const CONNECTED_SAVE_KEY = "d4-paragon-paladin-connected-v1";
export const CONNECTED_SAVE_KEY_V2 = "d4-paragon-paladin-connected-v2";
export const DEFAULT_ATTACHMENT = Object.freeze({
  startingGateIndex: 10,
  castleEntryIndex: 430,
  castleRotation: 0
});

function nodeId(instanceId, sourceIndex) {
  return `${instanceId}:${sourceIndex}`;
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

function resolveBoardInstances(resources, instances) {
  if (!Array.isArray(instances) || instances.length < 1 || instances.length > MAX_BOARDS) {
    throw new Error("Connected Boards requires between one and five boards, including the Starting Board.");
  }
  const boards = new Array(instances.length);
  const instanceIds = new Set();
  const boardIds = new Set();
  for (const instance of instances) {
    const { instanceId, boardId, placementIndex, rotation, incoming } = instance ?? {};
    if (typeof instanceId !== "string" || !/^[A-Za-z0-9_-]+$/.test(instanceId) || instanceIds.has(instanceId)) {
      throw new Error("Board instance IDs must be valid and unique.");
    }
    if (!Number.isInteger(placementIndex) || placementIndex < 0
      || placementIndex >= boards.length || boards[placementIndex]) {
      throw new Error("Board placement indices must be unique and contiguous from zero.");
    }
    if (typeof boardId !== "string") throw new Error("Choose a pinned Paladin board definition.");
    if (boardIds.has(boardId)) throw new Error("A board definition can only be placed once.");
    if ((boardId === STARTING_BOARD_ID) !== (placementIndex === 0)) {
      throw new Error("The Starting Board must be the only board at placement index zero.");
    }
    if (!BOARD_ROTATIONS.includes(rotation)) throw new Error("Choose a supported board rotation.");
    if (placementIndex === 0 && (rotation !== 0 || incoming !== null)) {
      throw new Error("The Starting Board is fixed and cannot have an incoming attachment.");
    }
    if (placementIndex !== 0 && !incoming) {
      throw new Error("Each additional board must have an incoming attachment.");
    }

    const resource = resources.get(boardId);
    const snoId = BOARD_SNO_IDS[boardId];
    if (!Number.isInteger(snoId) || resource?.board?.__snoID__ !== snoId
      || resource.board.nWidth !== WIDTH
      || !Array.isArray(resource.board.arEntries) || resource.board.arEntries.length !== WIDTH * WIDTH
      || resource.database?.source?.boardSnoId !== snoId
      || resource.database.source.commit !== SOURCE_REVISION) {
      throw new Error("Connected Boards requires a pinned Paladin board definition.");
    }
    const gates = getAttachmentGates(resource.board, rotation);
    if (placementIndex === 0 ? gates.length !== 1 || gates[0].direction !== "North" : gates.length !== 4) {
      throw new Error("Board gates do not match the pinned Paladin gate geometry.");
    }
    boards[placementIndex] = {
      board: resource.board,
      database: resource.database,
      instanceId,
      boardId,
      placementIndex,
      rotation,
      incoming: incoming === null ? null : { ...incoming },
      gates: new Map(gates.map(gate => [gate.sourceIndex, gate]))
    };
    instanceIds.add(instanceId);
    boardIds.add(boardId);
  }
  return boards;
}

function placeBoardTree(boards) {
  const boardsByInstance = new Map(boards.map(board => [board.instanceId, board]));
  const attachments = [];
  const gateOccupancy = new Map();
  boards[0].worldOrigin = { x: 0, y: 0 };
  for (const child of boards.slice(1)) {
    const { parentInstanceId, parentGateIndex, entryGateIndex } = child.incoming;
    const parent = boardsByInstance.get(parentInstanceId);
    if (!parent) throw new Error("Attachment parent is missing from the layout.");
    // Requiring an earlier parent makes cycles impossible and guarantees a path to the root.
    if (parent.placementIndex >= child.placementIndex) {
      throw new Error("Attachment parent must precede its child. Cycles are invalid.");
    }
    const exit = parent.gates.get(parentGateIndex);
    const entry = child.gates.get(entryGateIndex);
    if (!exit || !entry || DIRECTIONS[exit.direction].opposite !== entry.direction) {
      throw new Error("Choose attachment gates that face each other.");
    }
    const parentGateId = nodeId(parentInstanceId, parentGateIndex);
    const entryGateId = nodeId(child.instanceId, entryGateIndex);
    if (gateOccupancy.has(parentGateId) || gateOccupancy.has(entryGateId)) {
      throw new Error("A gate cannot be used for more than one attachment.");
    }

    // The two facing gates sit one world-grid step apart.
    const parentPoint = project(parentGateIndex, parent.rotation);
    const childPoint = project(entryGateIndex, child.rotation);
    const direction = DIRECTIONS[exit.direction];
    const x = parent.worldOrigin.x + parentPoint.x + direction.x - childPoint.x;
    const y = parent.worldOrigin.y + parentPoint.y + direction.y - childPoint.y;
    if (boards.slice(0, child.placementIndex).some(board =>
      Math.abs(board.worldOrigin.x - x) < WIDTH && Math.abs(board.worldOrigin.y - y) < WIDTH
    )) {
      throw new Error("Connected board footprints cannot overlap.");
    }
    child.worldOrigin = { x, y };
    const attachment = {
      parentInstanceId, parentGateIndex, childInstanceId: child.instanceId, entryGateIndex, parentGateId, entryGateId
    };
    attachments.push(attachment);
    gateOccupancy.set(parentGateId, attachment);
    gateOccupancy.set(entryGateId, attachment);
  }
  return { attachments, gateOccupancy };
}

export function buildBoardInstanceLayout(resources, instances) {
  const boards = resolveBoardInstances(resources, instances);
  const { attachments, gateOccupancy } = placeBoardTree(boards);
  const xs = boards.map(board => board.worldOrigin.x);
  const ys = boards.map(board => board.worldOrigin.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX + WIDTH;
  const height = Math.max(...ys) - minY + WIDTH;

  const nodes = new Map();
  const graph = new Map();
  const roots = [];
  for (const board of boards) {
    const { rotation, instanceId, boardId, worldOrigin } = board;
    board.origin = { x: worldOrigin.x - minX, y: worldOrigin.y - minY };
    const definitions = new Map(board.database.nodes.map(definition => [definition.name, definition]));
    for (const [sourceIndex, entry] of board.board.arEntries.entries()) {
      if (!entry) continue;
      const definition = definitions.get(entry.name);
      if (definition?.snoId !== entry.__raw__) throw new Error("Connected node identity does not match its source.");
      const id = nodeId(instanceId, sourceIndex);
      const point = project(sourceIndex, rotation);
      nodes.set(id, {
        id, instanceId, boardId, sourceIndex, definition,
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
      graph.set(id, neighbors.filter(index => board.board.arEntries[index]).map(index => nodeId(instanceId, index)));
    }
  }

  if (roots.length !== 1 || nodes.get(roots[0]).instanceId !== boards[0].instanceId) {
    throw new Error("Connected Boards requires one Starting Board root.");
  }
  for (const { parentGateId, entryGateId } of attachments) {
    graph.get(parentGateId).push(entryGateId);
    graph.get(entryGateId).push(parentGateId);
  }
  return { boards, attachments, gateOccupancy, nodes, graph, root: roots[0], width, height };
}

export function createStartingLayout(resources) {
  return buildBoardInstanceLayout(resources, [
    { instanceId: STARTING_BOARD_ID, boardId: STARTING_BOARD_ID, placementIndex: 0, rotation: 0, incoming: null }
  ]);
}

export function attachBoard(resources, layout, allocated, parentGateId, boardId, instanceId) {
  const gate = layout.nodes.get(parentGateId);
  if (!gate?.gateDirection) throw new Error("Choose a valid attachment gate.");
  if (layout.gateOccupancy.has(parentGateId)) throw new Error("This gate already belongs to an attachment.");
  if (layout.boards.length >= MAX_BOARDS) throw new Error("All five board positions are occupied.");
  if (layout.boards.some(board => board.boardId === boardId)) throw new Error("This board is already equipped.");
  const resource = resources.get(boardId);
  if (!resource) throw new Error("This board's data is unavailable.");
  const entry = getAttachmentGates(resource.board).find(candidate => candidate.direction === DIRECTIONS[gate.gateDirection].opposite);
  const candidate = buildBoardInstanceLayout(resources, [...layout.boards, {
    instanceId, boardId, placementIndex: layout.boards.length, rotation: 0,
    incoming: { parentInstanceId: gate.instanceId, parentGateIndex: gate.sourceIndex, entryGateIndex: entry?.sourceIndex }
  }]);
  validateConnectedAllocation(candidate, allocated);
  return candidate;
}

export function rotateConnectedBoard(resources, layout, allocated, instanceId, step) {
  const board = layout.boards.find(instance => instance.instanceId === instanceId);
  if (!board?.incoming) throw new Error("The Starting Board is fixed.");
  if (step !== 90 && step !== -90) throw new Error("Rotate a board by one quarter turn.");
  const { parentInstanceId, parentGateIndex } = board.incoming;
  const parentGate = layout.nodes.get(nodeId(parentInstanceId, parentGateIndex));
  const rotation = (board.rotation + step + 360) % 360;
  const entry = getAttachmentGates(board.board, rotation)
    .find(candidate => candidate.direction === DIRECTIONS[parentGate.gateDirection].opposite);
  const rotated = new Set([instanceId]);
  // Placement order puts parents before children. Descendants turn with their source gate seams.
  const instances = layout.boards.map(instance => {
    if (instance.instanceId === instanceId) {
      return { ...instance, rotation, incoming: { ...instance.incoming, entryGateIndex: entry?.sourceIndex } };
    }
    if (!rotated.has(instance.incoming?.parentInstanceId)) return instance;
    rotated.add(instance.instanceId);
    return { ...instance, rotation: (instance.rotation + step + 360) % 360 };
  });
  const candidate = buildBoardInstanceLayout(resources, instances);
  validateConnectedAllocation(candidate, allocated);
  return candidate;
}

export function removeConnectedBoard(resources, layout, allocated, instanceId) {
  const board = layout.boards.find(instance => instance.instanceId === instanceId);
  if (!board?.incoming) throw new Error("The Starting Board cannot be removed.");
  if (layout.attachments.some(attachment => attachment.parentInstanceId === instanceId)) {
    throw new Error("Remove attached child boards before removing this board.");
  }
  if ([...allocated].some(id => layout.nodes.get(id)?.instanceId === instanceId)) {
    throw new Error("Refund this board's allocated nodes before removing it.");
  }
  const instances = layout.boards.filter(instance => instance.instanceId !== instanceId)
    .map((instance, placementIndex) => ({ ...instance, placementIndex }));
  const candidate = buildBoardInstanceLayout(resources, instances);
  validateConnectedAllocation(candidate, allocated);
  return candidate;
}

// Adapt the version 1 Starting + Castle draft without changing its identities or geometry.
export function buildConnectedLayout(resources, attachment) {
  const { startingGateIndex, castleEntryIndex, castleRotation } = attachment ?? {};
  const layout = buildBoardInstanceLayout(resources, [
    { instanceId: STARTING_BOARD_ID, boardId: STARTING_BOARD_ID, placementIndex: 0, rotation: 0, incoming: null },
    {
      instanceId: CASTLE_BOARD_ID,
      boardId: CASTLE_BOARD_ID,
      placementIndex: 1,
      rotation: castleRotation,
      incoming: { parentInstanceId: STARTING_BOARD_ID, parentGateIndex: startingGateIndex, entryGateIndex: castleEntryIndex }
    }
  ]);
  const { parentGateId, entryGateId } = layout.attachments[0];
  return { ...layout, bridge: [parentGateId, entryGateId] };
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

export function planConnectedBoardReset(layout, allocated, instanceId) {
  if (!layout.boards.some(board => board.instanceId === instanceId)) {
    throw new Error("Choose an equipped board.");
  }
  const candidate = new Set([...allocated].filter(id =>
    id === layout.root || layout.nodes.get(id).instanceId !== instanceId));
  const reached = reachableAllocations(layout.graph, candidate, layout.root);
  const dependentBoards = new Set([...candidate].filter(id => !reached.has(id))
    .map(id => layout.nodes.get(id).instanceId));
  if (!dependentBoards.size) validateConnectedAllocation(layout, candidate);
  return { candidate, refunded: allocated.size - candidate.size, dependentBoards };
}

function hasGlyphSocket(layout, instanceId) {
  const board = layout.boards.find(instance => instance.instanceId === instanceId);
  if (!board) return false;
  const index = getGlyphSocketSourceIndex(board.board);
  return index !== null && layout.nodes.get(nodeId(instanceId, index))?.definition.hasSocket === true;
}

export function configureConnectedGlyph(layout, glyphs, instanceId, configuration) {
  if (!hasGlyphSocket(layout, instanceId)) throw new Error("Choose an equipped board with a glyph socket.");
  if (configuration !== null && !isGlyphConfiguration(configuration)) {
    throw new Error("Choose a Paladin glyph and a valid planner level.");
  }
  const next = new Map(glyphs);
  if (configuration === null) next.delete(instanceId);
  else next.set(instanceId, { snoId: configuration.snoId, level: configuration.level });
  return next;
}

export function retainConnectedGlyphs(layout, glyphs) {
  return new Map(layout.boards.filter(board => glyphs.has(board.instanceId))
    .map(board => [board.instanceId, glyphs.get(board.instanceId)]));
}

export function readConnectedSave(resources, saved) {
  if (saved?.version !== 1 || saved.sourceRevision !== SOURCE_REVISION || !Array.isArray(saved.allocations)) {
    throw new Error("The Connected Boards save has an unsupported schema or source revision.");
  }
  const layout = buildConnectedLayout(resources, saved.attachment);
  const allocated = new Set();
  for (const pair of saved.allocations) {
    if (!Array.isArray(pair) || pair.length !== 2
      || (pair[0] !== STARTING_BOARD_ID && pair[0] !== CASTLE_BOARD_ID) || !Number.isInteger(pair[1])) {
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
  const [starting, castle] = layout.boards;
  if (!isPrototypeLayout(layout) || starting.instanceId !== STARTING_BOARD_ID || castle.instanceId !== CASTLE_BOARD_ID
    || attachment?.startingGateIndex !== castle.incoming.parentGateIndex
    || attachment?.castleEntryIndex !== castle.incoming.entryGateIndex
    || attachment?.castleRotation !== castle.rotation) {
    throw new Error("Version 1 saves require the matching Starting Board and Castle attachment.");
  }
  validateConnectedAllocation(layout, allocated);
  const allocations = [...allocated].sort().map(id => {
    const { instanceId, sourceIndex } = layout.nodes.get(id);
    return [instanceId, sourceIndex];
  });
  return { version: 1, sourceRevision: SOURCE_REVISION, attachment, allocations };
}

export function readConnectedSaveV2(resources, saved) {
  if (saved?.version !== 2 || saved.sourceRevision !== SOURCE_REVISION || !Array.isArray(saved.boards)) {
    throw new Error("The Connected Boards save has an unsupported schema or source revision.");
  }
  const layout = buildBoardInstanceLayout(resources, saved.boards);
  const allocated = new Set();
  const glyphs = new Map();
  const invalidGlyphBoards = [];
  for (const board of saved.boards) {
    const { instanceId, allocatedSourceIndices, glyph } = board;
    if (!Array.isArray(allocatedSourceIndices)) throw new Error("Invalid saved board allocations.");
    for (const sourceIndex of allocatedSourceIndices) {
      const id = nodeId(instanceId, sourceIndex);
      if (!Number.isInteger(sourceIndex) || !layout.nodes.has(id) || allocated.has(id)) {
        throw new Error("Unknown or duplicate saved node.");
      }
      allocated.add(id);
    }
    if (Object.hasOwn(board, "glyph")) {
      if (isGlyphConfiguration(glyph) && hasGlyphSocket(layout, instanceId)) {
        glyphs.set(instanceId, { snoId: glyph.snoId, level: glyph.level });
      } else {
        invalidGlyphBoards.push(instanceId);
      }
    }
  }
  validateConnectedAllocation(layout, allocated);
  return { layout, allocated, glyphs, invalidGlyphBoards };
}

export function writeConnectedSaveV2(layout, allocated, glyphs = new Map()) {
  validateConnectedAllocation(layout, allocated);
  for (const [instanceId, configuration] of glyphs) {
    if (!hasGlyphSocket(layout, instanceId) || !isGlyphConfiguration(configuration)) {
      throw new Error("Invalid glyph configuration in the connected draft.");
    }
  }
  const indices = new Map(layout.boards.map(({ instanceId }) => [instanceId, []]));
  for (const id of allocated) {
    const { instanceId, sourceIndex } = layout.nodes.get(id);
    indices.get(instanceId).push(sourceIndex);
  }
  const boards = layout.boards.map(({ instanceId, boardId, placementIndex, rotation, incoming }) => ({
    instanceId, boardId, placementIndex, rotation,
    incoming: incoming && {
      parentInstanceId: incoming.parentInstanceId,
      parentGateIndex: incoming.parentGateIndex,
      entryGateIndex: incoming.entryGateIndex
    },
    allocatedSourceIndices: indices.get(instanceId).sort((first, second) => first - second),
    ...(glyphs.has(instanceId) && {
      glyph: { snoId: glyphs.get(instanceId).snoId, level: glyphs.get(instanceId).level }
    })
  }));
  return { version: 2, sourceRevision: SOURCE_REVISION, boards };
}

function isPrototypeLayout({ boards }) {
  return boards.length === 2
    && boards[0].boardId === STARTING_BOARD_ID && boards[0].placementIndex === 0
    && boards[1].boardId === CASTLE_BOARD_ID && boards[1].placementIndex === 1;
}

export function calculateConnectedBonuses(layout, allocated, externalAttributes, glyphs = new Map(), legendaryScenario) {
  validateConnectedAllocation(layout, allocated);
  const indices = new Map(layout.boards.map(({ instanceId }) => [instanceId, new Set()]));
  for (const id of allocated) {
    const node = layout.nodes.get(id);
    indices.get(node.instanceId).add(node.sourceIndex);
  }

  const { results, coreAttributes, totalAttributes, externalAttributes: normalizedExternal } = calculateParagonBoards(
    layout.boards.map(board => ({
      board: board.board, nodeDatabase: board.database, allocatedNodeIndices: indices.get(board.instanceId),
      calculationContext: { placementIndex: board.placementIndex, instanceId: board.instanceId, glyph: glyphs.get(board.instanceId), legendaryScenario }
    })),
    externalAttributes
  );
  const rawBonuses = {};
  for (const result of results) {
    for (const [category, totals] of Object.entries(result.verifiedParagonBonuses.rawBonuses)) {
      const combined = rawBonuses[category] ??= { unconditional: 0, conditional: 0, total: 0 };
      combined.unconditional += totals.unconditional;
      combined.conditional += totals.conditional;
      if (totals.glyph !== undefined) combined.glyph = (combined.glyph ?? 0) + totals.glyph;
      if (totals.amplification !== undefined) combined.amplification = (combined.amplification ?? 0) + totals.amplification;
      combined.total = combined.unconditional + combined.conditional + (combined.amplification ?? 0) + (combined.glyph ?? 0);
    }
  }

  const glyphEvaluations = results.flatMap(result => result.glyphEvaluations ?? []);
  const glyphPrimaryPreviews = results.flatMap(result => result.glyphPrimaryPreviews ?? []);
  const additionalGlyphEffects = results.flatMap(result => result.additionalGlyphEffects ?? []);
  const legendaryGlyphPreviews = results.flatMap(result => result.legendaryGlyphPreviews ?? []);
  const legendaryGlyphModifiers = results.flatMap(result => result.legendaryGlyphModifiers ?? []);
  const legendaryNodeEffects = results.flatMap(result => result.legendaryNodeEffects ?? []);
  const effectiveNodeContributions = results.flatMap(result => result.effectiveNodeContributions);
  const amplifiedCore = effectiveNodeContributions.some(line => line.category === "coreAttribute" && line.baseAmplificationDelta);
  return {
    externalAttributes: normalizedExternal, totalAttributes, effectiveNodeContributions,
    nodeEvaluations: results.flatMap(result => result.nodeEvaluations),
    unresolvedBonusCount: results.reduce((sum, result) => sum + result.unresolvedBonusCount, 0),
    ...(glyphEvaluations.length > 0 && { glyphEvaluations }),
    ...(glyphPrimaryPreviews.length > 0 && { glyphPrimaryPreviews }),
    ...(additionalGlyphEffects.length > 0 && { additionalGlyphEffects }),
    ...(legendaryGlyphPreviews.length > 0 && { legendaryGlyphPreviews }),
    ...(legendaryGlyphModifiers.length > 0 && { legendaryGlyphModifiers }),
    ...(legendaryNodeEffects.length > 0 && { legendaryNodeEffects }),
    ...(amplifiedCore && { amplifiedThresholdEvidence: "source-derived-cross-board-model" }),
    verifiedParagonBonuses: {
      coreAttributes, rawBonuses,
      totalCoreAttributes: Object.values(coreAttributes).reduce((sum, value) => sum + value, 0)
    }
  };
}
