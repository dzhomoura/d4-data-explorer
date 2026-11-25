export function getGlyphSocketSourceIndex(board) {
  const sockets = board.arEntries.flatMap((entry, index) =>
    entry?.__raw__ === 681756 && entry.name === "Generic_Socket" ? [index] : []);
  return sockets.length === 1 ? sockets[0] : null;
}

export function manhattanDistance(first, second) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

// Source indices belong to the supplied board instance. The socket is returned separately as the origin.
export function getGlyphRadiusMembership(board, instanceId, radius) {
  const socketSourceIndex = getGlyphSocketSourceIndex(board);
  if (socketSourceIndex === null || !Number.isInteger(radius) || radius < 0) return null;
  const width = board.nWidth;
  const sourcePoint = index => ({ x: index % width, y: Math.floor(index / width) });
  const origin = sourcePoint(socketSourceIndex);
  const nodes = [];
  for (const [sourceIndex, entry] of board.arEntries.entries()) {
    if (!entry || sourceIndex === socketSourceIndex) continue;
    const distance = manhattanDistance(sourcePoint(sourceIndex), origin);
    if (distance <= radius) nodes.push({ instanceId, sourceIndex, distance });
  }
  return { socket: { instanceId, sourceIndex: socketSourceIndex, ...origin }, nodes };
}
