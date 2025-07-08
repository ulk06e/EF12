/**
 * Task scheduling algorithm for 24-hour day overview
 * Calculates positions for tasks based on their time constraints
 */

// Block size in minutes (change this to adjust granularity)
const BLOCK_SIZE_MINUTES = 5;
const BLOCKS_PER_DAY = 24 * 60 / BLOCK_SIZE_MINUTES; // 288 for 5-min blocks

// --- Helper: Check if blocks are available for a task ---
const areBlocksAvailable = (startBlock, length, occupiedBlocks) => {
  for (let i = startBlock; i < startBlock + length && i <= BLOCKS_PER_DAY; i++) {
    if (occupiedBlocks.has(i)) return false;
  }
  return true;
};

// --- Helper: Mark blocks as occupied for a task ---
const markBlocksOccupied = (startBlock, length, taskId, occupiedBlocks, taskPositions) => {
  for (let i = startBlock; i < startBlock + length && i <= BLOCKS_PER_DAY; i++) {
    occupiedBlocks.add(i);
  }
  taskPositions.set(taskId, { position: startBlock, length });
};

// --- Helper: Check for collisions with already scheduled tasks ---
const getCollidingTasks = (position, length, occupiedBlocks, taskPositions, tasks) => {
  const collidingTasks = new Set();
  for (let i = position; i < position + length && i <= BLOCKS_PER_DAY; i++) {
    if (occupiedBlocks.has(i)) {
      for (const [taskId, { position: taskPos, length: taskLen }] of taskPositions) {
        if (i >= taskPos && i < taskPos + taskLen) {
          const t = tasks.find(t => t.id === taskId);
          if (t) collidingTasks.add(t.description);
          break;
        }
      }
    }
  }
  return collidingTasks;
};

// --- Helper: Sort tasks by priority and quality ---
const sortTasks = (tasks) => {
  return tasks.slice().sort((a, b) => {
    const priorityA = a.priority || 20;
    const priorityB = b.priority || 20;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return (a.task_quality || 'D').localeCompare(b.task_quality || 'D');
  });
};

// --- Helper: Find first available position in a block range ---
const findAvailablePosition = (start, end, length, occupiedBlocks) => {
  for (let i = start; i <= end - length + 1; i++) {
    if (areBlocksAvailable(i, length, occupiedBlocks)) {
      return i;
    }
  }
  return -1;
};

// --- Helper: Convert block position to minutes since midnight ---
const blockToMinutes = (block) => {
  return (block - 1) * BLOCK_SIZE_MINUTES;
};

// --- Helper: Convert minutes since midnight to block position ---
const minutesToBlock = (minutes) => {
  return Math.floor(minutes / BLOCK_SIZE_MINUTES) + 1;
};

