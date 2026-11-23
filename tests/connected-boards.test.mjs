import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  attachBoard, buildBoardInstanceLayout, buildConnectedLayout, calculateConnectedBonuses, createStartingLayout,
  DEFAULT_ATTACHMENT, readConnectedSave, readConnectedSaveV2, reachableAllocations, removeConnectedBoard,
  rotateConnectedBoard, validateConnectedAllocation, writeConnectedSave, writeConnectedSaveV2
} from "../paragon-visual/connected-boards.js";
import { mergeSharedNodeDefinitions } from "../paragon-visual/shared-node-definitions.js";
import { calculateParagonBonuses } from "../paragon-visual/paragon-calculator.js";

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
