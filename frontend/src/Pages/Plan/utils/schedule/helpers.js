// General helpers for scheduling

export const getCollidingTasks = (position, length, occupiedBlocks, taskPositions, tasks) => {
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

export const sortTasks = (tasks) => {
  return tasks.slice().sort((a, b) => {
    const priorityA = a.priority || 10;
    const priorityB = b.priority || 10;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return (a.task_quality || 'D').localeCompare(b.task_quality || 'D');
  });
};
