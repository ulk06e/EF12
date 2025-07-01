import React from 'react';
import '../../Projects/Projects.css';

export default function ChallengesColumn() {
  return (
    <div className="column">
      <div className="column-header">
        <h3>Challenges</h3>
      </div>
      {/* Add your challenges content here */}
      <div className="no-items-message">No challenges yet</div>
    </div>
  );
} 