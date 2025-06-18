import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../../shared/Popup.css';

function AddTaskPopup({ open, onClose, onAdd, projectId, dayId }) {
  const [description, setDescription] = useState('');
  const [taskQuality, setTaskQuality] = useState('A');
  const [priority, setPriority] = useState(1);
  const [estimatedDuration, setEstimatedDuration] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: uuidv4(),
      description,
      task_quality: taskQuality,
      priority,
      estimated_duration: estimatedDuration,
      project_id: projectId,
      day_id: dayId,
      column_location: 'plan',
      completed: false,
      completed_time: null,
      actual_duration: null
    });
    setDescription('');
    setTaskQuality('A');
    setPriority(1);
    setEstimatedDuration(30);
  };

  if (!open) return null;

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <form onSubmit={handleSubmit}>
          <div className="add-task-row">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="add-task-row">
            <select 
              value={priority} 
              onChange={(e) => setPriority(Number(e.target.value))}
              className="priority-select"
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Priority {i + 1}</option>
              ))}
            </select>
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              min="1"
              placeholder="Duration (minutes)"
              className="duration-input"
              required
            />
            <select 
              value={taskQuality} 
              onChange={(e) => setTaskQuality(e.target.value)}
              className="task-quality-select"
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div className="add-task-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="add-button">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskPopup; 