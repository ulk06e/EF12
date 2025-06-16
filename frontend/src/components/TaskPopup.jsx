import React from 'react';

export default function TaskPopup({ open, onClose, task, onDelete, onEdit }) {
  if (!open || !task) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
        <h2>{task.description}</h2>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={() => onDelete(task)}>Delete</button>
          <button onClick={() => onEdit(task)}>Edit</button>
          <button>Start</button>
        </div>
        <button style={{ position: 'absolute', top: 16, right: 24 }} onClick={onClose}>×</button>
      </div>
    </div>
  );
} 