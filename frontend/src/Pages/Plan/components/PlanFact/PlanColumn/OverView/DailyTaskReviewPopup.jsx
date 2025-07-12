import React from 'react';
import 'src/shared/styles/Popup.css';
import { formatMinutesToHours } from 'src/shared/utils/time.js';

export default function DailyTaskReviewPopup({ open, tasks, onSetForToday, onDelete }) {
  if (!open || !tasks || tasks.length === 0) return null;

  const handleOverlayClick = (e) => {
    // Prevent closing by clicking outside - popup should only close when all tasks are handled
    e.stopPropagation();
  };

  const handleSetForToday = (task) => {
    onSetForToday(task);
  };

  const handleDelete = (task) => {
    onDelete(task);
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content daily-task-review-popup">
        <div className="popup-header">
          <h2>Yesterday's Uncompleted Tasks</h2>
          <p>You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} from yesterday that weren't completed.</p>
        </div>
        
        <div className="popup-body">
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <div className="task-header">
                    <span className="task-priority">#{task.priority}</span>
                    <span className="task-separator">-</span>
                    <span className="task-quality">{task.task_quality}</span>
                    <span className="task-description">: {task.description}</span>
                  </div>
                  {task.full_description && (
                    <div className="task-full-description">{task.full_description}</div>
                  )}
                  <div className="task-duration">
                    Estimated: {formatMinutesToHours(task.estimated_duration || 0)}
                  </div>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="task-action-button set-for-today"
                    onClick={() => handleSetForToday(task)}
                  >
                    Set for Today
                  </button>
                  <button 
                    className="task-action-button delete"
                    onClick={() => handleDelete(task)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="popup-footer">
          <p className="popup-note">
            This popup will close automatically when all tasks are handled.
          </p>
        </div>
      </div>
    </div>
  );
} 