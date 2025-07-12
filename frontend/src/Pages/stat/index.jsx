import React, { useState } from 'react';
import XPChart from 'src/Pages/stat/components/XPChart/XPChart';
import 'src/Pages/stat/index.css';
import 'src/shared/styles/Column.css';
import StatsMenu from 'src/Pages/stat/components/Menu/Menu';
import StatisticsSmall from 'src/Pages/stat/components/StatisticsSmall/StatisticsSmall';
import Badges from 'src/Pages/stat/badges/Badges';

export default function StatisticsPage({ onClose, items }) {
  const [selectedView, setSelectedView] = useState('week');
  return (
    <div className="statistics-page" style={{padding: "0px 0px 0px 0px"}}>
      <StatsMenu onClose={onClose} onChangeStatsView={setSelectedView} />
      <XPChart items={items} view={selectedView} />
      <StatisticsSmall items={items} view={selectedView} />
      <div className="columns-container">
        <div className="column">
          <Badges items={items} />
        </div>
      </div>
    </div>
  );
}