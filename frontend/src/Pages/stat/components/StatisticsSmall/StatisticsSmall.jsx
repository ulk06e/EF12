import React from 'react';
import 'src/shared/styles/Column.css';
import './StatisticsSmall.css';
import {
  filterItemsByView,
  getTotalTasks,
  getTotalXP,
  getTotalActualDuration,
  getTotalPlannedDuration,
  getCurrentStreak,
  getBestStreak,
  getBestXP,
  getBestXPPerDay,
  getBestActualDuration,
  getBestProductivity,
  getAvgActualDurationPerTask,
  getAvgPlansDurationPerTask,
  getAvgTaskQuality,
  getAvgPriority,
  getAvgProductivity
} from 'src/Pages/stat/utils/statistics';
import { addDays, subDays } from 'date-fns';

// Helper to format minutes as y mo d h m (only nonzero units)
function formatDuration(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) return '0m';
  let m = Math.round(minutes);
  const y = Math.floor(m / 525600); // 365*24*60
  m -= y * 525600;
  const mo = Math.floor(m / 43800); // 30.42*24*60
  m -= mo * 43800;
  const d = Math.floor(m / 1440);
  m -= d * 1440;
  const h = Math.floor(m / 60);
  m -= h * 60;
  const parts = [];
  if (y) parts.push(`${y}y`);
  if (mo) parts.push(`${mo}mo`);
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.length ? parts.join(' ') : '0m';
}

function formatValue(label, value) {
  // If value is not a number, just return as is
  if (typeof value !== 'number' || isNaN(value)) return value;
  // Round to 1 digit
  const rounded = Math.round(value * 10) / 10;
  // Decide unit
  if (/duration/i.test(label)) {
    return formatDuration(value);
  }
  if (/xp/i.test(label)) {
    return `${rounded} xp`;
  }
  if (/productivity/i.test(label)) {
    return `${rounded}`;
  }
  if (/streak/i.test(label) || /tasks/i.test(label)) {
    return `${rounded}`;
  }
  if (/days/i.test(label)) {
    return `${rounded} days`;
  }
  if (/quality/i.test(label)) {
    return `${rounded}`;
  }
  if (/priority/i.test(label)) {
    return `${rounded}`;
  }
  return rounded;
}

// Helper to get previous period's items for the current view
function getPreviousPeriodItems(items, view, today = new Date()) {
  let startPrev, endPrev;
  let startCurr, endCurr;
  const current = new Date(today);
  if (view === 'week') {
    endCurr = new Date(current);
    startCurr = subDays(endCurr, 6);
    endPrev = subDays(startCurr, 1);
    startPrev = subDays(endPrev, 6);
  } else if (view === '30d') {
    endCurr = new Date(current);
    startCurr = subDays(endCurr, 29);
    endPrev = subDays(startCurr, 1);
    startPrev = subDays(endPrev, 29);
  } else if (view === 'quarter') {
    endCurr = new Date(current);
    startCurr = subDays(endCurr, 91);
    endPrev = subDays(startCurr, 1);
    startPrev = subDays(endPrev, 91);
  } else if (view === '1y') {
    endCurr = new Date(current);
    startCurr = subDays(endCurr, 364);
    endPrev = subDays(startCurr, 1);
    startPrev = subDays(endPrev, 364);
  } else {
    // For 'all', just return []
    return [];
  }
  return items.filter(item => {
    const dayId = item.day_id || item.completed_time || item.created_time;
    if (!dayId) return false;
    const date = new Date(dayId.slice(0, 10));
    return date >= startPrev && date <= endPrev;
  });
}

// Helper to convert numeric quality to letter
function qualityToLetter(value) {
  if (value >= 3.5) return 'A';
  if (value >= 2.5) return 'B';
  if (value >= 1.5) return 'C';
  if (value >= 0) return 'D';
  return '';
}