// --- Helper: Calculate precise time gaps between tasks ---
const calculatePreciseGaps = (sortedTasks, taskPositions, startTimeMinutes = 0) => {
  const gaps = [];
  
  // Convert start time to minutes
  const startMinutes = startTimeMinutes || 0;
  
  // If there are no tasks, create one gap from start to end of day
  if (sortedTasks.length === 0) {
    const gapMinutes = 24 * 60 - startMinutes;
    if (gapMinutes > 0) {
      gaps.push({
        type: 'gap',
        startMinutes: startMinutes,
        endMinutes: 24 * 60,
        minutes: gapMinutes
      });
    }
    return gaps;
  }
  
  // Calculate gap before first task
  const firstTask = sortedTasks[0];
  const firstTaskPosition = taskPositions.get(firstTask.id);
  if (firstTaskPosition) {
    const firstTaskStartMinutes = blockToMinutes(firstTaskPosition.position);
    if (firstTaskStartMinutes > startMinutes) {
      gaps.push({
        type: 'gap',
        startMinutes: startMinutes,
        endMinutes: firstTaskStartMinutes,
        minutes: firstTaskStartMinutes - startMinutes
      });
    }
  }
  
  // Calculate gaps between tasks
  for (let i = 0; i < sortedTasks.length - 1; i++) {
    const currentTask = sortedTasks[i];
    const nextTask = sortedTasks[i + 1];
    
    const currentTaskPosition = taskPositions.get(currentTask.id);
    const nextTaskPosition = taskPositions.get(nextTask.id);
    
    if (currentTaskPosition && nextTaskPosition) {
      const currentTaskEndMinutes = blockToMinutes(currentTaskPosition.position) + (currentTask.estimated_duration || 0);
      const nextTaskStartMinutes = blockToMinutes(nextTaskPosition.position);
      
      if (nextTaskStartMinutes > currentTaskEndMinutes) {
        gaps.push({
          type: 'gap',
          startMinutes: currentTaskEndMinutes,
          endMinutes: nextTaskStartMinutes,
          minutes: nextTaskStartMinutes - currentTaskEndMinutes
        });
      }
    }
  }
  
  // Calculate gap after last task
  const lastTask = sortedTasks[sortedTasks.length - 1];
  const lastTaskPosition = taskPositions.get(lastTask.id);
  if (lastTaskPosition) {
    const lastTaskEndMinutes = blockToMinutes(lastTaskPosition.position) + (lastTask.estimated_duration || 0);
    if (lastTaskEndMinutes < 24 * 60) {
      gaps.push({
        type: 'gap',
        startMinutes: lastTaskEndMinutes,
        endMinutes: 24 * 60,
        minutes: 24 * 60 - lastTaskEndMinutes
      });
    }
  }
  
  return gaps;
};

/**
 * Schedule tasks in a 24-hour day using 15-minute blocks
 * @param {Array} tasks - Array of task objects
 * @param {number} [startTimeMinutes] - Optional, start time in minutes since midnight (local time)
 * @returns {Object} - { scheduledTasks, errors }
 */
