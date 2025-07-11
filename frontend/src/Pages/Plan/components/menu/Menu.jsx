import React, { useState } from 'react';

// Helper to calculate XP for a plan task (with avg time quality, penalty=1)
function calculatePotentialXP(task, avgTimeQuality = 1.25) {
  if (!task) return 0;
  // Quality multiplier
  let quality = 1;
  if (task.task_quality === 'A') quality = 4;
  else if (task.task_quality === 'B') quality = 3;
  else if (task.task_quality === 'C') quality = 2;
  else if (task.task_quality === 'D') quality = 1;
  // Priority multiplier
  let priority = 1;
  if (task.priority === 1) priority = 1.5;
  else if (task.priority === 2) priority = 1.4;
  else if (task.priority === 3) priority = 1.3;
  else priority = 1.0;
  // Time quality multiplier (use average)
  const timeQuality = avgTimeQuality;
  // Penalty is always 1
  const penalty = 1;
  // Base XP
  const baseXP = (task.estimated_duration || 0) / 10;
  return baseXP * quality * timeQuality * priority * penalty;
}

export default function Menu({
  onShowSettings,
  onShowStatistics,
  items,
  selectedDay,
  onChangeStatsView
}) {
  // Calculate stats in JS here
  const factTasks = items.filter(
    t => t.column_location === 'fact' && (t.day_id || '').slice(0, 10) === selectedDay && t.type !== 'daily_basic'
  );
  const planTasks = items.filter(
    t => t.column_location === 'plan' && (t.day_id || '').slice(0, 10) === selectedDay && t.type !== 'daily_basic'
  );
  const xpFact = factTasks.reduce((sum, t) => sum + (t.xp_value || 0), 0);
  const actualDuration = factTasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0);
  const productivityRaw = actualDuration > 0 ? (xpFact / actualDuration) : 0;
  const productivity = actualDuration > 0 ? (productivityRaw / (1440 / actualDuration)).toFixed(2) : '0';
  const xpPlan = planTasks.reduce((sum, t) => sum + calculatePotentialXP(t), 0);
  const estimatedDuration = planTasks.reduce((sum, t) => sum + (t.estimated_duration || 0), 0);
  const totalDuration = estimatedDuration + actualDuration;
  const potentialRaw = totalDuration > 0 ? ((xpPlan + xpFact) / totalDuration) : 0;
  const potential = totalDuration > 0 ? (potentialRaw / (1440 / totalDuration)).toFixed(2) : '0';

  // Determine which stat to show
  const todayStr = new Date().toISOString().slice(0, 10);
  const selected = new Date(selectedDay);
  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  const isToday = selected.getTime() === today.getTime();
  const isFuture = selected > today;
  const isPast = selected < today;
  let statLabel = '';
  let statValue = '';
  if (isToday || isFuture) {
    statLabel = 'Potential';
    statValue = potential;
  } else if (isPast) {
    statLabel = 'Productivity';
    statValue = productivity;
  }

  // Stats view selection
  const VIEWS = [
    { label: 'All Time', value: 'all' },
    { label: '5 Years', value: '5y' },
    { label: '1 Year', value: '1y' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
  ];
  const [selectedView, setSelectedView] = useState('all');

  const handleViewChange = (value) => {
    setSelectedView(value);
    if (onChangeStatsView) onChangeStatsView(value);
  };

  return (
    <div className="columns-container">
      <div className="column">
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#2563eb', marginRight: 0 }}>{statValue}</span>
            <div style={{ width: 1, height: 28, background: '#e5e7eb', margin: '0 16px' }}></div>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#f59e42', marginRight: 6 }}>0</span>
            <span style={{ fontSize: 24 }}>🔥</span>
          </div>
          <div className="header-buttons">
            <button className="settings-button" onClick={onShowSettings}>Settings</button>
            <button className="add-button details-button" onClick={onShowStatistics}>Details</button>
          </div>
        </div>
      </div>
    </div>
  );
} 