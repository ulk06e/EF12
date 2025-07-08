// XP-related utility functions

/**
 * Returns the smallest bigger value and its label from yesterday's XP, week average, and week best.
 * @param {number} todayXP - Today's XP value
 * @param {Array} xpData - Array of {day, xp} for the last 7 days
 * @returns {{label: string, value: number}|null}
 */
export function getComparisonXP(todayXP, xpData) {
  if (!xpData || xpData.length === 0) return null;
  const yesterdayXP = xpData.length >= 2 ? xpData[xpData.length - 2].xp : 0;
  const weekXPs = xpData.slice(0, xpData.length - 1).map(d => d.xp);
  const weekAvg = weekXPs.length > 0 ? Math.round(weekXPs.reduce((a, b) => a + b, 0) / weekXPs.length) : 0;
  const weekBest = weekXPs.length > 0 ? Math.max(...weekXPs) : 0;
  console.log('[getComparisonXP] todayXP:', todayXP);
  console.log('[getComparisonXP] xpData:', xpData);
  console.log('[getComparisonXP] yesterdayXP:', yesterdayXP);
  console.log('[getComparisonXP] weekXPs:', weekXPs);
  console.log('[getComparisonXP] weekAvg:', weekAvg);
  console.log('[getComparisonXP] weekBest:', weekBest);
  const candidates = [
    { label: 'Yest', value: yesterdayXP },
    { label: 'W. Avg', value: weekAvg },
    { label: 'W. Best', value: weekBest }
  ].filter(c => c.value > todayXP);
  if (candidates.length === 0) return null;
  return candidates.reduce((min, c) => c.value < min.value ? c : min, candidates[0]);
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