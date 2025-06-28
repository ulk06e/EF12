// Utility functions for date/time calculations and scheduling logic

/**
 * Get the Monday of the current week
 * @returns {Date} Monday of the current week
 */
export function getCurrentWeekMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return monday;
}

/**
 * Get the Monday of a specific week
 * @param {Date} date - Any date in the target week
 * @returns {Date} Monday of the target week
 */
export function getWeekMonday(date) {
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
  return monday;
}

/**
 * Check if it's time for a weekly update (Sunday 00:00)
 * @returns {boolean} True if it's Sunday 00:00
 */
export function isWeeklyUpdateTime() {
  const now = new Date();
  const isSunday = now.getDay() === 0;
  const isMidnight = now.getHours() === 0 && now.getMinutes() < 5; // Within first 5 minutes
  return isSunday && isMidnight;
}

/**
 * Get the next Sunday 00:00 time
 * @returns {Date} Next Sunday at 00:00
 */
export function getNextWeeklyUpdateTime() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
}

/**
 * Format time until next update
 * @returns {string} Human readable time until next update
 */
export function getTimeUntilNextUpdate() {
  const nextUpdate = getNextWeeklyUpdateTime();
  const now = new Date();
  const diff = nextUpdate - now;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
} 