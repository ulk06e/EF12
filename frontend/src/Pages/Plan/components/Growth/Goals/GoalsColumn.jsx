import React from 'react';
import '../../Projects/Projects.css';

export default function GoalsColumn() {
  return (
    <div className="column">
      <div className="column-header">
        <h3>Goals</h3>
      </div>
      {/* Add your goals content here */}
      <div className="no-items-message">No goals yet</div>
    </div>
  );
} 