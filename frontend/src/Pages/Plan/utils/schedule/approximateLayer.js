import { getCollidingTasks, sortTasks } from './helpers';
import { findAvailablePosition, markBlocksOccupied } from './placement';

// Schedules approximate time tasks (approximate_planned_time)
export function scheduleApproximateTasks(tasks, occupiedBlocks, taskPositions, errors, startBlock, isToday) {
  const approximateTasks = sortTasks(tasks.filter(task => task.approximate_planned_time));
  approximateTasks.forEach(task => {
    if (!task.approximate_start || !task.approximate_end) {
      errors.push(`Invalid time block for task "${task.description}"`);
      return;
    }
    // Parse start/end as HH:MM
    const [startHour, startMinute] = task.approximate_start.split(':').map(Number);
    const [endHour, endMinute] = task.approximate_end.split(':').map(Number);
    let blockStart = Math.floor((startHour * 60 + startMinute) / 15) + 1;
    let endBlock = Math.floor((endHour * 60 + endMinute) / 15) + 1;
    // Handle crossing midnight
    if (endBlock <= blockStart) {
      endBlock += 96;
    }
    const length = Math.ceil(task.estimated_duration / 15);
    let effectiveStartBlock = blockStart;
    if (isToday) {
      effectiveStartBlock = Math.max(blockStart, startBlock);
    }
    const position = findAvailablePosition(effectiveStartBlock, endBlock, length, occupiedBlocks);
    if (position === -1) {
      errors.push(`Task "${task.description}" cannot fit into the ${task.approximate_planned_time}`);
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