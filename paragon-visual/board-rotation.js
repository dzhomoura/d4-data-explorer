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
