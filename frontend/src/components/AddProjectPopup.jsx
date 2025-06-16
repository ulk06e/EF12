import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function AddProjectPopup({ open, onClose, onAdd, parentId }) {
  const [name, setName] = useState('');

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <form
        style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px #0002', position: 'relative' }}
        onSubmit={e => { e.preventDefault(); onAdd({ id: uuidv4(), name, parent_id: parentId }); setName(''); onClose(); }}
      >
        <h2>Add Project</h2>
        <div style={{ marginBottom: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required style={{ width: '100%' }} />
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