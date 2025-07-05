/**
 * XP calculation utilities for the PlanFact columns
 */

/**
 * Calculate today's XP from completed tasks for a given day
 * @param {Array} items - Array of task items
 * @param {string} selectedDay - The selected day in YYYY-MM-DD format
 * @returns {number} Total XP for the day
 */
export function calculateTodayXP(items, selectedDay) {
  return items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === selectedDay && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);
}

/**
 * Calculate yesterday's XP from completed tasks
 * @param {Array} items - Array of task items
 * @param {string} selectedDay - The selected day in YYYY-MM-DD format
 * @returns {number} Total XP for yesterday
 */
export function calculateYesterdayXP(items, selectedDay) {
  const yesterday = new Date(selectedDay);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  return items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === yesterdayString && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);
}

/**
 * Calculate week average XP (last 7 days)
 * @param {Array} items - Array of task items
 * @param {string} selectedDay - The selected day in YYYY-MM-DD format
 * @returns {number} Average XP for the last 7 days
 */
export function calculateWeekAverageXP(items, selectedDay) {
  const weekStart = new Date(selectedDay);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day.toISOString().split('T')[0]);
  }
  
  const weekXPValues = weekDays.map(day => 
    items
      .filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time)
      .reduce((sum, item) => sum + (item.xp_value || 0), 0)
  );
  
  return Math.round(weekXPValues.reduce((sum, xp) => sum + xp, 0) / 7);
}

/**
 * Calculate best week XP (highest XP in last 7 days)
 * @param {Array} items - Array of task items
 * @param {string} selectedDay - The selected day in YYYY-MM-DD format
 * @returns {number} Highest XP value from the last 7 days
 */
export function calculateBestWeekXP(items, selectedDay) {
  const weekStart = new Date(selectedDay);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day.toISOString().split('T')[0]);
  }
  
  const weekXPValues = weekDays.map(day => 
    items
      .filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time)
      .reduce((sum, item) => sum + (item.xp_value || 0), 0)
  );
  
  return Math.max(...weekXPValues);
}

/**
 * Find the closest higher XP value compared to today's XP
 * @param {Array} items - Array of task items
 * @param {string} selectedDay - The selected day in YYYY-MM-DD format
 * @returns {Object|null} Object with value and label, or null if no higher values found
 */
export function getClosestHigherXP(items, selectedDay) {
  const todayXP = calculateTodayXP(items, selectedDay);
  const yesterdayXP = calculateYesterdayXP(items, selectedDay);
  const weekAverageXP = calculateWeekAverageXP(items, selectedDay);
  const bestWeekXP = calculateBestWeekXP(items, selectedDay);

  const comparisons = [
    { value: yesterdayXP, label: 'yest' },
    { value: weekAverageXP, label: 'week avg' },
    { value: bestWeekXP, label: 'best' }
  ];
  
  const higherValues = comparisons.filter(comp => comp.value > todayXP);
  
  if (higherValues.length === 0) {
    return null; // No higher values found
  }
  
  // Find the closest higher value
  const closest = higherValues.reduce((closest, current) => {
    const closestDiff = closest.value - todayXP;
    const currentDiff = current.value - todayXP;
    return currentDiff < closestDiff ? current : closest;
  });
  
  return closest;
} 