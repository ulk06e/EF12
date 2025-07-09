// Fact-related utility functions will go here

import { formatCompletedTimeForDisplay, getLocalDateObjectFromCompletedTime } from 'src/shared/utils/time.js';

export function prepareFactCards(items) {
  // Sort fact items by completed_time descending (newest first)
  const factItems = items
    .filter(item => item.column_location === 'fact' && item.type !== 'bonus')
    .sort((a, b) => {
      if (a.completed_time && b.completed_time) {
        return b.completed_time.localeCompare(a.completed_time);
      }
      if (a.completed_time) return -1;
      if (b.completed_time) return 1;
      return b.id.localeCompare(a.id);
    });

  // Calculate unaccounted time and format time for fact items
  return factItems.map((item, idx) => {
    let unaccounted = null;
    const prevItemInTime = factItems[idx + 1];
    if (item.completed_time) {
      const currentTime = getLocalDateObjectFromCompletedTime(item.completed_time);
      if (prevItemInTime && prevItemInTime.completed_time) {
        const previousTime = getLocalDateObjectFromCompletedTime(prevItemInTime.completed_time);
        const timeBetweenTasks = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);
        unaccounted = Math.max(0, timeBetweenTasks - (item.actual_duration || 0));
      } else {
        const startOfDay = new Date(currentTime);
        startOfDay.setHours(0, 0, 0, 0);
        const timeSinceStartOfDay = (currentTime.getTime() - startOfDay.getTime()) / (1000 * 60);
        // For the first task, unaccounted time is the time from start of day until task completion
        // Don't subtract task duration as this represents time BEFORE the task
        unaccounted = Math.max(0, timeSinceStartOfDay);
      }
    }
    const formatted_time = formatCompletedTimeForDisplay(item.completed_time);
    return {
      ...item,
      unaccounted,
      formatted_time
    };
  });
}

export const factUtilsPlaceholder = () => {}; 