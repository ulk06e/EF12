import React, { useState, useEffect } from 'react';
import '../../../Plan/shared/Popup.css';

export default function RoutineTaskPopup({ open, onClose, routineTask, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(routineTask?.name || '');
  const [editedPriority, setEditedPriority] = useState(routineTask?.priority || 1);
  const [editedStart, setEditedStart] = useState(routineTask?.start || '');
  const [editedEnd, setEditedEnd] = useState(routineTask?.end || '');

  useEffect(() => {
    if (routineTask) {
      setEditedName(routineTask.name);
      setEditedPriority(routineTask.priority);
      setEditedStart(routineTask.start);
      setEditedEnd(routineTask.end);
    }
  }, [routineTask]);

  if (!open || !routineTask) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose();
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    if (onEdit) {
      onEdit({ ...routineTask, name: editedName, priority: Number(editedPriority), start: editedStart, end: editedEnd });
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedName(routineTask.name);
    setEditedPriority(routineTask.priority);
    setEditedStart(routineTask.start);
    setEditedEnd(routineTask.end);
    setIsEditing(false);
  };
  const handleDelete = () => {
    if (onDelete) {
      onDelete(routineTask);
    }
    onClose();
  };

  return (
    <div className="add-task-popup-overlay" onClick={handleOverlayClick}>
      <div className="add-task-popup">
        <div className="task-popup-content">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                className="edit-input"
                autoFocus
                maxLength={50}
              />
              <div className="add-task-row">
                <input
                  type="number"
                  value={editedPriority}
                  min={1}
                  onChange={e => setEditedPriority(e.target.value)}
                  className="edit-input"
                  style={{ width: 80 }}
                />
                <input
                  type="time"
                  value={editedStart}
                  onChange={e => setEditedStart(e.target.value)}
                  className="edit-input"
                />
                <span style={{ alignSelf: 'center' }}>–</span>
                <input
                  type="time"
                  value={editedEnd}
                  onChange={e => setEditedEnd(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="add-task-buttons">
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button onClick={handleSave} className="add-button">
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="time-block-row">
                <span style={{ fontWeight: 600 }}>{routineTask.priority}: {routineTask.name}</span>
                <span>{routineTask.start} - {routineTask.end}</span>
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