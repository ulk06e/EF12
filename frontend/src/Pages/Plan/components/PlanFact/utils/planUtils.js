// Plan-related utility functions will go here

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export function sortPlanItems(items) {
  return items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      const qualityA = qualityOrder[a.task_quality] || 5;
      const qualityB = qualityOrder[b.task_quality] || 5;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return qualityA - qualityB;
    });
}

export const planUtilsPlaceholder = () => {};

export function attachTimeBlocksToPlanItems(planItems, timeBlocks) {
  return planItems.map(item => {
    // Always try to parse daily_basic time range
    if (item.type === 'daily_basic' && item.approximate_planned_time) {
      const timeRange = item.approximate_planned_time;
      const match = timeRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (match) {
        return {
          ...item,
          approximate_start: match[1],
          approximate_end: match[2]
        };
      }
    }
    // Only use timeBlocks for non-daily_basic approximate time tasks
    if (item.approximate_planned_time && timeBlocks.length > 0) {
      const block = timeBlocks.find(
        b => b.name.trim().toLowerCase() === item.approximate_planned_time.trim().toLowerCase()
      );
      if (block) {
        return {
          ...item,
          approximate_start: block.start,
          approximate_end: block.end
        };
      }
    }
    return item;
  });
}

export function handleDuplicateTask(task, onAddTask) {
  const { id, completed_time, actual_duration, time_quality, project, ...rest } = task;
  const today = getTodayDateString();
  const taskDate = new Date(task.day_id);
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  const newTask = {
    ...rest,
    day_id: taskDate < startOfToday ? today : task.day_id,
  };
  onAddTask(newTask);
} 