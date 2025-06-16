import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function AddTaskPopup({ open, onClose, onAdd, projectId, dayId }) {
  const [desc, setDesc] = useState('');
  const [timeType, setTimeType] = useState('');
  const [quality, setQuality] = useState('');
  const [est, setEst] = useState('');
  const [priority, setPriority] = useState('');

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <form
        style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px #0002', position: 'relative' }}
        onSubmit={e => { e.preventDefault(); onAdd({ id: uuidv4(), description: desc, time_type: timeType, task_quality: quality, estimated_duration: est ? parseInt(est) : null, priority: priority ? parseInt(priority) : null, project_id: projectId, day_id: dayId, column_location: 'plan' }); setDesc(''); setTimeType(''); setQuality(''); setEst(''); setPriority(''); onClose(); }}
      >
        <h2>Add Task</h2>
        <div style={{ marginBottom: 12 }}>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Name" required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <select value={timeType} onChange={e => setTimeType(e.target.value)} required style={{ width: '100%' }}>
            <option value="">Time type</option>
            <option value="to_goal">to_goal</option>
            <option value="to_time">to_time</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <select value={quality} onChange={e => setQuality(e.target.value)} required style={{ width: '100%' }}>
            <option value="">Task quality</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <input type="number" value={est} onChange={e => setEst(e.target.value)} placeholder="Estimated duration (min)" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <select value={priority} onChange={e => setPriority(e.target.value)} required style={{ width: '100%' }}>
            <option value="">Priority</option>
            {[...Array(10)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
        <button style={{ position: 'absolute', top: 16, right: 24 }} onClick={onClose} type="button">×</button>
      </form>
    </div>
  );
} 