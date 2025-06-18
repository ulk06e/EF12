import React, { useState } from 'react';
import TaskPopup from './Popups/TaskPopup';
import EditTaskPopup from './Popups/EditTaskPopup';
import AddTaskPopup from './Popups/AddTaskPopup';
import TaskTimerPopup from './Popups/TaskTimerPopup';
import './PlanFactColumns.css';

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export default function PlanFactColumns({ 
  items, 
  onAddTask, 
  onDeleteTask,
  onUpdateTask,
  onCompleteTask,
  selectedProjectId, 
  selectedProjectIds,
  selectedDay 
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
    
    if (idx < factItems.length - 1 && item.completed_time) {
      const nextItem = factItems[idx + 1];
      if (nextItem.completed_time) {
        const currentTime = new Date(item.completed_time);
        const previousTime = new Date(nextItem.completed_time);
        const timeBetweenTasks = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);
        unaccounted = Math.max(0, timeBetweenTasks - (item.actual_duration || 0));
      }
    }
    
    const formatted_time = item.completed_time 
      ? new Date(item.completed_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        })
      : 'Invalid Date';
    
    return { 
      ...item, 
      unaccounted,
      formatted_time
    };
  });

  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000) : false;

  // Common task card renderer
  const renderTaskCard = (item, isPlan = false, index = 0) => (
    <div
      key={item.id}
      className={`card ${isPlan && index === 0 ? 'priority-task' : ''} ${!isPlan && item.time_quality === 'pure' ? 'pure-time' : ''}`}
      onClick={() => isPlan && !isPastDate && setPopupTask(item)}
    >
      <div className="card-item-block">
        <div className="card-item-header">
          <span className="card-item-name">
            <span className="card-item-priority">#{item.priority}</span>
            <span className="card-item-separator">-</span>
            <span className="card-item-quality">{item.task_quality}</span>
          </span>
          <span className="card-item-description">: {item.description}</span>
        </div>
      </div>
      <div className="card-item-block">
        <div className="card-item-details">
          {isPlan ? (
            <span>{item.estimated_duration}m</span>
          ) : (
            <>
              <div>
                {item.actual_duration}m/{item.estimated_duration}m - {item.formatted_time}
                {item.unaccounted !== null && item.unaccounted > 0 && (
                  <span className="card-text-unaccounted"> (+{Math.round(item.unaccounted)}m)</span>
                )}
              </div>
              <div className="card-text-xp">+{item.xp_value} XP</div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="columns-container">
      <TaskPopup 
        open={!!popupTask} 
        onClose={() => setPopupTask(null)} 
        task={popupTask} 
        onDelete={(task) => { onDeleteTask(task.id); setPopupTask(null); }}
        onEdit={(task) => { setEditTask(task); setPopupTask(null); }}
        onStart={(task) => { setTimerTask(task); setPopupTask(null); }}
        selectedDay={selectedDay}
      />
      <EditTaskPopup 
        open={!!editTask} 
        onClose={() => setEditTask(null)} 
        task={editTask} 
        onSave={(updatedTask) => { onUpdateTask(updatedTask); setEditTask(null); }}
      />
      <AddTaskPopup 
        open={addOpen} 
        onClose={() => setAddOpen(false)} 
        onAdd={(item) => { onAddTask(item); setAddOpen(false); }} 
        projectId={selectedProjectId} 
        dayId={selectedDay} 
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
          <button 
            className="add-button" 
            onClick={() => !isPastDate && setAddOpen(true)}
            disabled={isPastDate || !selectedProjectId || !selectedProjectIds[2]}
          >
            Add Task
          </button>
        </div>
        {planItems.length === 0 && <div className="no-items-message">No planned tasks</div>}
        {planItems.map((item, idx) => renderTaskCard(item, true, idx))}
      </div>
      
      <div className="column">
        <div className="column-header">
          <h3>Fact</h3>
        </div>
        {factCards.length === 0 && <div className="no-items-message">No completed tasks</div>}
        {factCards.map((item) => renderTaskCard(item, false))}
      </div>
    </div>
  );
}