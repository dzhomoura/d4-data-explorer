import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  attachBoard, buildBoardInstanceLayout, buildConnectedLayout, calculateConnectedBonuses, createStartingLayout,
  configureConnectedGlyph, DEFAULT_ATTACHMENT, planConnectedBoardReset, readConnectedSave, readConnectedSaveV2,
  reachableAllocations, removeConnectedBoard, retainConnectedGlyphs, rotateConnectedBoard, validateConnectedAllocation,
  writeConnectedSave, writeConnectedSaveV2
} from "../paragon-visual/connected-boards.js";
import { BOARD_ROTATIONS, getBoardControlPositions, rotateBoardPoint } from "../paragon-visual/board-rotation.js";
import { mergeSharedNodeDefinitions } from "../paragon-visual/shared-node-definitions.js";
import { calculateParagonBonuses } from "../paragon-visual/paragon-calculator.js";
import { getGlyphSocketSourceIndex, paladinGlyphCatalogue } from "../paragon-visual/paladin-glyph-catalogue.js";
import { getGlyphProgression } from "../paragon-visual/glyph-progression.js";
import { getGlyphRadiusMembership, manhattanDistance } from "../paragon-visual/glyph-spatial.js";

const resources = new Map();
for (let index = 0; index < 10; index++) {
  const suffix = String(index).padStart(2, "0");
  const board = JSON.parse(await readFile(new URL(`../paladin-board-${suffix}.json`, import.meta.url)));
  const nodeFile = index === 0 ? "node-data.json" : `node-data-${suffix}.json`;
  const database = mergeSharedNodeDefinitions(JSON.parse(await readFile(
    new URL(`../paragon-visual/${nodeFile}`, import.meta.url)
  )));
  resources.set(`board${suffix}`, { board, database });
}

const starting = { instanceId: "start", boardId: "board00", placementIndex: 0, rotation: 0, incoming: null };

function child(instanceId, boardId, placementIndex, parentInstanceId, parentGateIndex, entryGateIndex, rotation = 0) {
  return {
    instanceId, boardId, placementIndex, rotation,
    incoming: { parentInstanceId, parentGateIndex, entryGateIndex }
  };
}

const castle = child("castle", "board01", 1, "start", 10, 230, 90);
const east = child("east", "board07", 2, "castle", 10, 230, 180);
const west = child("west", "board03", 3, "castle", 430, 10, 90);
const north = child("north", "board02", 4, "castle", 210, 210, 270);

test("a five-board branch uses explicit placement order and rotated source gates", () => {
  const layout = buildBoardInstanceLayout(resources, [north, west, starting, east, castle]);
  assert.deepEqual(layout.boards.map(board => [board.instanceId, board.boardId, board.placementIndex]), [
    ["start", "board00", 0], ["castle", "board01", 1], ["east", "board07", 2],
    ["west", "board03", 3], ["north", "board02", 4]
  ]);
  assert.deepEqual(layout.boards.map(board => board.worldOrigin), [
    { x: 0, y: 0 }, { x: 0, y: -21 }, { x: 21, y: -21 }, { x: -21, y: -21 }, { x: 0, y: -42 }
  ]);
  assert.equal(layout.width, 63);
  assert.equal(layout.height, 63);
  assert.equal(layout.root, "start:304");
  assert.equal(layout.nodes.get("east:10").boardId, "board07");
  assert.equal(layout.nodes.get("east:10").sourceIndex, layout.nodes.get("castle:10").sourceIndex);
  assert.deepEqual(layout.attachments.map(edge => [edge.parentGateId, edge.entryGateId]), [
    ["start:10", "castle:230"], ["castle:10", "east:230"], ["castle:430", "west:10"], ["castle:210", "north:210"]
  ]);
  assert.equal(layout.gateOccupancy.size, 8);
  for (const edge of layout.attachments) {
    const { parentGateId, entryGateId } = edge;
    assert.equal(layout.gateOccupancy.get(parentGateId), edge);
    assert.equal(layout.gateOccupancy.get(entryGateId), edge);
    assert.ok(layout.graph.get(parentGateId).includes(entryGateId));
    assert.ok(layout.graph.get(entryGateId).includes(parentGateId));
    const parent = layout.nodes.get(parentGateId).displayPosition;
    const entry = layout.nodes.get(entryGateId).displayPosition;
    assert.equal(Math.abs(parent.x - entry.x) + Math.abs(parent.y - entry.y), 1);
  }
  const crossBoardEdges = [...layout.graph].flatMap(([id, neighbors]) =>
    neighbors.filter(neighbor => layout.nodes.get(id).instanceId !== layout.nodes.get(neighbor).instanceId)
  );
  assert.equal(crossBoardEdges.length, 8);

  const allocated = reachableAllocations(layout.graph, new Set(layout.nodes.keys()), layout.root);
  assert.ok(allocated.has("east:230"));
  assert.ok(allocated.has("west:10"));
  assert.ok(allocated.has("north:210"));
  validateConnectedAllocation(layout, allocated);
  allocated.delete("castle:10");
  assert.throws(() => validateConnectedAllocation(layout, allocated), /must stay connected/);
  validateConnectedAllocation(layout, new Set([layout.root]));
  assert.throws(() => validateConnectedAllocation(layout, new Set([layout.root, "east:230"])), /must stay connected/);
  // Stage 2 enables numerical evaluation of the tree while the version 1 writer stays two-board.
  const zero = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
  const result = calculateConnectedBonuses(layout, new Set([layout.root]), zero);
  assert.equal(result.nodeEvaluations.length, layout.nodes.size);
  assert.deepEqual(result.verifiedParagonBonuses.coreAttributes, zero);
  assert.throws(() => writeConnectedSave(layout, DEFAULT_ATTACHMENT, new Set([layout.root])), /Version 1 saves/);
});

