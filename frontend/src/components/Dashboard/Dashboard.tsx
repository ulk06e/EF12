import React from 'react';
import './Dashboard.css';
import { SETTINGS } from '../../config';
import { formatMinutesToHours } from '../../utils/time';

export default function Dashboard({ items }) {
  // Calculate today's XP from completed tasks
  const today = new Date().toISOString().split('T')[0];
  const todayXP = items
    .filter(item => item.completed_time && item.completed_time.startsWith(today))
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);

  // Calculate today's total actual time
  const todayActualTime = items
    .filter(item => item.completed_time && item.completed_time.startsWith(today))
    .reduce((sum, item) => sum + (item.actual_duration || 0), 0);

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>Dashboard</h3>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card card">
            <div className="card-header">
              <h4>Todays XP</h4>
            </div>
            <div className="card-content">
              <span className={`card-value ${todayXP < SETTINGS.DASHBOARD.REQUIRED_XP ? 'red-text' : ''}`}>{todayXP}XP</span>
              <span className="card-label">Required {SETTINGS.DASHBOARD.REQUIRED_XP}XP</span>
            </div>
          </div>
          
          <div className="dashboard-card card">
            <div className="card-header">
              <h4>Accounted time</h4>
            </div>
            <div className="card-content">
              <span className={`card-value ${todayActualTime < SETTINGS.DASHBOARD.REQUIRED_ACCOUNTED_TIME_MINUTES ? 'red-text' : ''}`}>{formatMinutesToHours(todayActualTime)}</span>
              <span className="card-label">Required {formatMinutesToHours(SETTINGS.DASHBOARD.REQUIRED_ACCOUNTED_TIME_MINUTES)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
