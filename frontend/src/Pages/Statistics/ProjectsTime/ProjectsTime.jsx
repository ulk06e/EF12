import React from 'react';
import '../../Plan/Projects/Projects.css';
import '../../Plan/shared/Card.css';
import '../../Plan/shared/Column.css';

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

export default function ProjectsTime({ projects, items }) {
  const col1 = getColumnProjects(projects, items, null);
  const col2 = col1.length > 0 ? getColumnProjects(projects, items, col1[0].id) : [];
  const col3 = col2.length > 0 ? getColumnProjects(projects, items, col2[0].id) : [];
  const labels = ['Area', 'Project', 'Sub-project'];
  const cols = [col1, col2, col3];

  return (
    <div className="columns-container">
      {cols.map((col, i) => (
        <div className="column" key={i}>
          <div className="column-header">
            <h3>{labels[i]}</h3>
          </div>
          {col.length === 0 && <div className="no-items-message">No data</div>}
          {col.map(p => {
            // Utility to get previous level minutes threshold (was XP)
            const getPrevLevelMinutes = (level) => 100 * Math.pow(level, 2);

            // Utility to get next level minutes threshold (was XP)
            const getNextLevelMinutes = (level) => 100 * Math.pow(level + 1, 2);

            const totalMinutes = p.totalActualDuration;
            // Find the current level based on minutes
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
              <div key={p.id} className="card-relative">
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
