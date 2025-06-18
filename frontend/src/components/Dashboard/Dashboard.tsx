import React from 'react';
import './Dashboard.css';

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
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h3>Dashboard</h3>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Todays XP</h4>
            </div>
            <div className="card-content">
              <span className={`card-value ${todayXP < 500 ? 'red-text' : ''}`}>{todayXP}XP</span>
              <span className="card-label">Required 500XP</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Accounted time</h4>
            </div>
            <div className="card-content">
              <span className={`card-value ${todayActualTime < 480 ? 'red-text' : ''}`}>{todayActualTime}m</span>
              <span className="card-label">Required 480m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