test("all nine additional definitions fit the Starting seam at each rotation", () => {
  for (const boardId of [...resources.keys()].slice(1)) {
    for (const [rotation, entryGateIndex] of [[0, 430], [90, 230], [180, 10], [270, 210]]) {
      const layout = buildBoardInstanceLayout(resources, [
        starting, child("additional", boardId, 1, "start", 10, entryGateIndex, rotation)
      ]);
      assert.equal(layout.nodes.get("start:10").gateDirection, "North");
      assert.equal(layout.nodes.get(`additional:${entryGateIndex}`).gateDirection, "South");
      assert.deepEqual(layout.boards[1].worldOrigin, { x: 0, y: -21 });
    }
  }
});

test("touching boards require an explicit attachment to connect their gates", () => {
  const layout = buildBoardInstanceLayout(resources, [
    starting,
    child("castle", "board01", 1, "start", 10, 430),
    child("east", "board02", 2, "castle", 230, 210),
    child("north", "board03", 3, "castle", 10, 430),
    child("corner", "board04", 4, "east", 10, 430)
  ]);
  const left = layout.nodes.get("north:230").displayPosition;
  const right = layout.nodes.get("corner:210").displayPosition;
  assert.deepEqual(right, { x: left.x + 1, y: left.y });
  assert.ok(!layout.gateOccupancy.has("north:230"));
  assert.ok(!layout.gateOccupancy.has("corner:210"));
  assert.ok(!layout.graph.get("north:230").includes("corner:210"));
});

test("invalid tree proposals are rejected", () => {
  const cases = [
    [[starting, castle, { ...east, boardId: castle.boardId }], /definition can only be placed once/],
    [[starting, castle, { ...east, instanceId: castle.instanceId }], /instance IDs/],
    [[starting, castle, { ...east, placementIndex: 1 }], /placement indices/],
    [[starting, castle, { ...east, placementIndex: 3 }], /placement indices/],
    [[{ ...starting, boardId: "board04" }, castle], /Starting Board/],
    [[starting, { ...castle, boardId: "board00" }], /definition can only be placed once/],
    [[{ ...starting, rotation: 90 }, castle], /Starting Board is fixed/],
    [[starting, { ...castle, incoming: null }], /incoming attachment/],
    [[starting, { ...castle, rotation: 45 }], /supported board rotation/],
    [[starting, child("castle", "board01", 1, "missing", 10, 230, 90)], /parent is missing/],
    [[starting, child("castle", "board01", 1, "east", 10, 230, 90), east], /Cycles are invalid/],
    [[starting, child("castle", "board01", 1, "castle", 10, 230, 90)], /Cycles are invalid/],
    [[starting, child("castle", "board01", 1, "start", 210, 230, 90)], /face each other/],
    [[starting, child("castle", "board01", 1, "start", 10, 10, 90)], /face each other/],
    [[starting, castle, east, child("other", "board08", 3, "castle", 10, 210)], /gate cannot be used/],
    [[starting, castle, child("other", "board08", 2, "castle", 230, 10)], /gate cannot be used/],
    [[starting, castle, east, west, north, child("other", "board08", 5, "east", 10, 430)], /one and five/],
    [
      [starting, castle, east, child("south", "board03", 3, "east", 10, 10),
        child("overlap", "board04", 4, "south", 210, 230)],
      /footprints cannot overlap/
    ]
  ];
  for (const [instances, error] of cases) {
    assert.throws(() => buildBoardInstanceLayout(resources, instances), error);
  }
});

test("version 1 round-trips all rotations with allocations and rejects a mismatched attachment", () => {
  for (const [castleRotation, castleEntryIndex] of [[0, 430], [90, 230], [180, 10], [270, 210]]) {
    const attachment = { ...DEFAULT_ATTACHMENT, castleEntryIndex, castleRotation };
    const layout = buildConnectedLayout(resources, attachment);
    assert.deepEqual(layout.bridge, ["board00:10", `board01:${castleEntryIndex}`]);
    assert.deepEqual(layout.boards.map(board => board.placementIndex), [0, 1]);
    assert.deepEqual(layout.boards.map(board => board.origin), [{ x: 0, y: 21 }, { x: 0, y: 0 }]);
    for (const allocated of [
      new Set([layout.root]), reachableAllocations(layout.graph, new Set(layout.nodes.keys()), layout.root)
    ]) {
      const saved = writeConnectedSave(layout, attachment, allocated);
      assert.equal(saved.version, 1);
      const restored = readConnectedSave(resources, JSON.parse(JSON.stringify(saved)));
      assert.deepEqual(restored.allocated, allocated);
      assert.deepEqual(restored.attachment, attachment);
      assert.deepEqual(writeConnectedSave(restored.layout, restored.attachment, restored.allocated), saved);
    }
    assert.throws(() => writeConnectedSave(layout, { ...attachment, castleEntryIndex: 304 }, new Set([layout.root])),
      /matching Starting Board and Castle attachment/);
  }
});