export const scheduleTasks = (tasks, startTimeMinutes) => {
  if (!tasks || tasks.length === 0) {
    return { scheduledTasks: tasks, errors: [] };
  }
  
  const errors = [];
  const occupiedBlocks = new Set(); // Track occupied blocks 1-BLOCKS_PER_DAY
  const taskPositions = new Map(); // task.id -> {position, length}
  
  // Determine the starting block (1-based)
  const startBlock = (typeof startTimeMinutes === 'number')
    ? Math.floor(startTimeMinutes / BLOCK_SIZE_MINUTES) + 1
    : 1;

  // Determine if this is 'today' (startTimeMinutes is provided and > 0)
  const isToday = typeof startTimeMinutes === 'number' && startTimeMinutes > 0;

  // --- Phase 1: Schedule fixed time tasks (planned_time) ---
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
    const position = Math.floor((hour * 60 + minute) / BLOCK_SIZE_MINUTES) + 1;
    const length = Math.ceil(task.estimated_duration / BLOCK_SIZE_MINUTES);
    
    if (position + length > BLOCKS_PER_DAY + 1) {
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
  
  // --- Phase 2: Schedule approximate time tasks (approximate_planned_time) ---
  const approximateTasks = sortTasks(tasks.filter(task => task.approximate_planned_time));
  approximateTasks.forEach(task => {
    // Use custom time block start/end
    if (!task.approximate_start || !task.approximate_end) {
      errors.push(`Invalid time block for task "${task.description}"`);
      return;
    }
    // Parse start/end as HH:MM
    const [startHour, startMinute] = task.approximate_start.split(':').map(Number);
    const [endHour, endMinute] = task.approximate_end.split(':').map(Number);
    let blockStart = Math.floor((startHour * 60 + startMinute) / BLOCK_SIZE_MINUTES) + 1;
    let endBlock = Math.floor((endHour * 60 + endMinute) / BLOCK_SIZE_MINUTES) + 1;
    // Handle crossing midnight
    if (endBlock <= blockStart) {
      endBlock += BLOCKS_PER_DAY; // add 24h worth of blocks
    }
    const length = Math.ceil(task.estimated_duration / BLOCK_SIZE_MINUTES);
    // For today, only allow scheduling in the future part of the block
    let effectiveStartBlock = blockStart;
    if (isToday) {
      effectiveStartBlock = Math.max(blockStart, startBlock);
    }
    // Try to find a position in the preferred period
    const position = findAvailablePosition(effectiveStartBlock, endBlock, length, occupiedBlocks);
    if (position === -1) {
      errors.push(`Task "${task.description}" cannot fit into the ${task.approximate_planned_time}`);
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
  
  // --- Phase 3: Schedule unassigned tasks (no time info) ---
  const unassignedTasks = sortTasks(tasks.filter(task => !task.planned_time && !task.approximate_planned_time));
  
  unassignedTasks.forEach(task => {
    const length = Math.ceil(task.estimated_duration / BLOCK_SIZE_MINUTES);
    
    // Find first available position anywhere in the day
    const position = findAvailablePosition(startBlock, BLOCKS_PER_DAY, length, occupiedBlocks);
    
    if (position === -1) {
      errors.push(`Task "${task.description}" cannot be scheduled.`);
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
  
  // --- Create ordered task list based on positions ---
  const sortedTasks = tasks
    .filter(task => taskPositions.has(task.id))
    .sort((a, b) => taskPositions.get(a.id).position - taskPositions.get(b.id).position);
  
  // Add tasks that couldn't be scheduled, explicitly marking them
  const unscheduledTasks = tasks
    .filter(task => !taskPositions.has(task.id))
    .map(task => {
      return { ...task, isUnscheduled: true };
    });
  
  // --- Find unaccounted time periods (gaps) ---
  const gaps = calculatePreciseGaps(sortedTasks, taskPositions, startTimeMinutes);
  
  // --- Merge tasks and gaps in chronological order ---
  const finalSchedule = [];
  let taskIndex = 0;
  let gapIndex = 0;
  
  while (taskIndex < sortedTasks.length || gapIndex < gaps.length) {
    const nextTask = sortedTasks[taskIndex];
    const nextGap = gaps[gapIndex];
    
    if (nextTask && nextGap) {
      const taskPosition = taskPositions.get(nextTask.id).position;
      const taskStartMinutes = blockToMinutes(taskPosition);
      if (nextGap.startMinutes < taskStartMinutes) {
        finalSchedule.push(nextGap);
        gapIndex++;
      } else {
        finalSchedule.push(nextTask);
        taskIndex++;
      }
    } else if (nextTask) {
      finalSchedule.push(nextTask);
      taskIndex++;
    } else if (nextGap) {
      finalSchedule.push(nextGap);
      gapIndex++;
    }
  }
  
  // --- Return the merged schedule and any errors ---
  return { 
    scheduledTasks: [...finalSchedule, ...unscheduledTasks], 
    errors,
    taskPositions // Return this for canScheduleTask
  };
};

/**
 * Check if a single task can be scheduled given the current plan items.
 * Returns the starting block position if it fits, or 0 if it cannot fit.
 * @param {Object} newTask - The task to check
 * @param {Array} allTasks - The current list of tasks (excluding newTask)
 * @param {number} [startTimeMinutes] - Optional, start time in minutes since midnight
 * @returns {boolean} - True if the task can be scheduled, false otherwise
 */
export function canScheduleTask(newTask, allTasks, startTimeMinutes) {
  const tasks = [...allTasks, newTask];
  const { scheduledTasks, errors } = scheduleTasks(tasks, startTimeMinutes);
  // Check if the new task was successfully scheduled (i.e., not marked as unscheduled)
  const scheduledNewTask = scheduledTasks.find(t => t.id === newTask.id);
  return !!scheduledNewTask && !scheduledNewTask.isUnscheduled;
} 