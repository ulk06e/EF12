import React, { useState } from 'react';
import 'src/shared/styles/Card.css';
import 'src/shared/styles/Popup.css';
export default function AddTimeBlockPopup({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const resetForm = () => {
    setName('');
    setStart('');
    setEnd('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ id: Date.now(), name, start, end });
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
              placeholder="Block name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="add-task-row">
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
              disabled={!name || !start || !end}
            >
              Add Time Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 