const zero = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
const fiveBoardPlan = [
  ["board00:10", "board01", "castle"],
  ["castle:230", "board02", "shield"],
  ["castle:210", "board08", "endure"],
  ["castle:10", "board03", "fervent"]
];

function attachPlan(plan) {
  let layout = createStartingLayout(resources);
  const allocated = new Set([layout.root]);
  for (const args of plan) layout = attachBoard(resources, layout, allocated, ...args);
  return { layout, allocated };
}

function allocatePath(layout, allocated, target) {
  const previous = new Map([[layout.root, null]]);
  const queue = [layout.root];
  for (let i = 0; i < queue.length && !previous.has(target); i++) {
    for (const node of layout.graph.get(queue[i])) {
      if (previous.has(node)) continue;
      previous.set(node, queue[i]);
      queue.push(node);
    }
  }
  assert.ok(previous.has(target), target);
  for (let node = target; node !== null; node = previous.get(node)) allocated.add(node);
}

test("attachment actions offer every definition and validate branching, occupied gates, duplicates, cap and overlap", () => {
  for (const boardId of [...resources.keys()].slice(1)) {
    const { layout, allocated } = attachPlan([["board00:10", boardId, "first"]]);
    assert.equal(layout.boards[1].boardId, boardId);
    assert.deepEqual([...allocated], [layout.root]);
  }
  const { layout, allocated } = attachPlan(fiveBoardPlan);
  assert.deepEqual(layout.attachments.map(edge => edge.parentInstanceId), ["board00", "castle", "castle", "castle"]);
  assert.deepEqual(layout.boards.map(board => board.placementIndex), [0, 1, 2, 3, 4]);
  assert.throws(() => attachBoard(resources, layout, allocated, "shield:10", "board09", "sixth"), /five board/);
  const partial = attachPlan(fiveBoardPlan.slice(0, 2));
  for (const gate of ["board00:10", "castle:230", "castle:430", "shield:210"]) {
    assert.throws(() => attachBoard(resources, partial.layout, partial.allocated, gate, "board09", "extra"), /already belongs/);
  }
  assert.throws(() => attachBoard(resources, partial.layout, partial.allocated, "shield:10", "board01", "duplicate"), /already equipped/);
  const fold = attachPlan([...fiveBoardPlan.slice(0, 2), ["shield:430", "board03", "south"]]);
  assert.throws(() => attachBoard(resources, fold.layout, fold.allocated, "south:210", "board04", "overlap"), /cannot overlap/);
});

test("rotation rebuilds descendants and rejects a gate conflict, overlap or disconnected allocation", () => {
  const plan = [fiveBoardPlan[0], ["castle:10", "board03", "child"], ["child:10", "board04", "grandchild"]];
  const { layout, allocated } = attachPlan(plan);
  const turned = rotateConnectedBoard(resources, layout, allocated, "castle", 90);
  assert.deepEqual(turned.boards.map(board => board.rotation), [0, 90, 90, 90]);
  assert.deepEqual(turned.boards.map(board => board.worldOrigin), [
    { x: 0, y: 0 }, { x: 0, y: -21 }, { x: 21, y: -21 }, { x: 42, y: -21 }
  ]);
  assert.deepEqual(turned.nodes.get("child:430").gateDirection, "West");
  assert.deepEqual(turned.boards[1].incoming.entryGateIndex, 230);
  assert.deepEqual([...turned.nodes.keys()], [...layout.nodes.keys()]);
  assert.deepEqual(rotateConnectedBoard(resources, turned, allocated, "castle", -90).attachments, layout.attachments);
  const conflict = attachPlan(fiveBoardPlan);
  assert.throws(() => rotateConnectedBoard(resources, conflict.layout, conflict.allocated, "castle", 90), /more than one attachment/);
  const overlap = attachPlan([fiveBoardPlan[0], ["castle:10", "board03", "north"],
    ["north:230", "board04", "corner"], ["corner:430", "board05", "tip"]]);
  assert.throws(() => rotateConnectedBoard(resources, overlap.layout, overlap.allocated, "castle", 90), /cannot overlap/);
  allocatePath(layout, allocated, "castle:430");
  assert.throws(() => rotateConnectedBoard(resources, layout, allocated, "castle", 90), /must stay connected/);
  assert.throws(() => rotateConnectedBoard(resources, layout, allocated, "castle", 45), /quarter turn/);
});

