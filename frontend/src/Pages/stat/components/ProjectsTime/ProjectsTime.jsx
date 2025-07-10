import React, { useState, useEffect } from 'react';
import 'src/Pages/Plan/components/Projects/Projects.css';
import 'src/shared/styles/Card.css';
import 'src/shared/styles/Column.css';
import { API_URL } from 'src/shared/getApiUrl';

function getDescendantProjectIds(projects, parentId) {
  const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id);
  let all = [...direct];
  for (const id of direct) {
    all = all.concat(getDescendantProjectIds(projects, id));
  }
  return all;
}

function getColumnProjects(projects, items, parentId) {
  // For each project, calculate total actual duration (including descendants)
  return projects
    .filter(p => (parentId ? p.parent_id === parentId : !p.parent_id))
    .map(p => {
      const allProjectIds = [p.id, ...getDescendantProjectIds(projects, p.id)];
      const totalActualDuration = items
        .filter(item => allProjectIds.includes(item.project_id))
        .reduce((sum, item) => sum + (item.actual_duration || 0), 0);
      return { ...p, totalActualDuration };
    })
    .sort((a, b) => b.totalActualDuration - a.totalActualDuration);
}

export default function ProjectsTime() {
  const [selectedProjectIds, setSelectedProjectIds] = useState([null, null, null]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all projects and items on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_URL}/projects`).then(res => res.json()),
      fetch(`${API_URL}/items`).then(res => res.json())
    ])
      .then(([projects, items]) => {
        setProjects(projects);
        setItems(items.filter(item => item.type !== 'daily_basic'));
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const [selected1, selected2, selected3] = selectedProjectIds;
  const col1 = getColumnProjects(projects, items, null);
  const col2 = selected1 ? getColumnProjects(projects, items, selected1) : [];
  const col3 = selected2 ? getColumnProjects(projects, items, selected2) : [];
  const labels = ['Area Total Time', 'Project', 'Sub-project'];
  const cols = [col1, col2, col3];

  return (
    <div className="columns-container">
      {cols.map((col, i) => (
        <div className="column" key={i}>
          <div className="column-header">
            <h3>{labels[i]}</h3>
          </div>
          {loading && <div className="no-items-message">Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && col.length === 0 && <div className="no-items-message">Select a project</div>}
          {!loading && !error && col.map(p => {
            const getPrevLevelMinutes = (level) => 100 * Math.pow(level, 2);
            const getNextLevelMinutes = (level) => 100 * Math.pow(level + 1, 2);
            const totalMinutes = p.totalActualDuration;
            let level = 0;
            while (totalMinutes >= getNextLevelMinutes(level)) {
              level++;
            }
            const prevLevelMinutes = getPrevLevelMinutes(level);
            const nextLevelMinutes = getNextLevelMinutes(level);
            const progress = (totalMinutes - prevLevelMinutes) / (nextLevelMinutes - prevLevelMinutes);
            let progressPercentage = nextLevelMinutes > prevLevelMinutes
              ? Math.max(0, Math.min(100, progress * 100))
              : 0;
            if (!isFinite(progressPercentage) || progressPercentage < 0) progressPercentage = 0;
            return (
              <div
                key={p.id}
                className={`card-relative ${selectedProjectIds[i] === p.id ? 'selected' : ''}`}
                onClick={() => {
                  const newSel = [...selectedProjectIds];
                  newSel[i] = p.id;
                  for (let j = i + 1; j < 3; j++) newSel[j] = null;
                  setSelectedProjectIds(newSel);
                }}
              >
                <div className="card-header">
                  <div className="project-name">{p.name}</div>
                  <div className="project-level-badge">Level {level}</div>
                </div>
                <div className="card-progress-bar">
                  <div 
                    className="card-progress-fill"
                    style={{ width: `${progressPercentage}%`, background: 'red' }}
                  ></div>
                </div>
                <div className="card-item-details-end">
                  {totalMinutes} min / {nextLevelMinutes} min
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
