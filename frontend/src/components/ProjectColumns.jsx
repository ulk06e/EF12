import React, { useState } from 'react';
import AddProjectPopup from './AddProjectPopup';

function getColumnProjects(projects, parentId) {
  return projects.filter(p => (parentId ? p.parent_id === parentId : !p.parent_id));
}

export default function ProjectColumns({ projects, selectedProjectIds, onSelect, onAddProject }) {
  const [addCol, setAddCol] = useState(null); // 1, 2, or 3 for which column to add

  const [selected1, selected2, selected3] = selectedProjectIds;
  const col1 = getColumnProjects(projects, null);
  const col2 = getColumnProjects(projects, selected1);
  const col3 = selected2 ? getColumnProjects(projects, selected2) : [];

  // Determine parentId for each column
  const parentIds = [null, selected1, selected2];

  const handleAdd = (project) => {
    fetch('http://localhost:8000/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
      .then(res => res.json())
      .then(data => {
        onAddProject(data);
        setAddCol(null);
      });
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {[col1, col2, col3].map((col, i) => (
        <div style={{ flex: 1 }} key={i}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Project {i + 1}</h3>
            <button onClick={() => setAddCol(i + 1)} style={{ fontSize: 20, fontWeight: 'bold', padding: '0 8px' }}>+</button>
          </div>
          {col.length === 0 && <div style={{ color: '#aaa' }}>Select {i === 0 ? '' : `Project ${i}`}</div>}
          {col.map(p => (
            <div key={p.id} style={{ padding: 4, background: selectedProjectIds[i] === p.id ? '#eef' : '#fff', cursor: 'pointer' }}
              onClick={() => {
                const newSel = [...selectedProjectIds];
                newSel[i] = p.id;
                for (let j = i + 1; j < 3; j++) newSel[j] = null;
                onSelect(newSel);
              }}>
              {p.name} (id: {p.id})
            </div>
          ))}
          <AddProjectPopup open={addCol === i + 1} onClose={() => setAddCol(null)} onAdd={handleAdd} parentId={parentIds[i]} />
        </div>
      ))}
    </div>
  );
} 