import React from 'react';
import './Dashboard.css';
import { SETTINGS } from '../../../../config';
import { formatMinutesToHours, getLocalDateFromCompletedTime } from '../../utils/time';

export default function Dashboard({ items, selectedDay, onDetailsClick }) {
  // Calculate today's XP from completed tasks
  const todayXP = items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === selectedDay && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);

  // Calculate today's total actual time
  const todayActualTime = items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === selectedDay && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.actual_duration || 0), 0);

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>Dashboard</h3>
          <button className="add-button" onClick={onDetailsClick}>Details</button>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card card">
            <div className="dashboard-header">
              <h4>Todays XP</h4>
            </div>
            <div className="card-content">
              <span className={`card-value ${todayXP < SETTINGS.DASHBOARD.REQUIRED_XP ? 'red-text' : ''}`}>{todayXP}XP</span>
              <span className="card-label">Required {SETTINGS.DASHBOARD.REQUIRED_XP}XP</span>
            </div>
          </div>
          
          <div className="dashboard-card card">
            <div className="dashboard-header">
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
