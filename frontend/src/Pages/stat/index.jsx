import React, { useState } from 'react';
import ProjectsTime from 'src/Pages/stat/components/ProjectsTime/ProjectsTime';
import XPChart from 'src/Pages/stat/components/XPChart/XPChart';
import 'src/Pages/stat/index.css';
import StatsMenu from 'src/Pages/stat/components/Menu/Menu';
import StatisticsSmall from 'src/Pages/stat/components/StatisticsSmall/StatisticsSmall';

export default function StatisticsPage({ onClose, items }) {
  const [selectedView, setSelectedView] = useState('week');
  return (
    <div className="statistics-page" style={{padding: "0px 0px 0px 0px"}}>
      <StatsMenu onClose={onClose} onChangeStatsView={setSelectedView} />
      <XPChart items={items} view={selectedView} />
      <ProjectsTime />
      <StatisticsSmall items={items} view={selectedView} />
    </div>
  );
}