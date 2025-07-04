import React, { useState, useEffect } from 'react';
import '../../../../../plan/shared/Popup.css';
import './AddHabitPopup.css';
import { API_URL } from 'src/config/api';
import { getLocalSettings } from '../../../shared/localDb';

export default function AddHabitPopup({ open, onClose, onSubmit, mode = 'add', initialHabit = null }) {
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedType, setSelectedType] = useState('daily_basic');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('before');
  const [routineTasks, setRoutineTasks] = useState([]);
  const [selectedRoutineTaskId, setSelectedRoutineTaskId] = useState('');

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/projects`)
        .then(res => res.json())
        .then(data => setProjects(data))
        .catch(() => setProjects([]));
    }
  }, [open]);

  useEffect(() => {
    if (open && selectedType === 'daily_basic') {
      const settings = getLocalSettings();
      setRoutineTasks(settings.routine_tasks || []);
    }
  }, [open, selectedType]);

  useEffect(() => {
    if (open && mode === 'edit' && initialHabit) {
      setDescription(initialHabit.description || '');
      setSelectedProjectId(initialHabit.parent_project_id || '');
      setDuration(initialHabit.duration || '');
      setSelectedRoutineTaskId(initialHabit.daily_basic_id || '');
      setLocation(initialHabit.daily_basic_location || 'before');
      // If you want to support editing daily_basic fields, add here
    } else if (open && mode === 'add') {
      resetForm();
    }
    // eslint-disable-next-line
  }, [open, mode, initialHabit]);

  const resetForm = () => {
    setDescription('');
    setSelectedProjectId('');
    setDuration('');
    setLocation('before');
    setSelectedRoutineTaskId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const habitData = {
      ...(initialHabit ? initialHabit : {}),
      description,
      parent_project_id: selectedProjectId || null,
      duration: selectedType === 'daily_basic' ? Number(duration) : undefined,
      daily_basic_location: selectedType === 'daily_basic' ? location : undefined,
      daily_basic_id: selectedType === 'daily_basic' ? selectedRoutineTaskId : undefined
    };
    onSubmit(habitData);
    resetForm();
  };

  const isAddDisabled = !description || !selectedProjectId || (selectedType === 'daily_basic' && (!duration || !selectedRoutineTaskId));

  if (!open) return null;

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <form onSubmit={handleSubmit}>
          <div className="add-task-row">
            <input
              type="text"
              placeholder="Habit description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              autoFocus
              maxLength={50}
            />
          </div>
          <div className="add-task-row">
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              required
            >
              <option value="">Select project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="add-habit-type-row">
            <button
              type="button"
              className={`add-button add-habit-type-btn${selectedType === 'daily_basic' ? ' selected' : ''}`}
              onClick={() => setSelectedType('daily_basic')}
            >
              Daily Basics
            </button>
            <button
              type="button"
              className="add-button add-habit-type-btn"
              disabled
            >
              Time Block
            </button>
            <button
              type="button"
              className="add-button add-habit-type-btn"
              disabled
            >
              Fixed Time
            </button>
          </div>
          {selectedType === 'daily_basic' && (
            <>
              <div className="add-task-row">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  min={1}
                  required
                  style={{ width: 120 }}
                />
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{ marginLeft: 8 }}
                  required
                >
                  <option value="before">Before</option>
                  <option value="after">After</option>
                </select>
              </div>
              <div className="add-task-row">
                <select
                  value={selectedRoutineTaskId}
                  onChange={e => setSelectedRoutineTaskId(e.target.value)}
                  required
                >
                  <option value="">Select daily basic</option>
                  {routineTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="add-task-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-button" disabled={isAddDisabled}>
              {mode === 'edit' ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 