test("five boards contribute once and safe leaf removal reassigns Knight's placement", () => {
  const { layout, allocated } = attachPlan(fiveBoardPlan);
  for (const cursor of ["fervent:178", "endure:158", "endure:326", "shield:210"]) allocatePath(layout, allocated, cursor);
  const result = calculateConnectedBonuses(layout, allocated, zero);
  const byInstance = layout.boards.map(instance => {
    const sourceIndices = new Set([...allocated].map(id => layout.nodes.get(id))
      .filter(node => node.instanceId === instance.instanceId).map(node => node.sourceIndex));
    return calculateParagonBonuses(instance.board, instance.database, sourceIndices, zero, { placementIndex: instance.placementIndex });
  });
  assert.ok(byInstance.every(part => part.verifiedParagonBonuses.totalCoreAttributes > 0));
  assert.equal(result.verifiedParagonBonuses.totalCoreAttributes,
    byInstance.reduce((total, part) => total + part.verifiedParagonBonuses.totalCoreAttributes, 0));
  for (const [key, totals] of Object.entries(result.verifiedParagonBonuses.rawBonuses)) {
    const expected = byInstance.reduce((sum, part) => sum + (part.verifiedParagonBonuses.rawBonuses[key]?.unconditional ?? 0), 0);
    assert.ok(Math.abs(totals.unconditional - expected) < 1e-9);
  }
  const knight = result => result.nodeEvaluations.find(node => node.nodeId === "fervent:178");
  assert.deepEqual(knight(result).thresholds[0].requirements.map(item => item.requiredValue), [2520, 470]);
  const endures = result.nodeEvaluations.filter(node => ["endure:158", "endure:326"].includes(node.nodeId));
  assert.equal(endures.length, 2);
  assert.ok(endures.every(node => node.allocated && node.thresholds[0].requiredAttribute === "Willpower"));
  const high = calculateConnectedBonuses(layout, allocated, { ...zero, Willpower: 1000 });
  const lifeAdded = high.verifiedParagonBonuses.rawBonuses.maximumLifePercent.conditional;
  assert.ok(lifeAdded >= 8);
  assert.equal(high.nodeEvaluations.filter(node => ["endure:158", "endure:326"].includes(node.nodeId)
    && node.attributes[0].conditionalApplied).length, 2);
  const activeBonuses = high.nodeEvaluations.flatMap(node => node.attributes.filter(attribute => attribute.conditionalApplied));
  for (const [key, totals] of Object.entries(high.verifiedParagonBonuses.rawBonuses)) {
    const expected = activeBonuses.filter(attribute => attribute.category === key)
      .reduce((sum, attribute) => sum + attribute.conditional, 0);
    assert.ok(Math.abs(totals.conditional - expected) < 1e-9);
  }
  assert.throws(() => removeConnectedBoard(resources, layout, allocated, "board00"), /cannot be removed/);
  assert.throws(() => removeConnectedBoard(resources, layout, allocated, "castle"), /child boards/);
  assert.throws(() => removeConnectedBoard(resources, layout, allocated, "shield"), /Refund/);
  const disconnected = new Set(allocated);
  disconnected.delete("castle:10");
  assert.throws(() => validateConnectedAllocation(layout, disconnected), /must stay connected/);
  allocated.delete("shield:210");
  const next = removeConnectedBoard(resources, layout, allocated, "shield");
  assert.deepEqual(next.boards.map(instance => [instance.instanceId, instance.placementIndex]),
    [["board00", 0], ["castle", 1], ["endure", 2], ["fervent", 3]]);
  assert.deepEqual(knight(calculateConnectedBonuses(next, allocated, zero)).thresholds[0].requirements
    .map(item => item.requiredValue), [2065, 400]);
});

test("version 2 preserves the branch, rotations, allocations and legacy calculation", () => {
  const { layout, allocated } = attachPlan([fiveBoardPlan[0], ["castle:10", "board08", "endure"]]);
  const rotated = rotateConnectedBoard(resources, layout, allocated, "castle", 90);
  allocatePath(rotated, allocated, "endure:326");
  const payload = writeConnectedSaveV2(rotated, allocated);
  const restored = readConnectedSaveV2(resources, JSON.parse(JSON.stringify(payload)));
  assert.deepEqual(restored.allocated, allocated);
  assert.deepEqual(writeConnectedSaveV2(restored.layout, restored.allocated), payload);
  for (const bad of [{ ...payload, version: 3 }, { ...payload, sourceRevision: "other" },
    { ...payload, boards: payload.boards.map(board => ({ ...board, allocatedSourceIndices: null })) }]) {
    assert.throws(() => readConnectedSaveV2(resources, bad));
  }
  const unavailable = new Map(resources);
  unavailable.delete("board08");
  assert.throws(() => readConnectedSaveV2(unavailable, payload), /pinned Paladin board definition/);
  const legacy = buildConnectedLayout(resources, { ...DEFAULT_ATTACHMENT, castleRotation: 270, castleEntryIndex: 210 });
  const olderAllocation = new Set();
  allocatePath(legacy, olderAllocation, "board01:57");
  const old = writeConnectedSave(legacy, { ...DEFAULT_ATTACHMENT, castleRotation: 270, castleEntryIndex: 210 }, olderAllocation);
  const oldRestored = readConnectedSave(resources, old);
  const migrated = readConnectedSaveV2(resources, writeConnectedSaveV2(oldRestored.layout, oldRestored.allocated));
  assert.deepEqual(migrated.allocated, olderAllocation);
  assert.deepEqual(migrated.layout.attachments, legacy.attachments);
  assert.deepEqual(migrated.layout.boards.map(board => board.rotation), [0, 270]);
  assert.deepEqual(calculateConnectedBonuses(migrated.layout, migrated.allocated, zero),
    calculateConnectedBonuses(legacy, olderAllocation, zero));
});

