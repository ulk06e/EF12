import React, { useState } from 'react';
import TimespanBlock from './timespan/TimespanBlock';
import DailyBasicsBlock from './daily_basics/DailyBasicsBlock';
// import OtherBlock from './other/OtherBlock';

export default function FirstThreeColumns() {
  const [addCol, setAddCol] = useState<number | null>(null);

  const labels = ['Time Blocks', 'Daily Basics', 'Other'];

  return (
    <div className="columns-container">
      {[0, 1, 2].map(i => (
        <div className="column" key={i}>
          <div className="column-header">
            <h3>{labels[i]}</h3>
            <button 
              onClick={() => setAddCol(i + 1)} 
              className="add-button"
              // You can add logic to disable buttons for columns 2/3 if needed
            >
              Add
            </button>
          </div>
          {i === 0 ? (
            <TimespanBlock addOpen={addCol === 1} setAddOpen={open => setAddCol(open ? 1 : null)} />
          ) : i === 1 ? (
            <DailyBasicsBlock addOpen={addCol === 2} setAddOpen={open => setAddCol(open ? 2 : null)} />
          ) : (
            <div className="no-items-message">No items yet</div>
          )}
        </div>
      ))}
    </div>
  );
}
