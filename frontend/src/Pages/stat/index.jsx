import React, { useEffect, useState } from 'react';
import ProjectsTime from 'src/Pages/stat/components/ProjectsTime/ProjectsTime';
import XPChart from 'src/Pages/stat/components/XPChart/XPChart';
import { fetchStatisticsData } from 'src/Pages/stat/api/xp';
import 'src/Pages/stat/index.css';

export default function StatisticsPage({ onClose }) {
  return (
    <div className="statistics-page" style={{padding: "0px 0px 0px 0px"}}>
      <div className="columns-container">
        <div className="column sticky-column">
          <div className="header-actions">
            <button className="add-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
      <XPChart />
      <ProjectsTime />
    </div>
  );
}