test("top-right toolbar reservations fit every pinned board and orientation without covering nodes or gates", () => {
  for (const [boardId, { board }] of resources) {
    const rotations = boardId === "board00" ? [0] : BOARD_ROTATIONS;
    for (const rotation of rotations) {
      const cells = board.arEntries.flatMap((entry, index) => {
        if (!entry) return [];
        return [{ ...rotateBoardPoint(index % board.nWidth, Math.floor(index / board.nWidth), board.nWidth, rotation),
          id: String(index), gate: entry.name.includes("Generic_Gate") }];
      });
      const gates = cells.filter(cell => cell.gate);
      assert.equal(gates.length, boardId === "board00" ? 1 : 4);
      const { management, attachments } = getBoardControlPositions(board, rotation, gates);
      assert.equal(attachments.size, gates.length);
      assert.equal(management.x + management.columns, board.nWidth);
      assert.equal(management.y, 0);
      assert.ok(management.rows === 1 || management.rows === 2);
      const reserved = new Set(cells.map(({ x, y }) => `${x},${y}`));
      const reserve = ({ x, y }) => {
        assert.ok(x >= 0 && x < board.nWidth && y >= 0 && y < board.nWidth);
        const key = `${x},${y}`;
        assert.ok(!reserved.has(key), `${boardId}, ${rotation}° at ${key}`);
        reserved.add(key);
      };
      for (const gate of gates) {
        const spot = attachments.get(gate.id);
        assert.equal(Math.abs(spot.x - gate.x) + Math.abs(spot.y - gate.y), 1);
        reserve(spot);
      }
      for (let y = management.y; y < management.y + management.rows; y++) {
        for (let x = management.x; x < management.x + management.columns; x++) reserve({ x, y });
      }
    }
  }
});

test("board reset plans preserve the root and reject dependent branches without editing allocations", () => {
  const { layout, allocated } = attachPlan(fiveBoardPlan);
  assert.equal(planConnectedBoardReset(layout, allocated, "castle").refunded, 0);
  const emptyStarting = planConnectedBoardReset(layout, allocated, layout.boards[0].instanceId);
  assert.equal(emptyStarting.refunded, 0);
  assert.deepEqual(emptyStarting.candidate, new Set([layout.root]));
  allocatePath(layout, allocated, "fervent:178");
  allocatePath(layout, allocated, "endure:326");
  const before = new Set(allocated);
  assert.deepEqual(planConnectedBoardReset(layout, allocated, "castle").dependentBoards, new Set(["fervent", "endure"]));
  assert.deepEqual(planConnectedBoardReset(layout, allocated, layout.boards[0].instanceId).dependentBoards,
    new Set(["castle", "fervent", "endure"]));
  assert.deepEqual(allocated, before);

  const leaf = planConnectedBoardReset(layout, allocated, "fervent");
  assert.equal(leaf.dependentBoards.size, 0);
  assert.deepEqual(leaf.candidate, new Set([...before].filter(id => !id.startsWith("fervent:"))));
  assert.equal(leaf.refunded, before.size - leaf.candidate.size);
  validateConnectedAllocation(layout, leaf.candidate);
  const safeStarting = planConnectedBoardReset(layout, new Set([layout.root, "board00:283"]), "board00");
  assert.deepEqual(safeStarting.candidate, new Set([layout.root]));
  assert.equal(safeStarting.refunded, 1);
  assert.throws(() => planConnectedBoardReset(layout, allocated, "missing"), /equipped board/);
});

test("all ten socket cells use the pinned source index through valid board rotations", () => {
  const sourceIndices = [136, 120, 264, 222, 178, 320, 262, 320, 110, 136];
  for (const [number, boardId] of [...resources.keys()].entries()) {
    const sourceIndex = sourceIndices[number];
    const board = resources.get(boardId).board;
    assert.equal(getGlyphSocketSourceIndex(board), sourceIndex);
    const x = sourceIndex % 21;
    const y = Math.floor(sourceIndex / 21);
    const coordinates = [[x, y], [20 - y, x], [20 - x, 20 - y], [y, 20 - x]];
    const entryGates = [430, 230, 10, 210];
    for (const [turn, [expectedX, expectedY]] of coordinates.entries()) {
      if (number === 0 && turn !== 0) continue;
      const instances = [starting];
      if (number !== 0) instances.push(child("socket-test", boardId, 1, "start", 10, entryGates[turn], turn * 90));
      const layout = buildBoardInstanceLayout(resources, instances);
      const instance = layout.boards[number === 0 ? 0 : 1];
      const socket = layout.nodes.get(`${instance.instanceId}:${sourceIndex}`);
      assert.ok(socket.definition.hasSocket);
      assert.equal(socket.definition.snoId, 681756);
      assert.deepEqual(socket.displayPosition, { x: instance.origin.x + expectedX, y: instance.origin.y + expectedY });
      for (const radius of [3, 4, 5]) {
        const source = getGlyphRadiusMembership(board, instance.instanceId, radius);
        const displayed = [...layout.nodes.values()].filter(node => node.instanceId === instance.instanceId
          && node !== socket && manhattanDistance(node.displayPosition, socket.displayPosition) <= radius);
        assert.deepEqual(displayed.map(node => node.sourceIndex), source.nodes.map(node => node.sourceIndex));
        assert.ok(source.nodes.every(node => node.instanceId === instance.instanceId));
        assert.ok([...layout.nodes.values()].every(node => node.instanceId === instance.instanceId
          || manhattanDistance(node.displayPosition, socket.displayPosition) > radius));
      }
    }
  }
});

