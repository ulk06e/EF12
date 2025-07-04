// Placement and block management helpers

export const areBlocksAvailable = (startBlock, length, occupiedBlocks) => {
  for (let i = startBlock; i < startBlock + length && i <= 96; i++) {
    if (occupiedBlocks.has(i)) return false;
  }
  return true;
};

export const markBlocksOccupied = (startBlock, length, taskId, occupiedBlocks, taskPositions) => {
  for (let i = startBlock; i < startBlock + length && i <= 96; i++) {
    occupiedBlocks.add(i);
  }
  taskPositions.set(taskId, { position: startBlock, length });
};

export const findAvailablePosition = (start, end, length, occupiedBlocks) => {
  for (let i = start; i <= end - length + 1; i++) {
    if (areBlocksAvailable(i, length, occupiedBlocks)) {
      return i;
    }
  }
  return -1;
};
