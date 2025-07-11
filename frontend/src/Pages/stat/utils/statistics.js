// Statistics calculation utilities

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
  // Exclude daily_basic
  return items.filter(item => item.type !== 'daily_basic').reduce((sum, item) => sum + (item.estimated_duration || 0), 0);
}

// Streak (current)
export function getCurrentStreak(items) {
  const days = new Set(
    items
      .filter(item => item.completed_time)
      .map(item => (item.day_id || item.completed_time || '').slice(0, 10))
  );
  if (days.size === 0) return 0;
  let streak = 0;
  let d = new Date();
  while (true) {
    const dayStr = d.toISOString().slice(0, 10);
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
  const days = Array.from(
    new Set(
      items
        .filter(item => item.completed_time)
        .map(item => (item.day_id || item.completed_time || '').slice(0, 10))
    )
  ).sort();
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
  const xpByDay = {};
  items.forEach(item => {
    if (!item.completed_time) return;
    const day = (item.day_id || item.completed_time || '').slice(0, 10);
    xpByDay[day] = (xpByDay[day] || 0) + (item.xp_value || 0);
  });
  return Object.values(xpByDay).length ? Math.max(...Object.values(xpByDay)) : 0;
}

// Best actual duration
export function getBestActualDuration(items) {
  return Math.max(0, ...items.map(item => item.actual_duration || 0));
}

// Best productivity
export function getBestProductivity(items) {
  const prodByDay = {};
  items.forEach(item => {
    if (!item.completed_time) return;
    const day = (item.day_id || item.completed_time || '').slice(0, 10);
    prodByDay[day] = prodByDay[day] || { xp: 0, actual: 0 };
    prodByDay[day].xp += item.xp_value || 0;
    prodByDay[day].actual += item.actual_duration || 0;
  });
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
  // Exclude daily_basic
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
  const prodByDay = {};
  items.forEach(item => {
    if (!item.completed_time) return;
    const day = (item.day_id || item.completed_time || '').slice(0, 10);
    prodByDay[day] = prodByDay[day] || { xp: 0, actual: 0 };
    prodByDay[day].xp += item.xp_value || 0;
    prodByDay[day].actual += item.actual_duration || 0;
  });
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
  if (view === '1y') {
    // Last 365 days
    const start = new Date(current);
    start.setDate(current.getDate() - 364);
    start.setHours(0, 0, 0, 0);
    return items.filter(item => {
      const dayId = item.day_id || item.completed_time || item.created_time;
      if (!dayId) return false;
      const date = new Date(dayId.slice(0, 10));
      return date >= start && date <= current;
    });
  }
  if (view === '30d') {
    // Last 30 days
    const start = new Date(current);
    start.setDate(current.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return items.filter(item => {
      const dayId = item.day_id || item.completed_time || item.created_time;
      if (!dayId) return false;
      const date = new Date(dayId.slice(0, 10));
      return date >= start && date <= current;
    });
  }
  if (view === 'quarter') {
    // Current quarter (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)
    const year = current.getFullYear();
    const month = current.getMonth(); // 0-11
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const start = new Date(year, quarterStartMonth, 1);
    const end = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999); // last day of quarter
    return items.filter(item => {
      const dayId = item.day_id || item.completed_time || item.created_time;
      if (!dayId) return false;
      const date = new Date(dayId.slice(0, 10));
      return date >= start && date <= end;
    });
  }
  // For 'week', filter items to last 7 days ending today (rolling window)
  if (view === 'week') {
    const start = new Date(current);
    start.setDate(current.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return items.filter(item => {
      const dayId = item.day_id || item.completed_time || item.created_time;
      if (!dayId) return false;
      const date = new Date(dayId.slice(0, 10));
      return date >= start && date <= current;
    });
  }
}
