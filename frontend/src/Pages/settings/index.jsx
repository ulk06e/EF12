import React from 'react';
import './index.css';
import TimespanBlock from './timespan/TimespanBlock';
import '../Plan/shared/Column.css';

export default function SettingsPage({ onClose }) {
  return (
    <div className="settings-page">
      <div className="columns-container">
        <div className="column sticky-column">
          <div className="header-actions">
            <button className="menu-button">Menu</button>
            <span></span>
            <button className="add-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
      <TimespanBlock />
    </div>
  );
} 