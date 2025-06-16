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
  // Sort plan items by priority (asc: 1 at top), then task quality (A > D)
  const planItems = items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      if ((a.priority || 99) !== (b.priority || 99)) return (a.priority || 99) - (b.priority || 99);
      return (qualityOrder[a.task_quality] || 99) - (qualityOrder[b.task_quality] || 99);
    });
  // Fact items: newest on top
  const factItems = items.filter(item => item.column_location === 'fact')
    .sort((a, b) => (b.completed_time || '').localeCompare(a.completed_time || ''));

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
  let prevCompletedTime = null;
  const factCards = factItems.map((item, idx) => {
    let unaccounted = null;
    if (idx > 0 && item.completed_time && prevCompletedTime) {
      const prev = new Date(prevCompletedTime);
      const curr = new Date(item.completed_time);
      const diff = (prev - curr) / 60000; // in minutes
      unaccounted = diff - (item.actual_duration || 0);
      if (unaccounted < 0) unaccounted = 0;
    }
    prevCompletedTime = item.completed_time;
    return { ...item, unaccounted };
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
            <div>Finished: {item.completed_time ? new Date(item.completed_time).toLocaleTimeString() : '-'}</div>
            <div>XP: {item.xp_value ?? '-'}</div>
            {idx > 0 && <div>Unaccounted: {item.unaccounted ?? '-'} min</div>}
          </div>
        ))}
      </div>
    </div>
  );
} 