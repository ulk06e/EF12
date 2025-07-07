import React, { useState, useEffect } from 'react';
import 'src/shared/styles/Popup.css';

export default function RoutineTaskPopup({ open, onClose, routineTask, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(routineTask?.name || '');
  const [editedPriority, setEditedPriority] = useState(routineTask?.priority || 1);
  const [editedStart, setEditedStart] = useState(routineTask?.start || '');
  const [editedEnd, setEditedEnd] = useState(routineTask?.end || '');
  const [editedDuration, setEditedDuration] = useState(routineTask?.duration || 0);

  useEffect(() => {
    if (routineTask) {
      setEditedName(routineTask.name);
      setEditedPriority(routineTask.priority);
      setEditedStart(routineTask.start);
      setEditedEnd(routineTask.end);
      setEditedDuration(routineTask.duration);
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
      onEdit({ ...routineTask, name: editedName, priority: Number(editedPriority), start: editedStart, end: editedEnd, duration: Number(editedDuration) });
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedName(routineTask.name);
    setEditedPriority(routineTask.priority);
    setEditedStart(routineTask.start);
    setEditedEnd(routineTask.end);
    setEditedDuration(routineTask.duration);
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
              <div className="add-task-row">
                <input
                  type="text"
                  placeholder="Routine name"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  required
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className="add-task-row">
                <input
                  type="number"
                  placeholder="Priority"
                  value={editedPriority}
                  min={1}
                  onChange={e => setEditedPriority(e.target.value)}
                  required
                  style={{ width: 80 }}
                />
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={editedDuration}
                  min={1}
                  onChange={e => setEditedDuration(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
                <input
                  type="time"
                  value={editedStart}
                  onChange={e => setEditedStart(e.target.value)}
                  required
                />
                <span style={{ alignSelf: 'center' }}>–</span>
                <input
                  type="time"
                  value={editedEnd}
                  onChange={e => setEditedEnd(e.target.value)}
                  required
                />
              </div>
              <div className="add-task-buttons">
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="submit-button"
                  disabled={!editedName || !editedPriority || !editedStart || !editedEnd}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="time-block-row">
                <span>{routineTask.priority}: {routineTask.name}</span>
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