test("glyph assignment, replacement, level and removal round trip without changing calculations", () => {
  const { layout, allocated } = attachPlan([["board00:10", "board01", "castle"]]);
  allocatePath(layout, allocated, "board00:136");
  allocatePath(layout, allocated, "castle:120");
  allocatePath(layout, allocated, "castle:57");
  const attributes = { Strength: 2500, Intelligence: 500, Willpower: 850, Dexterity: 0 };
  const baseline = calculateConnectedBonuses(layout, allocated, attributes);
  assert.ok(baseline.nodeEvaluations.some(node => node.nodeId === "castle:57" && node.thresholds.some(t => t.satisfied)));
  let glyphs = new Map();
  for (const configuration of [
    { snoId: 2073373, level: 1 },
    { snoId: 2073373, level: 24 },
    { snoId: 2073373, level: 25 },
    { snoId: 2073373, level: 49 },
    { snoId: 2073373, level: 50 },
    { snoId: 2073373, level: 51 },
    { snoId: 2478228, level: 1 },
    { snoId: 2478228, level: 150 },
    null
  ]) {
    glyphs = configureConnectedGlyph(layout, glyphs, "castle", configuration);
    const payload = writeConnectedSaveV2(layout, allocated, glyphs);
    assert.deepEqual(payload.boards[1].glyph, configuration ?? undefined);
    const restored = readConnectedSaveV2(resources, JSON.parse(JSON.stringify(payload)));
    assert.deepEqual(restored.glyphs, glyphs);
    assert.deepEqual(getGlyphProgression(restored.glyphs.get("castle")?.level), getGlyphProgression(configuration?.level));
    assert.deepEqual(restored.allocated, allocated);
    assert.deepEqual(calculateConnectedBonuses(restored.layout, restored.allocated, attributes), baseline);
  }
});

test("glyphs follow a board instance through rotation and point reset, and leave with removal", () => {
  const { layout, allocated } = attachPlan([["board00:10", "board01", "castle"]]);
  const glyph = { snoId: 2073373, level: 50 };
  let glyphs = configureConnectedGlyph(layout, new Map(), "board00", glyph);
  glyphs = configureConnectedGlyph(layout, glyphs, "castle", glyph);
  const rotated = rotateConnectedBoard(resources, layout, allocated, "castle", 90);
  assert.deepEqual(readConnectedSaveV2(resources, writeConnectedSaveV2(rotated, allocated, glyphs)).glyphs, glyphs);
  allocatePath(rotated, allocated, "castle:120");
  const reset = planConnectedBoardReset(rotated, allocated, "castle").candidate;
  assert.deepEqual(readConnectedSaveV2(resources, writeConnectedSaveV2(rotated, reset, glyphs)).glyphs, glyphs);
  const removed = removeConnectedBoard(resources, rotated, reset, "castle");
  const retained = retainConnectedGlyphs(removed, glyphs);
  assert.deepEqual([...retained], [["board00", glyph]]);
  const reattached = attachBoard(resources, removed, reset, "board00:10", "board01", "new-castle");
  assert.equal(writeConnectedSaveV2(reattached, reset, retained).boards[1].glyph, undefined);
  assert.throws(() => configureConnectedGlyph(removed, retained, "castle", glyph), /equipped board/);
});

test("legacy saves omit glyph fields and invalid saved glyphs leave board data and valid glyphs readable", () => {
  const { layout, allocated } = attachPlan([["board00:10", "board01", "castle"]]);
  const payload = writeConnectedSaveV2(layout, allocated);
  const old = readConnectedSaveV2(resources, payload);
  assert.equal(old.glyphs.size, 0);
  assert.deepEqual(writeConnectedSaveV2(old.layout, old.allocated, old.glyphs), payload);
  for (const glyph of [null, [], "Challenger", {}, { snoId: "2073373", level: 1 },
    { snoId: 2479231, level: 1 }, { snoId: 2073373, level: 0 }, { snoId: 2073373, level: 151 },
    { snoId: 2073373, level: 3.5 }, { snoId: 2073373, level: "25" }]) {
    const good = { snoId: 2073373, level: 150 };
    const boards = [{ ...payload.boards[0], glyph }, { ...payload.boards[1], glyph: good }];
    const restored = readConnectedSaveV2(resources, { ...payload, boards });
    assert.deepEqual(restored.allocated, allocated);
    assert.deepEqual(restored.invalidGlyphBoards, ["board00"]);
    assert.deepEqual([...restored.glyphs], [["castle", good]]);
    if (glyph !== null) assert.throws(() => configureConnectedGlyph(layout, new Map(), "board00", glyph), /valid planner level/);
    assert.throws(() => writeConnectedSaveV2(layout, allocated, new Map([["board00", glyph]])), /Invalid glyph/);
  }
});

const glyphPath = [304, 303, 282, 281, 260, 239, 240, 219, 198, 177, 178, 157, 136];

