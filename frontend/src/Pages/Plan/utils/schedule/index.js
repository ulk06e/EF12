import { scheduleFixedTasks } from './fixedLayer';
import { scheduleApproximateTasks } from './approximateLayer';
import { scheduleUnassignedTasks } from './unassignedLayer';
import { findGaps } from './gapFinder';

// Main orchestrator for scheduling
export function scheduleTasks(tasks, startTimeMinutes) {
  if (!tasks || tasks.length === 0) {
    return { scheduledTasks: tasks, errors: [], gaps: [] };
  }
  const errors = [];
  const occupiedBlocks = new Set();
  const taskPositions = new Map();
  const startBlock = (typeof startTimeMinutes === 'number')
    ? Math.floor(startTimeMinutes / 15) + 1
    : 1;
  const isToday = typeof startTimeMinutes === 'number' && startTimeMinutes > 0;

  // Layer 1: Fixed time tasks
  scheduleFixedTasks(tasks, occupiedBlocks, taskPositions, errors);
  // Layer 2: Approximate time tasks
  scheduleApproximateTasks(tasks, occupiedBlocks, taskPositions, errors, startBlock, isToday);
  // Layer 3: Unassigned tasks
  scheduleUnassignedTasks(tasks, occupiedBlocks, taskPositions, errors, startBlock);

  // Assemble scheduled and unscheduled tasks
  const scheduledTasks = tasks
    .filter(task => taskPositions.has(task.id))
    .sort((a, b) => taskPositions.get(a.id).position - taskPositions.get(b.id).position)
    .map(task => ({ ...task, position: taskPositions.get(task.id).position }));
  const unscheduledTasks = tasks
    .filter(task => !taskPositions.has(task.id))
    .map(task => ({ ...task, isUnscheduled: true }));

  // Find gaps
  const gaps = findGaps(startBlock, occupiedBlocks, 96, scheduledTasks);

  return {
    scheduledTasks,
    unscheduledTasks,
    errors,
    gaps,
    taskPositions,
  };
}

// Merge scheduled tasks and gaps in chronological order
export function mergeSchedule(scheduledTasks, gaps) {
  const merged = [];
  let taskIndex = 0;
  let gapIndex = 0;
  while (taskIndex < scheduledTasks.length || gapIndex < gaps.length) {
    const nextTask = scheduledTasks[taskIndex];
    const nextGap = gaps[gapIndex];
    if (nextTask && nextGap) {
      if (nextGap.startBlock < nextTask.position) {
        merged.push(nextGap);
        gapIndex++;
      } else {
        merged.push(nextTask);
        taskIndex++;
      }
    } else if (nextTask) {
      merged.push(nextTask);
      taskIndex++;
    } else if (nextGap) {
      merged.push(nextGap);
      gapIndex++;
    }
  }
  return merged;
}

// Check if a single task can be scheduled given the current plan items
export function canScheduleTask(newTask, allTasks, startTimeMinutes) {
  const tasks = [...allTasks, newTask];
  const { scheduledTasks, unscheduledTasks } = scheduleTasks(tasks, startTimeMinutes);
  // Check if the new task was successfully scheduled (i.e., not marked as unscheduled)
  const scheduledNewTask = scheduledTasks.find(t => t.id === newTask.id);
  return !!scheduledNewTask && !scheduledNewTask.isUnscheduled;
}
