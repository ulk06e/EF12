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
import { subDays } from 'date-fns';

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format minutes as h m
function formatDuration(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) return '0m';
  const val = Math.round(minutes);
  const h = Math.floor(val / 60);
  const m = Math.round(val % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatValue(label, value) {
  if (typeof value !== 'number' || isNaN(value)) return value;
  const rounded = Math.round(value * 10) / 10;
  
  if (/duration/i.test(label)) return formatDuration(value);
  if (/xp/i.test(label)) return `${rounded} xp`;
  if (/days/i.test(label)) return `${rounded} days`;
  return rounded;
}

// Helper to get previous period's items for the current view
function getPreviousPeriodItems(items, view, today = new Date()) {
  if (view === 'all') return [];
  
  const current = new Date(today);
  let daysBack;
  
  switch (view) {
    case 'week': daysBack = 7; break;
    case '30d': daysBack = 30; break;
    case 'quarter': daysBack = 91; break;
    case '1y': daysBack = 365; break;
    default: return [];
  }
  
  const endCurr = new Date(current);
  const startCurr = subDays(endCurr, daysBack - 1);
  const endPrev = subDays(startCurr, 1);
  const startPrev = subDays(endPrev, daysBack - 1);
  
  const startPrevStr = getLocalDateString(startPrev);
  const endPrevStr = getLocalDateString(endPrev);
  
  return items.filter(item => {
    const dayId = item.day_id || item.completed_time || item.created_time;
    if (!dayId) return false;
    const itemDateStr = dayId.slice(0, 10);
    return itemDateStr >= startPrevStr && itemDateStr <= endPrevStr;
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

// Helper to get total days in current period
function getTotalDaysInPeriod(view) {
  const daysMap = { week: 7, '30d': 30, quarter: 91, '1y': 365 };
  return daysMap[view] || 1;
}

export default function StatisticsSmall({ items, view }) {
  const filteredItems = filterItemsByView(items, view);
  const totalDaysInPeriod = getTotalDaysInPeriod(view);

  // Calculate stats
  const totalTasks = getTotalTasks(filteredItems);
  const totalXP = getTotalXP(filteredItems);
  const totalActualDuration = getTotalActualDuration(filteredItems);
  const totalPlannedDuration = getTotalPlannedDuration(filteredItems);
  const streak = getCurrentStreak(items);
  const bestStreak = getBestStreak(filteredItems);
  const bestXP = getBestXP(filteredItems);
  const bestXPPerDay = getBestXPPerDay(filteredItems);
  const bestActualDuration = getBestActualDuration(filteredItems);
  const bestProductivity = getBestProductivity(filteredItems);
  
  // Calculate averages per day (including days with zero activity)
  const avgXPPerDay = totalXP / totalDaysInPeriod;
  const avgTasksPerDay = totalTasks / totalDaysInPeriod;
  const avgActualDurationPerDay = totalActualDuration / totalDaysInPeriod;
  
  // These averages are per task (not per day), so keep as is
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
        { label: 'Average', value: Math.round(avgXPPerDay) }
      ]
    },
    {
      label: 'Tasks',
      sub: [
        { label: 'Total', value: totalTasks },
        { label: 'Best', value: bestXP },
        { label: 'Average', value: Math.round(avgTasksPerDay) }
      ]
    },
    {
      label: 'Actual Duration',
      sub: [
        { label: 'Total', value: totalActualDuration },
        { label: 'Best', value: bestActualDuration },
        { label: 'Average', value: avgActualDurationPerDay }
      ]
    },
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

  // Helper to render sub-parameters
  function renderParams(subs, cardLabel) {
    const validSubs = subs.filter(sub => sub.value !== null && sub.value !== undefined);
    
    return (
      <div className="statistics-small-params-vertical">
        {validSubs.map((sub, idx) => {
          let unit = '';
          let prevUnit = '';
          let prevValue = null;
          let colorClass = '';
          let prevColorClass = '';
          
          // Format units
          if (/duration/i.test(cardLabel)) {
            const val = Number(sub.value);
            if (!isNaN(val)) {
              unit = formatDuration(val);
            }
          } else if (/xp/i.test(cardLabel)) {
            unit = 'xp';
          }
          
          // Calculate previous period values
          if (view !== 'all') {
            const prevItems = getPreviousPeriodItems(items, view);
            
            if (/xp/i.test(cardLabel)) {
              prevValue = sub.label === 'Average' 
                ? getTotalXP(prevItems) / totalDaysInPeriod 
                : getTotalXP(prevItems);
              prevUnit = 'xp';
            } else if (/tasks/i.test(cardLabel)) {
              prevValue = sub.label === 'Average' 
                ? getTotalTasks(prevItems) / totalDaysInPeriod 
                : getTotalTasks(prevItems);
            } else if (/actual duration/i.test(cardLabel)) {
              prevValue = sub.label === 'Average' 
                ? getTotalActualDuration(prevItems) / totalDaysInPeriod 
                : getTotalActualDuration(prevItems);
              prevUnit = formatDuration(prevValue);
            } else if (/streak/i.test(cardLabel) && sub.label === 'Best') {
              prevValue = getBestStreak(prevItems);
            } else if (/productivity/i.test(cardLabel)) {
              prevValue = getAvgProductivity(prevItems);
            } else if (/quality/i.test(cardLabel)) {
              prevValue = getAvgTaskQuality(prevItems);
            } else if (/priority/i.test(cardLabel)) {
              prevValue = getAvgPriority(prevItems);
            }
            
            // Color logic
            if (prevValue !== null) {
              const isPriority = /priority/i.test(cardLabel);
              const isBetter = isPriority ? sub.value < prevValue : sub.value > prevValue;
              
              if (isBetter) {
                colorClass = 'stat-green';
                prevColorClass = 'stat-red';
              } else if (sub.value !== prevValue) {
                colorClass = 'stat-red';
                prevColorClass = 'stat-green';
              }
            }
          }
          
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
        {[CARDS.slice(0, 3), CARDS.slice(3, 6)].map((row, idx) => (
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