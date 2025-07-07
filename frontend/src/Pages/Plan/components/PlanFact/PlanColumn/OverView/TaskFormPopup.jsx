import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { scheduleTasks, canScheduleTask } from 'src/Pages/Plan/components/PlanFact/utils/scheduler.js';
import { isApproximatePeriodInPast, getProjectBreadcrumb } from 'src/shared/utils/time.js';
import { getLocalTimeBlocks, setLocalTimeBlocks } from 'src/Pages/settings/first3/timespan/localDb.js';
import { fetchSettings } from 'src/Pages/settings/first3/timespan/tapi.js';
import 'src/shared/styles/Popup.css';

function TaskFormPopup({ 
  mode, 
  open, 
  onClose, 
  onSubmit, 
  initialTask = null, 
  projectId = null, 
  dayId = null,
  allPlanItems = [],
  projects = [],
  selectedProjectIds = []
}) {
  const [description, setDescription] = useState('');
  const [taskQuality, setTaskQuality] = useState('C');
  const [priority, setPriority] = useState(4);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [plannedTime, setPlannedTime] = useState('');
  const [plannedHour, setPlannedHour] = useState('');
  const [plannedMinute, setPlannedMinute] = useState('');
  const [approximatePlannedTime, setApproximatePlannedTime] = useState('');
  const [approximateStart, setApproximateStart] = useState('');
  const [approximateEnd, setApproximateEnd] = useState('');
  const [showPlanTime, setShowPlanTime] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fullDescription, setFullDescription] = useState('');

  const projectBreadcrumb = getProjectBreadcrumb(projectId, projects);

  // Initialize form with existing task data (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setDescription(initialTask.description || '');
      setTaskQuality(initialTask.task_quality || '');
      setEstimatedDuration(initialTask.estimated_duration || '');
      setPriority(initialTask.priority || '');
      setPlannedTime(initialTask.planned_time || '');
      setFullDescription(initialTask.full_description || '');
      
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
      setShowAdvanced(!!(initialTask.full_description || initialTask.planned_time || initialTask.approximate_planned_time));
    }
  }, [mode, initialTask]);

  useEffect(() => {
    // Always fetch fresh time blocks from backend when popup opens
    if (open) {
      fetchSettings().then(data => {
        setLocalTimeBlocks(data.time_blocks || []);
        setTimeBlocks(data.time_blocks || []);
      }).catch(err => {
        console.error('Failed to fetch time blocks:', err);
        // Fallback to local storage if fetch fails
        let localBlocks = getLocalTimeBlocks();
        setTimeBlocks(localBlocks || []);
      });
    }
  }, [open]);

  // When approximatePlannedTime changes, set start/end
  useEffect(() => {
    if (approximatePlannedTime && timeBlocks.length > 0) {
      const block = timeBlocks.find(b => b.name === approximatePlannedTime);
      setApproximateStart(block ? block.start : '');
      setApproximateEnd(block ? block.end : '');
    } else {
      setApproximateStart('');
      setApproximateEnd('');
    }
  }, [approximatePlannedTime, timeBlocks]);

  const resetForm = () => {
    setDescription('');
    setTaskQuality('C');
    setPriority(4);
    setEstimatedDuration(30);
    setPlannedTime('');
    setPlannedHour('');
    setPlannedMinute('');
    setApproximatePlannedTime('');
    setShowPlanTime(false);
    setShowAdvanced(false);
    setFullDescription('');
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
        approximate_planned_time: approximatePlannedTime || null,
        approximate_start: approximateStart || null,
        approximate_end: approximateEnd || null,
        type: 'plan_task',
        full_description: fullDescription,
        created_time: new Date().toISOString(),
      };

      // --- Use canScheduleTask helper ---
      console.log('[DEBUG][Popup] canScheduleTask newTask:', newTask);
      console.log('[DEBUG][Popup] canScheduleTask allPlanItems:', allPlanItems);
      if (!canScheduleTask(newTask, allPlanItems)) {
        alert('This task cannot be scheduled. Please adjust its time or duration, or check for conflicts.');
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
        approximate_planned_time: approximatePlannedTime || null,
        approximate_start: approximateStart || null,
        approximate_end: approximateEnd || null,
        full_description: fullDescription
      };
      onSubmit(updatedTask);
    }
  };

  if (!open) return null;

  // Handler to close popup when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
    <div className="add-task-popup-overlay" onClick={handleOverlayClick}>
      <div className="add-task-popup">
        {projectBreadcrumb && (
          <div className="popup-breadcrumb">
            {isEditMode ? 'Editing in: ' : 'Adding to: '}{projectBreadcrumb}
          </div>
        )}
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
          {showAdvanced && (
            <>
              <div className="plan-time-divider"></div>
              <div className="add-task-row" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  placeholder="Full Description"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="plan-time-section">
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
                    <div className="plan-time-or">or</div>
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
                      <option value="">Time Block</option>
                      {timeBlocks.length > 0 &&
                        [...timeBlocks]
                          .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
                          .map((block, idx) => {
                            // Disable if the block's end time has passed for today
                            let disabled = false;
                            if (isToday && block.end) {
                              const [endHour, endMinute] = block.end.split(':').map(Number);
                              if (
                                endHour < currentHour ||
                                (endHour === currentHour && endMinute <= currentMinute)
                              ) {
                                disabled = true;
                              }
                            }
                            return (
                              <option key={idx} value={block.name} disabled={disabled}>
                                {block.name} ({block.start} - {block.end})
                              </option>
                            );
                          })}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="add-task-buttons" style={{ marginTop: 32 }}>
            <button
              type="button"
              className="cancel-button"
              style={{ marginRight: 8 }}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? 'Hide' : 'Advanced'}
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