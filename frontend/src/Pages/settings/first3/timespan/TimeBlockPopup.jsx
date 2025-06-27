import React, { useState, useEffect } from 'react';
import '../../../Plan/shared/Popup.css';

export default function TimeBlockPopup({ open, onClose, timeBlock, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(timeBlock?.name || '');
  const [editedStart, setEditedStart] = useState(timeBlock?.start || '');
  const [editedEnd, setEditedEnd] = useState(timeBlock?.end || '');

  useEffect(() => {
    if (timeBlock) {
      setEditedName(timeBlock.name);
      setEditedStart(timeBlock.start);
      setEditedEnd(timeBlock.end);
    }
  }, [timeBlock]);

  if (!open || !timeBlock) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose();
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    if (onEdit) {
      onEdit({ ...timeBlock, name: editedName, start: editedStart, end: editedEnd });
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedName(timeBlock.name);
    setEditedStart(timeBlock.start);
    setEditedEnd(timeBlock.end);
    setIsEditing(false);
  };
  const handleDelete = () => {
    if (onDelete) {
      onDelete(timeBlock);
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
                <span style={{ fontWeight: 600 }}>{timeBlock.name}</span>
                <span>{timeBlock.start} - {timeBlock.end}</span>
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