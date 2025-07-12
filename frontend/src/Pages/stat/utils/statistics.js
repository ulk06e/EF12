// Statistics calculation utilities

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get day from item
function getItemDay(item) {
  return (item.day_id || item.completed_time || '').slice(0, 10);
}

// Helper to get completed days set
function getCompletedDays(items) {
  return new Set(
    items
      .filter(item => item.completed_time)
      .map(getItemDay)
  );
}

// Helper to aggregate by day
function aggregateByDay(items, aggregator) {
  const byDay = {};
  items.forEach(item => {
    if (!item.completed_time) return;
    const day = getItemDay(item);
    byDay[day] = aggregator(byDay[day], item);
  });
  return byDay;
}

// Total XP
export function getTotalXP(items) {
  return items.reduce((sum, item) => sum + (item.xp_value || 0), 0);
}

// Total tasks (completed only)
export function getTotalTasks(items) {
  return items.filter(item => item.completed_time).length;
}

// Total actual duration (minutes)
export function getTotalActualDuration(items) {
  return items.reduce((sum, item) => sum + (item.actual_duration || 0), 0);
}

// Total planned duration (minutes)
export function getTotalPlannedDuration(items) {
  return items
    .filter(item => item.type !== 'daily_basic')
    .reduce((sum, item) => sum + (item.estimated_duration || 0), 0);
}

// Streak (current) - calculates from yesterday backwards + (1 if today's XP > 0)
export function getCurrentStreak(items) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const streakFromYesterday = getStreakAtDate(items, yesterday);
  
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const todayXP = items
    .filter(item => item.completed_time && getItemDay(item) === todayStr)
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);
  
  return streakFromYesterday + (todayXP > 0 ? 1 : 0);
}

// Streak at a specific date - for calculating streaks in previous periods
export function getStreakAtDate(items, endDate) {
  const days = getCompletedDays(items);
  let streak = 0;
  let d = new Date(endDate);
  
  while (true) {
    const dayStr = getLocalDateString(d);
    if (days.has(dayStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Best streak
export function getBestStreak(items) {
  const days = Array.from(getCompletedDays(items)).sort();
  if (days.length === 0) return 0;
  
  let best = 1;
  let current = 1;
  
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

// Best XP
export function getBestXP(items) {
  return Math.max(0, ...items.map(item => item.xp_value || 0));
}

// Best XP per day
export function getBestXPPerDay(items) {
  const xpByDay = aggregateByDay(items, (sum = 0, item) => sum + (item.xp_value || 0));
  return Object.values(xpByDay).length ? Math.max(...Object.values(xpByDay)) : 0;
}

// Best actual duration
export function getBestActualDuration(items) {
  return Math.max(0, ...items.map(item => item.actual_duration || 0));
}

// Best productivity
export function getBestProductivity(items) {
  const prodByDay = aggregateByDay(items, (sum = { xp: 0, actual: 0 }, item) => ({
    xp: sum.xp + (item.xp_value || 0),
    actual: sum.actual + (item.actual_duration || 0)
  }));
  
  let best = 0;
  Object.values(prodByDay).forEach(({ xp, actual }) => {
    if (actual > 0) best = Math.max(best, xp / actual);
  });
  return best;
}

// Average actual duration per task
export function getAvgActualDurationPerTask(items) {
  if (!items.length) return 0;
  return getTotalActualDuration(items) / items.length;
}

// Average plans duration per task
export function getAvgPlansDurationPerTask(items) {
  const filtered = items.filter(item => item.type !== 'daily_basic');
  if (!filtered.length) return 0;
  return getTotalPlannedDuration(filtered) / filtered.length;
}

// Average task quality
export function getAvgTaskQuality(items) {
  const qualityMap = { A: 4, B: 3, C: 2, D: 1 };
  const qualities = items
    .map(item => qualityMap[item.task_quality])
    .filter(q => q !== undefined);
  
  if (!qualities.length) return 0;
  return qualities.reduce((a, b) => a + b, 0) / qualities.length;
}

// Average priority
export function getAvgPriority(items) {
  const priorities = items
    .map(item => typeof item.priority === 'number' ? item.priority : null)
    .filter(p => p !== null && !isNaN(p));
  
  if (!priorities.length) return 0;
  return priorities.reduce((a, b) => a + b, 0) / priorities.length;
}

// Average productivity
export function getAvgProductivity(items) {
  const prodByDay = aggregateByDay(items, (sum = { xp: 0, actual: 0 }, item) => ({
    xp: sum.xp + (item.xp_value || 0),
    actual: sum.actual + (item.actual_duration || 0)
  }));
  
  const productivities = Object.values(prodByDay)
    .map(({ xp, actual }) => (actual > 0 ? xp / actual : 0))
    .filter(p => p > 0);
  
  if (!productivities.length) return 0;
  return productivities.reduce((a, b) => a + b, 0) / productivities.length;
}

// Template: get all stats at once
export function getAllStats(items) {
  return {
    totalXP: getTotalXP(items),
    totalTasks: getTotalTasks(items),
    totalActualDuration: getTotalActualDuration(items),
    totalPlannedDuration: getTotalPlannedDuration(items),
    streak: getCurrentStreak(items),
    bestStreak: getBestStreak(items),
    bestXP: getBestXP(items),
    bestXPPerDay: getBestXPPerDay(items),
    bestActualDuration: getBestActualDuration(items),
    bestProductivity: getBestProductivity(items),
    avgActualDurationPerTask: getAvgActualDurationPerTask(items),
    avgPlansDurationPerTask: getAvgPlansDurationPerTask(items),
    avgTaskQuality: getAvgTaskQuality(items),
    avgPriority: getAvgPriority(items),
    avgProductivity: getAvgProductivity(items),
  };
}

// Filter items by selected view/time range
export function filterItemsByView(items, view = 'week', today = new Date()) {
  if (view === 'all') return items;
  
  const current = new Date(today);
  const viewConfig = {
    week: { days: 7 },
    '30d': { days: 30 },
    '1y': { days: 365 },
    quarter: { type: 'quarter' }
  };
  
  const config = viewConfig[view];
  if (!config) return items;
  
  let start, end;
  
  if (config.type === 'quarter') {
    const year = current.getFullYear();
    const month = current.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    start = new Date(year, quarterStartMonth, 1);
    end = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
  } else {
    start = new Date(current);
    start.setDate(current.getDate() - (config.days - 1));
    start.setHours(0, 0, 0, 0);
    end = current;
  }
  
  return items.filter(item => {
    const dayId = item.day_id || item.completed_time || item.created_time;
    if (!dayId) return false;
    const date = new Date(dayId.slice(0, 10));
    return date >= start && date <= end;
  });
}
