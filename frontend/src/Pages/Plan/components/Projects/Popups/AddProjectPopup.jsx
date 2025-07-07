import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import 'src/shared/styles/Popup.css';

export default function AddProjectPopup({ open, onClose, onAdd, parentId }) {
  const [name, setName] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), name, parent_id: parentId });
    setName('');
    onClose();
  };

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <form onSubmit={handleSubmit}>
          <div className="add-task-row">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Project Name"
              required
              className="edit-input"
            />
          </div>
          <div className="add-task-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="add-button">
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 