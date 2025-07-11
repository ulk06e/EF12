import React, { useState } from 'react';
import './Menu.css';

export default function StatsMenu({ onClose, onChangeStatsView }) {
  const VIEWS = [
    { label: 'All Time', value: 'all' },
    { label: '1 Year', value: '1y' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Week', value: 'week' },
  ];
  const [selectedView, setSelectedView] = useState('week');

  const handleViewChange = (value) => {
    setSelectedView(value);
    if (onChangeStatsView) onChangeStatsView(value);
  };

  return (
    <div className="columns-container">
      <div className="column sticky-column">
        <div className="header-actions">
          <button className="add-button" onClick={onClose} style={{ marginRight: 16 }}>Close</button>
          <div className="stats-view-group">
            {VIEWS.map(view => (
              <button
                key={view.value}
                className={`menu-button${selectedView === view.value ? ' selected' : ''}`}
                onClick={() => handleViewChange(view.value)}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 