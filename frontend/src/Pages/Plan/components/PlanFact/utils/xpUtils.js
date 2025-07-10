// XP-related utility functions

/**
 * Returns the smallest bigger value and its label from yesterday's XP, week average, and week best.
 * @param {number} todayXP - Today's XP value
 * @param {Array} xpData - Array of {day, xp} for the last 7 days
 * @returns {{label: string, value: number}|null}
 */
export function getComparisonXP(todayXP, xpData, selectedDay) {
  if (!xpData || xpData.length === 0) return null;
  const yesterdayXP = xpData.length >= 2 ? xpData[xpData.length - 2].xp : 0;
  const weekXPs = xpData.slice(0, xpData.length - 1).map(d => d.xp);
  const weekAvg = weekXPs.length > 0 ? Math.round(weekXPs.reduce((a, b) => a + b, 0) / weekXPs.length) : 0;
  const weekBest = weekXPs.length > 0 ? Math.max(...weekXPs) : 0;

  // Find this day last week
  let lastWeekXP = null;
  let lastWeekLabel = null;
  if (selectedDay) {
    const selectedDate = new Date(selectedDay);
    const lastWeekDate = new Date(selectedDate);
    lastWeekDate.setDate(selectedDate.getDate() - 7);
    const lastWeekDayStr = lastWeekDate.toISOString().slice(0, 10);
    const lastWeekData = xpData.find(d => d.day === lastWeekDayStr);
    if (lastWeekData) {
      lastWeekXP = lastWeekData.xp;
      const weekday = lastWeekDate.toLocaleDateString(undefined, { weekday: 'short' });
      lastWeekLabel = `Last ${weekday}`;
    }
  }

  const candidates = [
    { label: 'Ytd', value: yesterdayXP },
    { label: 'W. Avg', value: weekAvg },
    { label: 'W. Best', value: weekBest }
  ];
  if (lastWeekXP !== null) {
    candidates.push({ label: lastWeekLabel, value: lastWeekXP });
  }
  const filtered = candidates.filter(c => c.value > todayXP);
  if (filtered.length === 0) return null;
  return filtered.reduce((min, c) => c.value < min.value ? c : min, filtered[0]);
}

/**
 * Attaches approximate_start and approximate_end to plan items using time blocks.
 * @param {Array} planItems - The plan items
 * @param {Array} timeBlocks - The time blocks
 * @returns {Array} - Plan items with attached time block info
 */
export function attachTimeBlocks(planItems, timeBlocks) {
  return planItems.map(item => {
    if (item.approximate_planned_time && timeBlocks.length > 0) {
      if (item.type === 'daily_basic') {
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