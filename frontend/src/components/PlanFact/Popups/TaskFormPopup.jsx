import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { scheduleTasks, canScheduleTask } from '../../../utils/scheduler';
import { isApproximatePeriodInPast } from '../../../utils/time';
import '../../shared/Popup.css';

function TaskFormPopup({ 
  mode, 
  open, 
  onClose, 
  onSubmit, 
  initialTask = null, 
  projectId = null, 
  dayId = null,
  allPlanItems = []
}) {
  const [description, setDescription] = useState('');
  const [taskQuality, setTaskQuality] = useState('A');
  const [priority, setPriority] = useState(1);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [plannedTime, setPlannedTime] = useState('');
  const [plannedHour, setPlannedHour] = useState('');
  const [plannedMinute, setPlannedMinute] = useState('');
  const [approximatePlannedTime, setApproximatePlannedTime] = useState('');
  const [showPlanTime, setShowPlanTime] = useState(false);

  // Initialize form with existing task data (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setDescription(initialTask.description || '');
      setTaskQuality(initialTask.task_quality || '');
      setEstimatedDuration(initialTask.estimated_duration || '');
      setPriority(initialTask.priority || '');
      setPlannedTime(initialTask.planned_time || '');
      
      // Parse planned_time into hour and minute
      if (initialTask.planned_time) {
        const [hour, minute] = initialTask.planned_time.split(':');
        setPlannedHour(hour || '');
        setPlannedMinute(minute || '');
      } else {
        setPlannedHour('');
        setPlannedMinute('');
      }
      
      setApproximatePlannedTime(initialTask.approximate_planned_time || '');
      setShowPlanTime(!!(initialTask.planned_time || initialTask.approximate_planned_time));
    }
  }, [mode, initialTask]);

  const resetForm = () => {
    setDescription('');
    setTaskQuality('A');
    setPriority(1);
    setEstimatedDuration(30);
    setPlannedTime('');
    setPlannedHour('');
    setPlannedMinute('');
    setApproximatePlannedTime('');
    setShowPlanTime(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine hour and minute into time string
    const combinedTime = plannedHour && plannedMinute ? `${plannedHour}:${plannedMinute}` : '';

    if (mode === 'add') {
      const newTask = {
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
        actual_duration: null,
        planned_time: combinedTime || null,
        approximate_planned_time: approximatePlannedTime || null
      };

      // --- Use canScheduleTask helper ---
      const canFit = canScheduleTask(newTask, allPlanItems);

      if (!canFit) {
        alert('This task cannot be scheduled. Please adjust its time or duration.');
        return;
      }
      
      // --- End canScheduleTask check ---

      onSubmit(newTask);
      resetForm();
    } else {
      // Update existing task
      const updatedTask = {
        ...initialTask,
        description,
        task_quality: taskQuality,
        estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : null,
        priority: priority ? parseInt(priority) : null,
        planned_time: combinedTime || null,
        approximate_planned_time: approximatePlannedTime || null
      };
      onSubmit(updatedTask);
    }
  };

  if (!open) return null;

  // Generate hour and minute options, filtering for today
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  const isToday = dayId === todayDateString;
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const disabled = isToday && i < currentHour;
    return { value: hour, disabled };
  });

  const minuteOptions = ['00', '15', '30', '45'].map(minute => {
    const disabled = isToday && parseInt(plannedHour) === currentHour && parseInt(minute) < currentMinute;
    return { value: minute, disabled };
  });

  // Check for incomplete time selection
  const hasIncompleteTime = (plannedHour && !plannedMinute) || (!plannedHour && plannedMinute);

  const isEditMode = mode === 'edit';
  const buttonText = isEditMode ? 'Save' : 'Add Task';
  const inputClassName = isEditMode ? 'edit-input' : '';

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
              className={inputClassName}
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
                <option key={i + 1} value={i + 1}>
                  {isEditMode ? `${i + 1}` : `Priority ${i + 1}`}
                </option>
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

          <div className="plan-time-divider"></div>

          <div className="plan-time-section">
            <div 
              className="plan-time-toggle"
              onClick={() => setShowPlanTime(!showPlanTime)}
            >
              Plan Time ∨
            </div>
            
            {showPlanTime && (
              <div className="plan-time-content">
                <div className="plan-time-row">
                  <div className="time-selectors">
                    <select
                      value={plannedHour}
                      onChange={(e) => {
                        setPlannedHour(e.target.value);
                        if (e.target.value) setApproximatePlannedTime('');
                      }}
                      className={`hour-select ${hasIncompleteTime ? 'input-error' : ''}`}
                    >
                      <option value="">Hour</option>
                      {hourOptions.map(hour => (
                        <option key={hour.value} value={hour.value} disabled={hour.disabled}>
                          {hour.value}
                        </option>
                      ))}
                    </select>
                    <span className="time-separator">:</span>
                    <select
                      value={plannedMinute}
                      onChange={(e) => {
                        setPlannedMinute(e.target.value);
                        if (e.target.value) setApproximatePlannedTime('');
                      }}
                      className={`minute-select ${hasIncompleteTime ? 'input-error' : ''}`}
                    >
                      <option value="">Min</option>
                      {minuteOptions.map(minute => (
                        <option key={minute.value} value={minute.value} disabled={minute.disabled}>
                          {minute.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="plan-time-or">or</div>
                <div className="plan-time-row">
                  <select
                    value={approximatePlannedTime}
                    onChange={(e) => {
                      setApproximatePlannedTime(e.target.value);
                      if (e.target.value) {
                        setPlannedHour('');
                        setPlannedMinute('');
                      }
                    }}
                    className="approximate-time-select"
                  >
                    <option value="">Select approximate time</option>
                    <option value="night" disabled={isToday && isApproximatePeriodInPast('night')}>Night</option>
                    <option value="morning" disabled={isToday && isApproximatePeriodInPast('morning')}>Morning</option>
                    <option value="afternoon" disabled={isToday && isApproximatePeriodInPast('afternoon')}>Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="add-task-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={hasIncompleteTime || !description || !estimatedDuration || !priority || !taskQuality}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormPopup; 