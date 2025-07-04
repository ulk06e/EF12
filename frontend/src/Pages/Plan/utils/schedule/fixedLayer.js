import { getCollidingTasks } from './helpers';
import { markBlocksOccupied } from './placement';

// Schedules fixed time tasks (planned_time)
export function scheduleFixedTasks(tasks, occupiedBlocks, taskPositions, errors) {
  const fixedTimeTasks = tasks.filter(task => task.planned_time);
  fixedTimeTasks.forEach(task => {
    // Parse planned_time as HH:MM
    const timeMatch = task.planned_time.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      errors.push(`Invalid time format for task "${task.description}"`);
      return;
    }
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const position = Math.floor((hour * 60 + minute) / 15) + 1;
    const length = Math.ceil(task.estimated_duration / 15);
    if (position + length > 97) {
      errors.push(`Task "${task.description}" doesn't fit in day`);
      return;
    }
    // Check for collisions
    const collidingTasks = getCollidingTasks(position, length, occupiedBlocks, taskPositions, tasks);
    if (collidingTasks.size > 0) {
      const taskNames = [...collidingTasks].slice(0, 2).map(n => `"${n}"`).join(' and ');
      errors.push(`Task "${task.description}" collides with ${taskNames}`);
      return;
    }
    markBlocksOccupied(position, length, task.id, occupiedBlocks, taskPositions);
  });
}
