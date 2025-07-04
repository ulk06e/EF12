// Finds unaccounted time periods (gaps) in the schedule using exact minutes
export function findGaps(startBlock, occupiedBlocks, endBlock = 96, scheduledTasks = []) {
  // scheduledTasks: array of tasks with .position (start block) and .estimated_duration (in minutes)
  if (!scheduledTasks || scheduledTasks.length === 0) {
    // If no tasks, the whole day is a gap
    return [{
      type: 'unaccounted',
      startBlock,
      endBlock,
      minutes: (endBlock - startBlock + 1) * 15
    }];
  }
  // Sort tasks by position
  const sorted = [...scheduledTasks].sort((a, b) => a.position - b.position);
  const gaps = [];
  // First gap: from startBlock to first task
  const firstTask = sorted[0];
  const firstGapMinutes = ((firstTask.position - startBlock) * 15);
  if (firstGapMinutes > 0) {
    gaps.push({
      type: 'unaccounted',
      startBlock,
      endBlock: firstTask.position - 1,
      minutes: firstGapMinutes
    });
  }
  // Gaps between tasks
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentTask = sorted[i];
    const nextTask = sorted[i + 1];
    const currentTaskEnd = currentTask.position + Math.ceil(currentTask.estimated_duration / 15) - 1;
    const gapStart = currentTaskEnd + 1;
    const gapEnd = nextTask.position - 1;
    const gapMinutes = (gapEnd - gapStart + 1) * 15 - ((currentTask.position + Math.ceil(currentTask.estimated_duration / 15) - 1 - currentTask.position + 1) * 15 - currentTask.estimated_duration);
    if (gapEnd >= gapStart && gapMinutes > 0) {
      gaps.push({
        type: 'unaccounted',
        startBlock: gapStart,
        endBlock: gapEnd,
        minutes: gapMinutes
      });
    }
  }
  // Last gap: from end of last task to endBlock
  const lastTask = sorted[sorted.length - 1];
  const lastTaskEnd = lastTask.position + Math.ceil(lastTask.estimated_duration / 15) - 1;
  const lastGapStart = lastTaskEnd + 1;
  const lastGapMinutes = (endBlock - lastGapStart + 1) * 15 - ((lastTask.position + Math.ceil(lastTask.estimated_duration / 15) - 1 - lastTask.position + 1) * 15 - lastTask.estimated_duration);
  if (lastGapStart <= endBlock && lastGapMinutes > 0) {
    gaps.push({
      type: 'unaccounted',
      startBlock: lastGapStart,
      endBlock,
      minutes: lastGapMinutes
    });
  }
  return gaps;
} 