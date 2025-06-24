/**
 * Task scheduling algorithm for 24-hour day overview
 * Calculates positions for tasks based on their time constraints
 */

// --- Helper: Check if blocks are available for a task ---
const areBlocksAvailable = (startBlock, length, occupiedBlocks) => {
  for (let i = startBlock; i < startBlock + length && i <= 96; i++) {
    if (occupiedBlocks.has(i)) return false;
  }
  return true;
};

// --- Helper: Mark blocks as occupied for a task ---
const markBlocksOccupied = (startBlock, length, taskId, occupiedBlocks, taskPositions) => {
  for (let i = startBlock; i < startBlock + length && i <= 96; i++) {
    occupiedBlocks.add(i);
  }
  taskPositions.set(taskId, { position: startBlock, length });
};

// --- Helper: Check for collisions with already scheduled tasks ---
const getCollidingTasks = (position, length, occupiedBlocks, taskPositions, tasks) => {
  const collidingTasks = new Set();
  for (let i = position; i < position + length && i <= 96; i++) {
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
    const priorityA = a.priority || 10;
    const priorityB = b.priority || 10;
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
  const occupiedBlocks = new Set(); // Track occupied blocks 1-96
  const taskPositions = new Map(); // task.id -> {position, length}
  
  // Determine the starting block (1-based)
  const startBlock = (typeof startTimeMinutes === 'number')
    ? Math.floor(startTimeMinutes / 15) + 1
    : 1;
  
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
  
  // --- Phase 2: Schedule approximate time tasks (approximate_planned_time) ---
  const periods = [
    { name: 'NIGHT', start: 1, end: 24 },      // 0-6 hours
    { name: 'MORNING', start: 25, end: 48 },   // 6-12 hours
    { name: 'AFTERNOON', start: 49, end: 72 }, // 12-18 hours
    { name: 'EVENING', start: 73, end: 96 }    // 18-24 hours
  ];
  
  const periodMap = { 'night': 0, 'morning': 1, 'afternoon': 2, 'evening': 3 };
  
  const approximateTasks = sortTasks(tasks.filter(task => task.approximate_planned_time));
  
  approximateTasks.forEach(task => {
    const periodIndex = periodMap[task.approximate_planned_time];
    if (periodIndex === undefined) {
      errors.push(`Invalid approximate time for task "${task.description}"`);
      return;
    }
    
    const period = periods[periodIndex];
    const length = Math.ceil(task.estimated_duration / 15);
    
    // Try to find a position in the preferred period
    let position = findAvailablePosition(period.start, period.end, length, occupiedBlocks);
    
    // If not found, try other periods
    if (position === -1) {
      errors.push(`Task "${task.description}" cannot fit into the ${task.approximate_planned_time}`);
      
      for (const p of periods) {
        position = findAvailablePosition(p.start, p.end, length, occupiedBlocks);
        if (position !== -1) break;
      }
    }
    
    if (position === -1) return; // Error already logged
    
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
    const length = Math.ceil(task.estimated_duration / 15);
    
    // Find first available position anywhere in the day
    const position = findAvailablePosition(startBlock, 96, length, occupiedBlocks);
    
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
    .map(task => ({ ...task, isUnscheduled: true }));
  
  // --- Find unaccounted time periods (gaps) ---
  const gaps = [];
  let currentGapStart = -1;
  let currentGapLength = 0;
  
  for (let block = startBlock; block <= 96; block++) {
    if (!occupiedBlocks.has(block)) {
      if (currentGapStart === -1) {
        currentGapStart = block;
      }
      currentGapLength++;
    } else {
      if (currentGapStart !== -1 && currentGapLength > 0) {
        // Convert blocks to minutes (15 minutes per block)
        const gapMinutes = currentGapLength * 15;
        gaps.push({
          type: 'gap',
          startBlock: currentGapStart,
          endBlock: block - 1,
          minutes: gapMinutes
        });
      }
      currentGapStart = -1;
      currentGapLength = 0;
    }
  }
  
  // Handle gap at the end of the day
  if (currentGapStart !== -1 && currentGapLength > 0) {
    const gapMinutes = currentGapLength * 15;
    gaps.push({
      type: 'gap',
      startBlock: currentGapStart,
      endBlock: 96,
      minutes: gapMinutes
    });
  }
  
  // --- Merge tasks and gaps in chronological order ---
  const finalSchedule = [];
  let taskIndex = 0;
  let gapIndex = 0;
  
  while (taskIndex < sortedTasks.length || gapIndex < gaps.length) {
    const nextTask = sortedTasks[taskIndex];
    const nextGap = gaps[gapIndex];
    
    if (nextTask && nextGap) {
      const taskPosition = taskPositions.get(nextTask.id).position;
      if (nextGap.startBlock < taskPosition) {
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
 * @returns {number} - Starting block position if fits, or 0 if not
 */
export function canScheduleTask(newTask, allTasks, startTimeMinutes) {
  const { taskPositions } = scheduleTasks([...allTasks, newTask], startTimeMinutes);
  
  if (taskPositions.has(newTask.id)) {
    const position = taskPositions.get(newTask.id).position;
    return position;
  }
  
  return 0;
} 