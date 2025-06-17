import React, { useState } from 'react';
import TaskPopup from './TaskPopup';
import EditTaskPopup from './EditTaskPopup';
import AddTaskPopup from './AddTaskPopup';
import TaskTimerPopup from './TaskTimerPopup';

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
    .filter(item => {
      return item.column_location === 'fact';
    })
    .sort((a, b) => {
      // If both have completed_time, sort by that (newest first)
      if (a.completed_time && b.completed_time) {
        return b.completed_time.localeCompare(a.completed_time);
      }
      // If only one has completed_time, put it first
      if (a.completed_time) return -1;
      if (b.completed_time) return 1;
      // For items without completed_time, sort by id (newer ids first)
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
        onDeleteItem(updatedTask.id); // Remove old
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
        onDeleteItem(updatedTask.id); // Remove old
        setTimeout(() => onDeleteItem(null, data), 0);
      });
  };

  // Calculate unaccounted time for fact items
  const factCards = factItems.map((item, idx) => {
    let unaccounted = null;
    
    // Only calculate unaccounted time if there's a next item (older task)
    if (idx < factItems.length - 1) {
      const nextItem = factItems[idx + 1]; // This is the older task
      const currentTime = new Date(item.completed_time);
      const previousTime = new Date(nextItem.completed_time);
      
      console.log("DEBUG: Date parsing:", {
        id: item.id,
        completed_time: item.completed_time,
        parsed: currentTime,
        isValid: !isNaN(currentTime)
      });
      
      // Time difference between when this task finished and when the previous task finished
      const timeBetweenTasks = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60); // in minutes
      
      // Unaccounted time = time between tasks - actual duration of current task
      unaccounted = Math.max(0, timeBetweenTasks - (item.actual_duration || 0));
    }
    
    // Format the time only if we have a valid date
    let formatted_time = 'Invalid Date';
    if (item.completed_time) {
      try {
        const date = new Date(item.completed_time);
        if (!isNaN(date)) {
          formatted_time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'  // Use UTC to match backend storage
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

  return (
    <div style={{ display: 'flex', gap: 32, margin: '24px 0' }}>
      <TaskPopup open={!!popupTask} onClose={() => setPopupTask(null)} task={popupTask} onDelete={handleDelete} onEdit={handleEdit} onStart={handleStart} />
      <EditTaskPopup open={!!editTask} onClose={() => setEditTask(null)} task={editTask} onSave={handleSaveEdit} />
      <AddTaskPopup open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} projectId={selectedProjectId} dayId={selectedDay} />
      <TaskTimerPopup open={!!timerTask} onClose={() => setTimerTask(null)} task={timerTask} onComplete={handleTimerComplete} />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Plan</h3>
          <button onClick={() => setAddOpen(true)} style={{ fontSize: 20, fontWeight: 'bold', padding: '0 8px' }}>+</button>
        </div>
        {planItems.length === 0 && <div style={{ color: '#aaa' }}>No planned tasks</div>}
        {planItems.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: 8,
              border: idx === 0 ? '3px solid #333' : '1px solid #ccc',
              marginBottom: 8,
              borderRadius: 4,
              cursor: 'pointer',
              background: '#fff',
            }}
            onClick={() => setPopupTask(item)}
          >
            <div><b>{item.description}</b></div>
            <div>Priority: {item.priority ?? '-'}</div>
            <div>Quality: {item.task_quality ?? '-'}</div>
            <div>Time type: {item.time_type ?? '-'}</div>
            <div>Estimated: {item.estimated_duration ?? '-'} min</div>
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1 }}>
        <h3>Fact</h3>
        {factCards.length === 0 && <div style={{ color: '#aaa' }}>No completed tasks</div>}
        {factCards.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: 8,
              border: '1px solid #ccc',
              marginBottom: 8,
              borderRadius: 4,
              background: item.time_quality === 'pure' ? '#e6ffe6' : '#fff',
            }}
          >
            <div><b>{item.description}</b></div>
            <div>Priority: {item.priority ?? '-'}</div>
            <div>Quality: {item.task_quality ?? '-'}</div>
            <div>Actual: {item.actual_duration ?? '-'} min</div>
            <div>Estimated: {item.estimated_duration ?? '-'} min</div>
            <div>Finished: {item.formatted_time}</div>
            <div>XP: {item.xp_value ?? '-'}</div>
            {item.unaccounted !== null && <div>Unaccounted: {Math.round(item.unaccounted)} min</div>}
          </div>
        ))}
      </div>
    </div>
  );
}