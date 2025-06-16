import React, { useState } from 'react';
import TaskPopup from './TaskPopup';
import EditTaskPopup from './EditTaskPopup';

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export default function PlanFactColumns({ items, onDeleteItem }) {
  const [popupTask, setPopupTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  // Sort plan items by priority (asc: 1 at top), then task quality (A > D)
  const planItems = items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      if ((a.priority || 99) !== (b.priority || 99)) return (a.priority || 99) - (b.priority || 99);
      return (qualityOrder[a.task_quality] || 99) - (qualityOrder[b.task_quality] || 99);
    });
  const factItems = items.filter(item => item.column_location === 'fact');

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
        // Add updated (simulate update in parent)
        setTimeout(() => onDeleteItem(null, data), 0); // We'll update App.jsx to support this
        setEditTask(null);
      });
  };

  return (
    <div style={{ display: 'flex', gap: 32, margin: '24px 0' }}>
      <TaskPopup open={!!popupTask} onClose={() => setPopupTask(null)} task={popupTask} onDelete={handleDelete} onEdit={handleEdit} />
      <EditTaskPopup open={!!editTask} onClose={() => setEditTask(null)} task={editTask} onSave={handleSaveEdit} />
      <div style={{ flex: 1 }}>
        <h3>Plan</h3>
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
        {factItems.length === 0 && <div style={{ color: '#aaa' }}>No completed tasks</div>}
        {factItems.map(item => (
          <div key={item.id} style={{ padding: 8, border: '1px solid #ccc', marginBottom: 8, borderRadius: 4 }}>
            {item.description}
          </div>
        ))}
      </div>
    </div>
  );
} 