import React, { useState, useEffect } from 'react';
import 'src/shared/styles/Popup.css';

export default function ProjectPopup({ open, onClose, project, onEdit, onComplete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || '');

  // Update editedName when project changes
  useEffect(() => {
    if (project) {
      setEditedName(project.name);
    }
  }, [project]);

  if (!open || !project) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit({ ...project, name: editedName });
    }
    setIsEditing(false);
  };

  const handleCompleteProject = () => {
    if (onComplete && typeof onComplete === 'function') {
      onComplete({ ...project, completed: true });
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
                onChange={(e) => setEditedName(e.target.value)}
                className="edit-input"
                autoFocus
                maxLength={50}
              />
              <div className="add-task-buttons">
                <button onClick={handleSave} className="add-button">
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="task-name">{project.name}</div>
              <div className="add-task-buttons">
                <button onClick={handleEdit} className="cancel-button">
                  Edit
                </button>
                <button onClick={handleCompleteProject} className="add-button">
                  Complete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 