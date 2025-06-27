import React, { useState } from 'react';
import '../../../Plan/shared/Card.css';
import '../../../Plan/shared/Popup.css';

export default function AddRoutineTaskPopup({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const resetForm = () => {
    setName('');
    setPriority('');
    setStart('');
    setEnd('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ id: Date.now(), name, priority: Number(priority), start, end });
    resetForm();
  };

  if (!open) return null;

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <form onSubmit={handleSubmit}>
          <div className="add-task-row">
            <input
              type="text"
              placeholder="Routine name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="add-task-row">
            <input
              type="number"
              placeholder="Priority"
              value={priority}
              min={1}
              onChange={e => setPriority(e.target.value)}
              required
              style={{ width: 80 }}
            />
            <input
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              required
            />
            <span style={{ alignSelf: 'center' }}>–</span>
            <input
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              required
            />
          </div>
          <div className="add-task-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!name || !priority || !start || !end}
            >
              Add Routine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 