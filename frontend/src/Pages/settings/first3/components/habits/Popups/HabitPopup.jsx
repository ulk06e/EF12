import React, { useState, useEffect } from 'react';
import 'src/pages/plan/shared/Popup.css';

export default function HabitPopup({ open, onClose, habit, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(habit?.description || '');
  const [editedDuration, setEditedDuration] = useState(habit?.duration || 0);
  const [editedParentProjectId, setEditedParentProjectId] = useState(habit?.parent_project_id || '');

  useEffect(() => {
    if (habit) {
      setEditedDescription(habit.description);
      setEditedDuration(habit.duration);
      setEditedParentProjectId(habit.parent_project_id);
    }
  }, [habit]);

  if (!open || !habit) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose();
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    if (onEdit) {
      onEdit({ ...habit, description: editedDescription, duration: Number(editedDuration), parent_project_id: editedParentProjectId });
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedDescription(habit.description);
    setEditedDuration(habit.duration);
    setEditedParentProjectId(habit.parent_project_id);
    setIsEditing(false);
  };
  const handleDelete = () => {
    if (onDelete) {
      onDelete(habit);
    }
    onClose();
  };

  return (
    <div className="add-task-popup-overlay" onClick={handleOverlayClick}>
      <div className="add-task-popup">
        <div className="task-popup-content">
          {isEditing ? (
            <>
              <div className="add-task-row">
                <input
                  type="text"
                  placeholder="Habit description"
                  value={editedDescription}
                  onChange={e => setEditedDescription(e.target.value)}
                  required
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className="add-task-row">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={editedDuration}
                  min={1}
                  onChange={e => setEditedDuration(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
              </div>
              <div className="add-task-row">
                <input
                  type="text"
                  placeholder="Parent Project ID"
                  value={editedParentProjectId}
                  onChange={e => setEditedParentProjectId(e.target.value)}
                  style={{ width: 180 }}
                />
              </div>
              <div className="add-task-buttons">
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="submit-button"
                  disabled={!editedDescription}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="time-block-row">
                <span>{habit.description}</span>
                <span>{habit.duration ? `${habit.duration} min` : ''}</span>
              </div>
              <div className="add-task-buttons">
                <button onClick={handleEdit} className="cancel-button">
                  Edit
                </button>
                <button onClick={handleDelete} className="delete-button">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 