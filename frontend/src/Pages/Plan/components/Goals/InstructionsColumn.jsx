import React, { useState } from 'react';
import 'src/shared/styles/Column.css';
import 'src/shared/styles/Card.css';

export default function InstructionsColumn() {
  const [instructions, setInstructions] = useState([]);

  const handleToggleInstruction = (instructionId) => {
    setInstructions(instructions.map(instruction => 
      instruction.id === instructionId 
        ? { ...instruction, completed: !instruction.completed }
        : instruction
    ));
  };

  const handleDeleteInstruction = (instructionId) => {
    setInstructions(instructions.filter(instruction => instruction.id !== instructionId));
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>Instructions</h3>
      </div>
      
      <div>
        {instructions.map(instruction => (
          <div 
            key={instruction.id} 
            className={`card ${instruction.completed ? 'selected' : ''}`}
            onClick={() => handleToggleInstruction(instruction.id)}
          >
            <div className="card-content">
              <div className="card-item-header">
                <div className="card-item-name">
                  <input
                    type="checkbox"
                    checked={instruction.completed}
                    onChange={() => handleToggleInstruction(instruction.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ 
                    textDecoration: instruction.completed ? 'line-through' : 'none',
                    color: instruction.completed ? '#6b7280' : '#374151'
                  }}>
                    {instruction.text}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInstruction(instruction.id);
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
        {instructions.length === 0 && (
          <div className="no-items-message">
            No instructions yet.
          </div>
        )}
      </div>
    </div>
  );
} 