test("connected Primary pools react to radius and allocations while keeping Rare thresholds and external stats independent", () => {
  const layout = createStartingLayout(resources);
  const allocated = new Set([...glyphPath, 179, 137, 138, 139, 140, 141, 305, 135, 114, 93].map(index => `board00:${index}`));
  const external = { Strength: 1000, Intelligence: 500, Willpower: 50, Dexterity: 0 };
  const run = (level, snoId = 1029487, nodes = allocated, stats = external) =>
    calculateConnectedBonuses(layout, nodes, stats, new Map([["board00", { level, snoId }]]));
  for (const [level, pool, expected] of [[24, 5, [179]], [25, 15, [140, 179, 198]],
    [50, 15, [140, 179, 198]], [51, 20, [140, 141, 179, 198]], [50, 15, [140, 179, 198]]]) {
    const result = run(level);
    const [glyph] = result.glyphEvaluations;
    assert.equal(glyph.localAttribute, pool);
    assert.deepEqual(glyph.contributions.map(node => node.sourceIndex), expected);
    assert.deepEqual(glyph.contributions.map(node => node.nodeId), expected.map(index => `board00:${index}`));
    assert.equal(result.verifiedParagonBonuses.rawBonuses.nonPhysicalDamage.total, glyph.percentagePoints);
  }
  const native = calculateConnectedBonuses(layout, allocated, external);
  const turf = run(100, 2506847);
  assert.equal(turf.glyphEvaluations[0].contributions.find(node => node.sourceIndex === 93).attributeValue, 10);
  assert.deepEqual(turf.nodeEvaluations, native.nodeEvaluations);
  assert.deepEqual(turf.totalAttributes, native.totalAttributes);
  assert.ok(!turf.verifiedParagonBonuses.rawBonuses.damage.glyph);
  assert.deepEqual(run(51, 1029487, allocated, { ...external, Intelligence: 1500 }).glyphEvaluations, run(51).glyphEvaluations);
  assert.equal(run(51, 1029487, new Set([...allocated].filter(id => id !== "board00:141"))).glyphEvaluations[0].localAttribute, 15);
  const socketRefunded = new Set(glyphPath.slice(0, -1).map(index => `board00:${index}`));
  assert.deepEqual(run(51, 1029487, socketRefunded), calculateConnectedBonuses(layout, socketRefunded, external));
  const reset = planConnectedBoardReset(layout, allocated, "board00").candidate;
  assert.deepEqual(run(150, 1029487, reset), calculateConnectedBonuses(layout, reset, external));
});

test("multiple active glyphs survive save and rotation, and shared destinations sum each socket exactly once", () => {
  const { layout } = attachPlan([["board00:10", "board01", "castle"]]);
  const allocated = reachableAllocations(layout.graph, new Set(layout.nodes.keys()), layout.root);
  const external = { Strength: 1000, Intelligence: 150, Willpower: 100, Dexterity: 0 };
  const glyphs = new Map([["board00", { snoId: 1029487, level: 150 }], ["castle", { snoId: 1029487, level: 25 }]]);
  const original = calculateConnectedBonuses(layout, allocated, external, glyphs);
  const [first, second] = original.glyphEvaluations;
  const total = original.verifiedParagonBonuses.rawBonuses.nonPhysicalDamage;
  assert.deepEqual(total, { unconditional: 0, conditional: 0, total: first.percentagePoints + second.percentagePoints,
    glyph: first.percentagePoints + second.percentagePoints });
  assert.ok(first.contributions.every(entry => entry.nodeId.startsWith("board00:")));
  assert.ok(second.contributions.every(entry => entry.nodeId.startsWith("castle:")));
  assert.deepEqual(calculateConnectedBonuses(rotateConnectedBoard(resources, layout, allocated, "castle", 90), allocated,
    external, glyphs).glyphEvaluations, original.glyphEvaluations);
  const saved = writeConnectedSaveV2(layout, allocated, glyphs);
  const restored = readConnectedSaveV2(resources, saved);
  assert.deepEqual(calculateConnectedBonuses(restored.layout, restored.allocated, external, restored.glyphs), original);
  const reset = planConnectedBoardReset(layout, allocated, "castle").candidate;
  const removed = removeConnectedBoard(resources, layout, reset, "castle");
  assert.deepEqual(calculateConnectedBonuses(removed, reset, external, retainConnectedGlyphs(removed, glyphs)).glyphEvaluations, [first]);
  const removedGlyph = configureConnectedGlyph(layout, glyphs, "castle", null);
  assert.deepEqual(calculateConnectedBonuses(layout, allocated, external, removedGlyph).glyphEvaluations, [first]);
  const replaced = configureConnectedGlyph(layout, glyphs, "castle", { snoId: 2506071, level: 150 });
  const withChip = calculateConnectedBonuses(layout, allocated, external, replaced);
  const native = calculateConnectedBonuses(layout, allocated, external);
  const raw = { ...withChip.verifiedParagonBonuses.rawBonuses };
  const { glyph: chipAmount, unconditional, conditional, total: physicalTotal } = raw.physicalDamage;
  assert.equal(chipAmount, withChip.glyphEvaluations[1].percentagePoints);
  assert.equal(physicalTotal, unconditional + conditional + chipAmount);
  delete raw.nonPhysicalDamage;
  raw.physicalDamage = { unconditional, conditional, total: unconditional + conditional };
  assert.deepEqual(raw, native.verifiedParagonBonuses.rawBonuses);
});

