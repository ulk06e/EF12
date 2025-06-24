import React, { useState, useMemo } from 'react';
import TaskPopup from './Popups/TaskPopup';
import EditTaskPopup from './Popups/EditTaskPopup';
import AddTaskPopup from './Popups/AddTaskPopup';
import TaskTimerPopup from './Popups/TaskTimerPopup';
import { scheduleTasks } from '../../utils/scheduler';
import './PlanFactColumns.css';
import { formatMinutesToHours, getTodayDateString, formatCompletedTimeForDisplay, getLocalDateObjectFromCompletedTime } from '../../utils/time';

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export default function PlanFactColumns({ 
  items, 
  onAddTask, 
  onDeleteTask,
  onUpdateTask,
  onCompleteTask,
  selectedProjectId, 
  selectedProjectIds,
  selectedDay,
  viewMode,
  setViewMode
}) {
  const [popupTask, setPopupTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [timerTask, setTimerTask] = useState(null);

  // Sort plan items by priority (asc: 1 at top), then task quality (A > D)
  const planItems = items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      const qualityA = qualityOrder[a.task_quality] || 5;
      const qualityB = qualityOrder[b.task_quality] || 5;
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      return qualityA - qualityB;
    });

  // Overview scheduling algorithm
  const scheduledOverview = useMemo(() => {
    if (viewMode !== 'overview' || !planItems || planItems.length === 0) {
      return { scheduledTasks: planItems, errors: [] };
    }
    const isToday = selectedDay === (new Date()).toISOString().split('T')[0];
    const now = new Date();
    const startTimeMinutes = now.getHours() * 60 + now.getMinutes();
    return isToday
      ? scheduleTasks(planItems, startTimeMinutes)
      : scheduleTasks(planItems);
  }, [planItems, viewMode, selectedDay]);
  
  // Fact items: show all items in fact column, sort completed ones by completion time
  const factItems = items
    .filter(item => item.column_location === 'fact')
    .sort((a, b) => {
      if (a.completed_time && b.completed_time) {
        return b.completed_time.localeCompare(a.completed_time);
      }
      if (a.completed_time) return -1;
      if (b.completed_time) return 1;
      return b.id.localeCompare(a.id);
    });

  // Calculate unaccounted time and format time for fact items
  const factCards = factItems.map((item, idx) => {
    let unaccounted = null;
    
    if (idx === 0 && item.completed_time) {
      // Calculate unaccounted time before the first task
      const currentTime = getLocalDateObjectFromCompletedTime(item.completed_time);
      if (currentTime) {
        const startOfDay = new Date(currentTime);
        startOfDay.setHours(3, 0, 0, 0);
        const timeBetween = (currentTime.getTime() - startOfDay.getTime()) / (1000 * 60);
        unaccounted = Math.max(0, timeBetween - (item.actual_duration || 0));
      }
    } else if (idx < factItems.length - 1 && item.completed_time) {
      const nextItem = factItems[idx + 1];
      if (nextItem.completed_time) {
        const currentTime = getLocalDateObjectFromCompletedTime(item.completed_time);
        const previousTime = getLocalDateObjectFromCompletedTime(nextItem.completed_time) || 0;
        if (currentTime && previousTime) {
          const timeBetweenTasks = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);
          unaccounted = Math.max(0, timeBetweenTasks - (item.actual_duration || 0));
        }
      }
    }
    
    const formatted_time = formatCompletedTimeForDisplay(item.completed_time);
    
    return { 
      ...item, 
      unaccounted,
      formatted_time
    };
  });

  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  const handleDuplicateTask = (task) => {
    const { id, completed_time, actual_duration, time_quality, project, ...rest } = task;
    const today = getTodayDateString();
    const taskDate = new Date(task.day_id);
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    
    const newTask = {
      ...rest,
      day_id: taskDate < startOfToday ? today : task.day_id,
    };
    onAddTask(newTask);
  };

  // Common task card renderer
  const renderTaskCard = (item, isPlan = false, index = 0, isUnscheduled = false) => {
    // Get time information for overview mode
    const getTimeInfo = () => {
      if (item.planned_time) {
        // Extract just the time portion (HH:MM) from planned_time
        const timeMatch = item.planned_time.match(/(\d{1,2}):(\d{2})/);
        const timeDisplay = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : item.planned_time;
        return `${formatMinutesToHours(item.estimated_duration)} - ${timeDisplay}`;
      } else if (item.approximate_planned_time) {
        return `${formatMinutesToHours(item.estimated_duration)} - ${item.approximate_planned_time}`;
      }
      return formatMinutesToHours(item.estimated_duration);
    };

    const duration = isPlan ? item.estimated_duration || 0 : item.actual_duration || 0;
    const cardStyle = viewMode === 'overview' && duration > 30
      ? {
          display: 'flex',
          flexDirection: 'column',
          gap: `${Math.floor(duration / 15) * 6}px`
        }
      : {};

    return (
      <div
        key={item.id}
        className={`card ${isPlan && index === 0 ? 'priority-task' : ''} ${!isPlan && item.time_quality === 'pure' ? 'pure-time' : ''} ${isUnscheduled ? 'unscheduled-task' : ''}`}
        style={cardStyle}
        onClick={() => isPlan && !isPastDate && setPopupTask(item)}
      >
        <div className="card-item-block">
          <div className="card-item-header">
            <span className="card-item-name">
              <span className="card-item-priority">#{item.priority}</span>
              <span className="card-item-separator">-</span>
              <span className="card-item-quality">{item.task_quality}</span>
            </span>
            <span className="item-description">: {item.description}</span>
          </div>
        </div>
        <div className="card-item-block">
          <div className="card-item-details">
            {isPlan ? (
              viewMode === 'overview' ? (
                <span>{getTimeInfo()}</span>
              ) : (
                <span>{formatMinutesToHours(item.estimated_duration)}</span>
              )
            ) : (
              <>
                <div>
                  {formatMinutesToHours(item.actual_duration)}/{formatMinutesToHours(item.estimated_duration)} - {item.formatted_time}
                  {item.showUnaccountedInline && (
                    <span className="card-text-unaccounted"> (+{formatMinutesToHours(Math.round(item.unaccounted))})</span>
                  )}
                </div>
                <div className="card-text-xp">+{item.xp_value} XP</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Gap card renderer for unaccounted time
  const renderGapCard = (gap, index) => {
    const duration = gap.minutes || 0;
    const cardStyle = viewMode === 'overview' && duration > 30
      ? {
          display: 'flex',
          flexDirection: 'column',
          gap: `${Math.floor(duration / 15) * 6}px`
        }
      : {};

    return (
    <div
      key={`gap-${index}`}
      className="card gap-card"
        style={cardStyle}
    >
      <div className="card-item-block">
        <div className="card-item-header">
          <span className="gap-label">Unaccounted Time</span>
        </div>
      </div>
      <div className="card-item-block">
        <div className="card-item-details">
          <span>{formatMinutesToHours(gap.minutes)}</span>
        </div>
      </div>
    </div>
  );
  };

  // Render fact column in overview mode with unaccounted time as grey cards (>=15m) and as red text (<15m)
  const renderFactColumnOverview = () => {
    const cards = [];
    for (let i = 0; i < factCards.length; i++) {
      const item = factCards[i];
      // Remove width styling, just use default card rendering
      const showUnaccountedInline = item.unaccounted && item.unaccounted > 0 && item.unaccounted < 15;
      cards.push(
        <div key={item.id}>
          {renderTaskCard({ ...item, showUnaccountedInline }, false)}
        </div>
      );
      if (item.unaccounted && item.unaccounted >= 15) {
        cards.push(
          renderGapCard({ minutes: Math.round(item.unaccounted) }, `fact-gap-${i}`)
        );
      }
    }
    return cards;
  };

  return (
    <div className={`columns-container ${viewMode === 'overview' ? 'overview-mode' : ''}`}>
      <TaskPopup 
        open={!!popupTask} 
        onClose={() => setPopupTask(null)} 
        task={popupTask} 
        onDelete={(task) => { onDeleteTask(task.id); setPopupTask(null); }}
        onEdit={(task) => { setEditTask(task); setPopupTask(null); }}
        onStart={(task) => { setTimerTask(task); setPopupTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task); setPopupTask(null); }}
        selectedDay={selectedDay}
      />
      <EditTaskPopup 
        open={!!editTask} 
        onClose={() => setEditTask(null)} 
        task={editTask} 
        onSave={(updatedTask) => { onUpdateTask(updatedTask); setEditTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task); setEditTask(null); }}
      />
      <AddTaskPopup 
        open={addOpen} 
        onClose={() => setAddOpen(false)} 
        onAdd={(item) => { onAddTask(item); setAddOpen(false); }} 
        projectId={selectedProjectId} 
        dayId={selectedDay}
        planItems={planItems}
      />
      <TaskTimerPopup 
        open={!!timerTask} 
        onClose={() => setTimerTask(null)} 
        task={timerTask} 
        onComplete={onCompleteTask}
      />
      
      <div className="column">
        <div className="column-header">
          <h3>Plan</h3>
          <div className="column-header-actions">
            <button 
              className="view-toggle-button" 
              onClick={() => setViewMode(prev => prev === 'target' ? 'overview' : 'target')}
            >
              {viewMode === 'target' ? '🎯' : '🗓️'}
            </button>
            <button 
              className="add-button" 
              onClick={() => !isPastDate && setAddOpen(true)}
              disabled={isPastDate || !selectedProjectId || !selectedProjectIds[2]}
            >
              Add Task
            </button>
          </div>
        </div>
        
        {viewMode === 'overview' ? (
          <>
            {scheduledOverview.scheduledTasks.length === 0 ? (
              <div className="no-items-message">No planned tasks</div>
            ) : (
              (() => {
                const unscheduledTasks = scheduledOverview.scheduledTasks.filter(
                  item => item.isUnscheduled
                );
                const schedulableItems = scheduledOverview.scheduledTasks.filter(
                  item => !item.isUnscheduled
                );

                return <>
                  {schedulableItems.map((item, idx) =>
                    item.type === 'gap'
                      ? renderGapCard(item, idx)
                      : renderTaskCard(item, true, idx, false)
                  )}
                  {unscheduledTasks.length > 0 && <hr className="unscheduled-separator" />}
                  {unscheduledTasks.map((item, idx) =>
                    renderTaskCard(item, true, idx, true)
                  )}
                </>;
              })()
            )}
          </>
        ) : (
          <>
            {planItems.length === 0 && <div className="no-items-message">No planned tasks</div>}
            {planItems.map((item, idx) => renderTaskCard(item, true, idx))}
          </>
        )}
      </div>
      
      <div className="column">
        <div className="column-header">
          <h3>Fact</h3>
        </div>
        {factCards.length === 0 && <div className="no-items-message">No completed tasks</div>}
        {viewMode === 'overview' ? renderFactColumnOverview() : factCards.map((item) => renderTaskCard(item, false))}
      </div>
    </div>
  );
}