export default function StatisticsSmall({ items, view }) {
  const filteredItems = filterItemsByView(items, view);

  // Calculate stats
  const totalTasks = getTotalTasks(filteredItems);
  const totalXP = getTotalXP(filteredItems);
  const totalActualDuration = getTotalActualDuration(filteredItems);
  const totalPlannedDuration = getTotalPlannedDuration(filteredItems);
  const streak = getCurrentStreak(filteredItems);

  const bestStreak = getBestStreak(filteredItems);
  const bestXP = getBestXP(filteredItems);
  const bestXPPerDay = getBestXPPerDay(filteredItems);
  const bestActualDuration = getBestActualDuration(filteredItems);
  const bestProductivity = getBestProductivity(filteredItems);

  const avgActualDurationPerTask = getAvgActualDurationPerTask(filteredItems);
  const avgPlansDurationPerTask = getAvgPlansDurationPerTask(filteredItems);
  const avgTaskQuality = getAvgTaskQuality(filteredItems);
  const avgPriority = getAvgPriority(filteredItems);
  const avgProductivity = getAvgProductivity(filteredItems);

  // Grouped cards
  const CARDS = [
    {
      label: 'XP',
      sub: [
        { label: 'Total', value: totalXP },
        { label: 'Best', value: bestXPPerDay },
        { label: 'Average', value: Math.round(totalXP / (filteredItems.length ? new Set(filteredItems.filter(i => i.completed_time).map(i => (i.day_id || i.completed_time || '').slice(0, 10))).size : 1)) }
      ]
    },
    {
      label: 'Tasks',
      sub: [
        { label: 'Total', value: totalTasks },
        { label: 'Best', value: bestXP },
        { label: 'Average', value: Math.round(totalTasks / (filteredItems.length ? new Set(filteredItems.filter(i => i.completed_time).map(i => (i.day_id || i.completed_time || '').slice(0, 10))).size : 1)) }
      ]
    },
    {
      label: 'Actual Duration',
      sub: [
        { label: 'Total', value: totalActualDuration },
        { label: 'Best', value: bestActualDuration },
        { label: 'Average', value: avgActualDurationPerTask }
      ]
    },
    // Second row: Streak, Productivity, Quality and Priority
    {
      label: 'Streak',
      sub: [
        { label: 'Current', value: streak },
        { label: 'Best', value: bestStreak }
      ]
    },
    {
      label: 'Productivity',
      sub: [
        { label: 'Average', value: avgProductivity },
        { label: 'Best', value: bestProductivity }
      ]
    },
    {
      label: 'Quality and Priority',
      sub: [
        { label: 'Average Quality', value: avgTaskQuality },
        { label: 'Average Priority', value: avgPriority }
      ]
    }
  ];

  // Split cards: 2 rows of 3 columns
  const cardRows = [
    CARDS.slice(0, 3), // first row: 3 cards
    CARDS.slice(3, 6), // second row: 3 cards
  ];

  // Helper to render sub-parameters in the new style
  function renderParams(subs, cardLabel) {
    // Only show non-null, non-undefined
    const validSubs = subs.filter(sub => sub.value !== null && sub.value !== undefined);
    return (
      <div className="statistics-small-params-vertical">
        {validSubs.map((sub, idx) => {
          // Determine unit and value formatting
          let unit = '';
          let prevUnit = '';
          let prevValue = null;
          let colorClass = '';
          let prevColorClass = '';
          if (/duration/i.test(cardLabel)) {
            // Format as h m if >= 60
            const val = Number(sub.value);
            if (!isNaN(val)) {
              const h = Math.floor(val / 60);
              const m = Math.round(val % 60);
              unit = h > 0 ? `${h}h ${m}m` : `${m}m`;
            }
          } else if (/xp/i.test(cardLabel)) {
            unit = 'xp';
          }
          // Get previous period value for all rows (not just Total)
          if (view !== 'all') {
            let prevItems = getPreviousPeriodItems(filteredItems, view);
            if (/xp/i.test(cardLabel)) {
              prevValue = getTotalXP(prevItems);
              prevUnit = 'xp';
            } else if (/tasks/i.test(cardLabel)) {
              prevValue = getTotalTasks(prevItems);
            } else if (/actual duration/i.test(cardLabel)) {
              prevValue = getTotalActualDuration(prevItems);
              // Format as h m
              const val = Number(prevValue);
              if (!isNaN(val)) {
                const h = Math.floor(val / 60);
                const m = Math.round(val % 60);
                prevUnit = h > 0 ? `${h}h ${m}m` : `${m}m`;
              }
            } else if (/planned duration/i.test(cardLabel)) {
              prevValue = getTotalPlannedDuration(prevItems);
              // Format as h m
              const val = Number(prevValue);
              if (!isNaN(val)) {
                const h = Math.floor(val / 60);
                const m = Math.round(val % 60);
                prevUnit = h > 0 ? `${h}h ${m}m` : `${m}m`;
              }
            } else if (/streak/i.test(cardLabel)) {
              prevValue = getCurrentStreak(prevItems);
            } else if (/productivity/i.test(cardLabel)) {
              prevValue = getAvgProductivity(prevItems);
            } else if (/quality/i.test(cardLabel)) {
              prevValue = getAvgTaskQuality(prevItems);
            } else if (/priority/i.test(cardLabel)) {
              prevValue = getAvgPriority(prevItems);
            }
            // Color logic
            if (prevValue !== null) {
              if (/priority/i.test(cardLabel)) {
                if (sub.value < prevValue) colorClass = 'stat-green';
                else if (sub.value > prevValue) colorClass = 'stat-red';
                if (prevValue < sub.value) prevColorClass = 'stat-green';
                else if (prevValue > sub.value) prevColorClass = 'stat-red';
              } else {
                if (sub.value > prevValue) colorClass = 'stat-green';
                else if (sub.value < prevValue) colorClass = 'stat-red';
                if (prevValue > sub.value) prevColorClass = 'stat-green';
                else if (prevValue < sub.value) prevColorClass = 'stat-red';
              }
            }
          }
          // For durations and XP, do not append unit if already included in value
          const isUnitIncluded = /duration|xp/i.test(cardLabel);
          return (
            <div className="statistics-small-param-row lr" key={sub.label}>
              <span className="statistics-small-param-desc-row left">{sub.label}</span>
              <span className="statistics-small-param-value-rose right">
                {view !== 'all' && prevValue !== null && (
                  <span className={prevColorClass}>
                    {cardLabel === 'Quality and Priority' && sub.label === 'Average Quality'
                      ? `${formatValue(cardLabel, prevValue)} (${qualityToLetter(prevValue)})`
                      : formatValue(cardLabel, prevValue)
                    }
                    {!isUnitIncluded && prevUnit && <span className="statistics-small-param-unit"> {prevUnit}</span>}
                  </span>
                )}
                {view !== 'all' && prevValue !== null && <span className="statistics-small-param-unit"> → </span>}
                <span className={`value-fixed right ${colorClass}`}>
                  {cardLabel === 'Quality and Priority' && sub.label === 'Average Quality'
                    ? `${formatValue(cardLabel, sub.value)} (${qualityToLetter(sub.value)})`
                    : formatValue(cardLabel, sub.value)
                  }
                  {!isUnitIncluded && unit && <span className="statistics-small-param-unit"> {unit}</span>}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>Numbers</h3>
        </div>
        {cardRows.map((row, idx) => (
          <div className={`statistics-small-row${idx === 1 ? ' second' : ''}`} key={idx}>
            {row.map(card => (
              <div className="statistics-small-card grouped" key={card.label}>
                <div className="statistics-small-label statistics-small-header">{card.label}</div>
                <div className="statistics-small-divider" />
                {renderParams(card.sub, card.label)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 