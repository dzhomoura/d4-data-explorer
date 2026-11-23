export const BOARD_ROTATIONS = Object.freeze([0, 90, 180, 270]);

export function rotateBoardPoint(x, y, width, rotation) {
  const last = width - 1;
  switch (rotation) {
    case 0: return { x, y };
    case 90: return { x: last - y, y: x };
    case 180: return { x: last - x, y: last - y };
    case 270: return { x: y, y: last - x };
    default: throw new RangeError(`Unsupported board rotation: ${rotation}`);
  }
}

// Reserve UI space in the projected grid without changing node positions.
export function getBoardControlPositions(board, rotation, freeGates) {
  const width = board.nWidth;
  const occupied = new Set();
  const key = (x, y) => y * width + x;
  board.arEntries.forEach((entry, index) => {
    if (!entry) return;
    const { x, y } = rotateBoardPoint(index % width, Math.floor(index / width), width, rotation);
    occupied.add(key(x, y));
  });

  const attachments = new Map();
  for (const { id, x, y } of freeGates) {
    const neighbors = y === 0 || y === width - 1
      ? [{ x: x - 1, y }, { x: x + 1, y }]
      : [{ x, y: y - 1 }, { x, y: y + 1 }];
    const spot = neighbors.find(point => !occupied.has(key(point.x, point.y)));
    if (!spot) continue; // The board menu also offers these gate actions.
    occupied.add(key(spot.x, spot.y));
    attachments.set(id, spot);
  }

  // Every pinned orientation has a clear top-right strip. Use a second row
  // only where there is room for a taller touch target in the same corner.
  const columns = 5;
  const x = width - columns;
  const rowIsClear = y => Array.from({ length: columns }, (_, offset) => key(x + offset, y))
    .every(cell => !occupied.has(cell));
  const rows = rowIsClear(1) ? 2 : 1;
  return { management: { x, y: 0, columns, rows }, attachments };
}
