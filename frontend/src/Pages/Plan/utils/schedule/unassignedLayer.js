import { getCollidingTasks, sortTasks } from './helpers';
import { findAvailablePosition, markBlocksOccupied } from './placement';

// Schedules unassigned tasks (no time info)
export function scheduleUnassignedTasks(tasks, occupiedBlocks, taskPositions, errors, startBlock) {
  const unassignedTasks = sortTasks(tasks.filter(task => !task.planned_time && !task.approximate_planned_time));
  unassignedTasks.forEach(task => {
    const length = Math.ceil(task.estimated_duration / 15);
    const position = findAvailablePosition(startBlock, 96, length, occupiedBlocks);
    if (position === -1) {
      errors.push(`Task "${task.description}" cannot be scheduled.`);
      return;
    }
    const collidingTasks = getCollidingTasks(position, length, occupiedBlocks, taskPositions, tasks);
    if (collidingTasks.size > 0) {
      const taskNames = [...collidingTasks].slice(0, 2).map(n => `"${n}"`).join(' and ');
      errors.push(`Task "${task.description}" collides with ${taskNames}`);
      return;
    }
    markBlocksOccupied(position, length, task.id, occupiedBlocks, taskPositions);
  });
} 