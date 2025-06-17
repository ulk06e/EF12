import React, { useState } from 'react';
import TaskPopup from './TaskPopup';
import EditTaskPopup from './EditTaskPopup';
import AddTaskPopup from './AddTaskPopup';
import TaskTimerPopup from './TaskTimerPopup';
import './PlanFactColumns.css';

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export default function PlanFactColumns({ items, onDeleteItem, onAddTask, selectedProjectId, selectedDay }) {
  const [popupTask, setPopupTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [timerTask, setTimerTask] = useState(null);
  
  console.log("DEBUG: All items received:", items);
  
  // Sort plan items by priority (asc: 1 at top), then task quality (A > D)
  const planItems = items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      if (a.priority == null || b.priority == null) {
        throw new Error("Priority missing in plan item");
      }
      if (!qualityOrder[a.task_quality] || !qualityOrder[b.task_quality]) {
        throw new Error("Invalid or missing task_quality in plan item");
      }
      if (a.priority !== b.priority) return a.priority - b.priority;
      return qualityOrder[a.task_quality] - qualityOrder[b.task_quality];
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

  const handleDelete = (task) => {
    fetch(`http://localhost:8000/items/${task.id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          onDeleteItem(task.id);
          setPopupTask(null);
        }
      });
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setPopupTask(null);
  };

  const handleSaveEdit = (updatedTask) => {
    fetch(`http://localhost:8000/items/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
      .then(res => res.json())
      .then(data => {
        onDeleteItem(updatedTask.id);
        setTimeout(() => onDeleteItem(null, data), 0);
        setEditTask(null);
      });
  };

  const handleAdd = (item) => {
    fetch('http://localhost:8000/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
      .then(res => res.json())
      .then(data => {
        onAddTask(data);
        setAddOpen(false);
      });
  };

  const handleStart = (task) => {
    setTimerTask(task);
    setPopupTask(null);
  };

  const handleTimerComplete = (updatedTask) => {
    fetch(`http://localhost:8000/items/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
      .then(res => res.json())
      .then(data => {
        onDeleteItem(updatedTask.id);
        setTimeout(() => onDeleteItem(null, data), 0);
      });
  };

  // Calculate unaccounted time for fact items
  const factCards = factItems.map((item, idx) => {
    let unaccounted = null;
    
    if (idx < factItems.length - 1) {
      const nextItem = factItems[idx + 1];
      const currentTime = new Date(item.completed_time);
      const previousTime = new Date(nextItem.completed_time);
      const timeBetweenTasks = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);
      unaccounted = Math.max(0, timeBetweenTasks - (item.actual_duration || 0));
    }
    
    let formatted_time = 'Invalid Date';
    if (item.completed_time) {
      try {
        const date = new Date(item.completed_time);
        if (!isNaN(date)) {
          formatted_time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
          });
        }
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
    
    return { 
      ...item, 
      unaccounted,
      formatted_time
    };
  });

  const isDateBeforeToday = (date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isPastDate = selectedDay ? isDateBeforeToday(selectedDay) : false;

  return (
    <div className="plan-fact-columns-container">
      <TaskPopup 
        open={!!popupTask} 
        onClose={() => setPopupTask(null)} 
        task={popupTask} 
        onDelete={handleDelete} 
        onEdit={handleEdit} 
        onStart={handleStart}
        selectedDay={selectedDay}
      />
      <EditTaskPopup open={!!editTask} onClose={() => setEditTask(null)} task={editTask} onSave={handleSaveEdit} />
      <AddTaskPopup open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} projectId={selectedProjectId} dayId={selectedDay} />
      <TaskTimerPopup open={!!timerTask} onClose={() => setTimerTask(null)} task={timerTask} onComplete={handleTimerComplete} />
      
      <div className="plan-fact-column">
        <div className="plan-fact-column-header">
          <h3>Plan</h3>
          <button 
            className="add-button" 
            onClick={() => !isPastDate && setAddOpen(true)}
            disabled={isPastDate}
          >
            Add Task
          </button>
        </div>
        {planItems.length === 0 && <div className="no-tasks-message">No planned tasks</div>}
        {planItems.map((item, idx) => (
          <div
            key={item.id}
            className={`task-card ${idx === 0 ? 'priority-task' : ''}`}
            onClick={() => !isPastDate && setPopupTask(item)}
          >
            <div className="item-block">
              <div className="item-header">
                <span className="item-name">
                  <span className="item-priority">#{item.priority}</span>
                  <span className="item-separator">-</span>
                  <span className="item-quality">{item.task_quality}</span>
                </span>
                <span className="item-description">: {item.description}</span>
              </div>
            </div>
            <div className="item-block">
              <div className="item-details">
                <span>{item.estimated_duration}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="plan-fact-column">
        <div className="plan-fact-column-header">
          <h3>Fact</h3>
        </div>
        {factCards.length === 0 && <div className="no-tasks-message">No completed tasks</div>}
        {factCards.map((item) => (
          <div
            key={item.id}
            className={`task-card ${item.time_quality === 'pure' ? 'pure-time' : ''}`}
          >
            <div className="item-block">
              <div className="item-header">
                <span className="item-name">
                  <span className="item-priority">#{item.priority}</span>
                  <span className="item-separator">-</span>
                  <span className="item-quality">{item.task_quality}</span>
                </span>
                <span className="item-description">: {item.description}</span>
              </div>
            </div>
            <div className="item-block">
              <div className="item-details">
                <div>
                  {item.actual_duration}m/{item.estimated_duration}m - {item.formatted_time}
                  {item.unaccounted !== null && item.unaccounted > 0 && (
                    <span className="unaccounted-time"> (+{Math.round(item.unaccounted)}m)</span>
                  )}
                </div>
                <div className="xp-value">+{item.xp_value} XP</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}