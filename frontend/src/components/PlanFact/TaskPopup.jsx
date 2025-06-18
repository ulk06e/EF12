import React from 'react';
import '../shared/Popup.css';

function TaskPopup({ open, onClose, task, onDelete, onEdit, onStart, selectedDay }) {
  if (!open || !task) return null;

  const isFutureDate = () => {
    if (!selectedDay) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(selectedDay);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > today;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="add-task-popup-overlay" onClick={handleOverlayClick}>
      <div className="add-task-popup">
        <div className="task-popup-content">
          <div className="task-name">{task.description}</div>
          <div className="add-task-buttons">
            <button onClick={() => onDelete(task)} className="cancel-button">
              Delete
            </button>
            <div className="right-buttons">
              <button onClick={() => onEdit(task)} className="cancel-button">
                Edit
              </button>
              {!isFutureDate() && (
                <button onClick={() => onStart(task)} className="add-button">
                  Start
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskPopup;