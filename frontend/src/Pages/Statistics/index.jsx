import React from 'react';
import ProjectsTimeApp from './app/ProjectsTimeApp';
import './index.css';

export default function StatisticsPage({ onClose }) {
  return (
    <div className="statistics-page">
      <button
        className="statistics-close-btn"
        onClick={onClose}
        aria-label="Close statistics"
      >
        ✕
      </button>
      <ProjectsTimeApp />
    </div>
  );
}