import React, { useState, useEffect } from 'react';
import '../../shared/Popup.css';

export default function EditTaskPopup({ open, onClose, task, onSave }) {
  const [desc, setDesc] = useState('');
  const [timeType, setTimeType] = useState('');
  const [quality, setQuality] = useState('');
  const [est, setEst] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    if (task) {
      setDesc(task.description || '');
      setTimeType(task.time_type || '');
      setQuality(task.task_quality || '');
      setEst(task.estimated_duration || '');
      setPriority(task.priority || '');
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...task, 
      description: desc, 
      time_type: timeType, 
      task_quality: quality, 
      estimated_duration: est ? parseInt(est) : null, 
      priority: priority ? parseInt(priority) : null 
    });
  };

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <form onSubmit={handleSubmit}>
          <div className="add-task-row">
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description"
              required
              className="edit-input"
            />
          </div>
          
          <div className="add-task-row">
            <select 
              value={timeType} 
              onChange={(e) => setTimeType(e.target.value)}
              className="time-type-select"
              required
            >
              <option value="to-goal">To Goal</option>
              <option value="to-time">To Time</option>
            </select>
            <select 
              value={quality} 
              onChange={(e) => setQuality(e.target.value)}
              className="task-quality-select"
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div className="add-task-row">
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select"
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            <input
              type="number"
              value={est}
              onChange={e => setEst(e.target.value)}
              placeholder="Duration (minutes)"
              className="duration-input"
              required
            />
          </div>

          <div className="add-task-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="add-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 