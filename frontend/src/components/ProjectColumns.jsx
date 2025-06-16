import React from 'react';

function getColumnProjects(projects, parentId) {
  return projects.filter(p => (parentId ? p.parent_id === parentId : !p.parent_id));
}

export default function ProjectColumns({ projects, selectedProjectIds, onSelect }) {
  const [selected1, selected2, selected3] = selectedProjectIds;
  const col1 = getColumnProjects(projects, null);
  const col2 = getColumnProjects(projects, selected1);
  const col3 = getColumnProjects(projects, selected2);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Column 1 */}
      <div style={{ flex: 1 }}>
        <h3>Project 1</h3>
        {col1.map(p => (
          <div key={p.id} style={{ padding: 4, background: selected1 === p.id ? '#eef' : '#fff', cursor: 'pointer' }}
            onClick={() => onSelect([p.id, null, null])}>
            {p.name} (id: {p.id})
          </div>
        ))}
      </div>
      {/* Column 2 */}
      <div style={{ flex: 1 }}>
        <h3>Project 2</h3>
        {col2.length === 0 && <div style={{ color: '#aaa' }}>Select Project 1</div>}
        {col2.map(p => (
          <div key={p.id} style={{ padding: 4, background: selected2 === p.id ? '#eef' : '#fff', cursor: 'pointer' }}
            onClick={() => onSelect([selected1, p.id, null])}>
            {p.name} (id: {p.id})
          </div>
        ))}
      </div>
      {/* Column 3 */}
      <div style={{ flex: 1 }}>
        <h3>Project 3</h3>
        {col3.length === 0 && <div style={{ color: '#aaa' }}>Select Project 2</div>}
        {col3.map(p => (
          <div key={p.id} style={{ padding: 4, background: selected3 === p.id ? '#eef' : '#fff', cursor: 'pointer' }}
            onClick={() => onSelect([selected1, selected2, p.id])}>
            {p.name} (id: {p.id})
          </div>
        ))}
      </div>
    </div>
  );
} 