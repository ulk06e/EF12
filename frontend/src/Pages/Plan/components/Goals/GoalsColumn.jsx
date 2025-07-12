import React, { useState } from 'react';
import 'src/shared/styles/Column.css';
import 'src/shared/styles/Card.css';

export default function GoalsColumn() {
  const [goals, setGoals] = useState([]);

  const handleToggleGoal = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: !goal.completed }
        : goal
    ));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>Goals</h3>
      </div>
      
      <div>
        {goals.map(goal => (
          <div 
            key={goal.id} 
            className={`card ${goal.completed ? 'selected' : ''}`}
            onClick={() => handleToggleGoal(goal.id)}
          >
            <div className="card-content">
              <div className="card-item-header">
                <div className="card-item-name">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleToggleGoal(goal.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ 
                    textDecoration: goal.completed ? 'line-through' : 'none',
                    color: goal.completed ? '#6b7280' : '#374151'
                  }}>
                    {goal.text}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGoal(goal.id);
                  }}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="no-items-message">
            No goals yet.
          </div>
        )}
      </div>
    </div>
  );
} 