test("operation-1 core crosses a remote Rare threshold and reverses on removal or refund", () => {
  const { layout } = attachPlan([["board00:10", "board01", "castle"]]);
  const allocated = reachableAllocations(layout.graph, new Set(layout.nodes.keys()), layout.root);
  const zero = { Strength: 0, Intelligence: 0, Willpower: 0, Dexterity: 0 };
  const nativeCore = calculateConnectedBonuses(layout, allocated, zero).totalAttributes.Strength;
  const external = { ...zero, Strength: 629 - nativeCore };
  const glyphs = configureConnectedGlyph(layout, new Map(), "castle", { snoId: 2073373, level: 10 });
  const run = (nodes = allocated, configurations = glyphs) => calculateConnectedBonuses(layout, nodes, external, configurations);
  const brawn = result => result.nodeEvaluations.find(node => node.nodeId === "board00:243").attributes[0];
  const native = run(allocated, new Map());
  assert.deepEqual([brawn(native).threshold.currentValue, brawn(native).threshold.requiredValue, brawn(native).conditionalApplied],
    [629, 630, false]);

  const active = run();
  assert.equal(active.amplifiedThresholdEvidence, "source-derived-cross-board-model");
  assert.equal(active.externalAttributes.Strength, external.Strength);
  assert.equal(brawn(active).threshold.currentValue, active.totalAttributes.Strength);
  assert.ok(active.totalAttributes.Strength > 630 && !Number.isInteger(active.totalAttributes.Strength));
  assert.ok(brawn(active).conditionalApplied);
  assert.deepEqual(run(allocated, configureConnectedGlyph(layout, glyphs, "castle", null)), native);
  const refunded = reachableAllocations(layout.graph, new Set([...allocated].filter(id => id !== "castle:120")), layout.root);
  assert.equal(brawn(run(refunded)).conditionalApplied, false);
  assert.equal(run(refunded).glyphEvaluations, undefined);
  const reset = planConnectedBoardReset(layout, allocated, "castle").candidate;
  const removed = removeConnectedBoard(resources, layout, reset, "castle");
  assert.equal(brawn(calculateConnectedBonuses(removed, reset, external, retainConnectedGlyphs(removed, glyphs))).conditionalApplied, false);

  const withTwo = configureConnectedGlyph(layout, glyphs, "board00", { snoId: 2506253, level: 25 });
  const combined = run(allocated, withTwo);
  const lines = combined.effectiveNodeContributions;
  const keys = lines.map(line => JSON.stringify([line.instanceId, line.sourceIndex, line.attributeIndex]));
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(combined.glyphEvaluations.length, 2);
  assert.equal(lines.filter(line => line.glyphSnoId).length,
    combined.glyphEvaluations.reduce((sum, glyph) => sum + glyph.contributions.length, 0));
  assert.ok(Math.abs(lines.filter(line => line.attributeId === 9).reduce((sum, line) => sum + line.effectiveAmount, 0)
    - combined.verifiedParagonBonuses.coreAttributes.Strength) < 1e-9);
  const damage = lines.filter(line => line.category === "damage").reduce((sum, line) => sum + line.effectiveAmount, 0);
  assert.ok(Math.abs(damage - combined.verifiedParagonBonuses.rawBonuses.damage.total) < 1e-9);
  const saved = readConnectedSaveV2(resources, writeConnectedSaveV2(layout, allocated, withTwo));
  assert.deepEqual(calculateConnectedBonuses(saved.layout, saved.allocated, external, saved.glyphs), combined);
  const rotated = rotateConnectedBoard(resources, layout, allocated, "castle", 90);
  assert.deepEqual(calculateConnectedBonuses(rotated, allocated, external, withTwo), combined);

  const replacement = configureConnectedGlyph(layout, withTwo, "castle", { snoId: 1029487, level: 25 });
  const replaced = run(allocated, replacement);
  assert.equal(replaced.glyphEvaluations[1].glyphSnoId, 1029487);
  assert.ok(replaced.effectiveNodeContributions.every(line => line.glyphSnoId !== 2073373));
});

test("operation-1 pools expand and contract through both boundaries and update on node refunds", () => {
  const layout = createStartingLayout(resources);
  const allocated = reachableAllocations(layout.graph, new Set(layout.nodes.keys()), layout.root);
  const external = { Strength: 1000, Intelligence: 1000, Willpower: 1000, Dexterity: 1000 };
  const run = (level, nodes = allocated) => calculateConnectedBonuses(layout, nodes, external,
    new Map([["board00", { snoId: 2073373, level }]])).glyphEvaluations[0];
  assert.ok(run(25).affectedNodeIndices.length > run(24).affectedNodeIndices.length);
  assert.ok(run(51).affectedNodeIndices.length > run(50).affectedNodeIndices.length);
  assert.deepEqual(run(25).affectedNodeIndices, run(50).affectedNodeIndices);
  const refunded = reachableAllocations(layout.graph, new Set([...allocated].filter(id => id !== "board00:139")), layout.root);
  assert.ok(run(31).affectedNodeIndices.includes(139));
  assert.ok(!run(31, refunded).affectedNodeIndices.includes(139));
});
