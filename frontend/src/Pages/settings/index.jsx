import React from 'react';
import './index.css';
import FirstThreeColumns from './first3/first3';
import 'src/shared/styles/Column.css';
import { rescheduleDailyBasics } from './first3/daily_basics/tapi';

export default function SettingsPage({ onClose }) {
  const handleClose = async () => {
    onClose();
  };

  return (
    <div className="settings-page">
      <div className="columns-container">
        <div className="column sticky-column">
          <div className="header-actions">
            <button className="add-button" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
      <FirstThreeColumns />
    </div>
  );
} 