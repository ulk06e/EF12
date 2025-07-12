import React, { useState } from 'react';
import AddProjectPopup from './Popups/AddProjectPopup';
import ProjectPopup from './Popups/ProjectPopup';
import './Projects.css'; // Import the new CSS file

function getColumnProjects(projects, parentId) {
  return projects
    .filter(p => (parentId ? p.parent_id === parentId : !p.parent_id))
    .filter(p => !p.completed)
    .sort((a, b) => {
      // Sort by current_level (descending)
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      // Then by current_xp (descending)
      return b.current_xp - a.current_xp;
    });
}

// Helper function to get all descendant project IDs
function getDescendantProjectIds(projects, parentId) {
  const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id);
  let all = [...direct];
  for (const id of direct) {
    all = all.concat(getDescendantProjectIds(projects, id));
  }
  return all;
}

// Function to get projects with time data (duplicated from ProjectsTime)
function getColumnProjectsWithTime(projects, items, parentId) {
  return projects
    .filter(p => (parentId ? p.parent_id === parentId : !p.parent_id))
    .filter(p => !p.completed)
    .map(p => {
      const allProjectIds = [p.id, ...getDescendantProjectIds(projects, p.id)];
      const totalActualDuration = items
        .filter(item => allProjectIds.includes(item.project_id))
        .reduce((sum, item) => sum + (item.actual_duration || 0), 0);
      return { ...p, totalActualDuration };
    })
    .sort((a, b) => b.totalActualDuration - a.totalActualDuration);
}

export default function ProjectColumns({ 
  projects, 
  setProjects, 
  selectedProjectIds, 
  onSelect, 
  onAddProject, 
  onDeleteProject, 
  onUpdateProject,
  items,
  selectedDay,
  viewMode
}) {
  const [addCol, setAddCol] = useState(null); // 1, 2, or 3 for which column to add
  const [projectPopup, setProjectPopup] = useState(null); // State for ProjectPopup
  const [areaViewMode, setAreaViewMode] = useState('xp'); // 'xp' or 'time'

  const [selected1, selected2, selected3] = selectedProjectIds;
  
  // Get projects based on view mode for all columns
  const col1 = areaViewMode === 'xp' 
    ? getColumnProjects(projects, null)
    : getColumnProjectsWithTime(projects, items, null);
  const col2 = selected1 ? (areaViewMode === 'xp' 
    ? getColumnProjects(projects, selected1)
    : getColumnProjectsWithTime(projects, items, selected1)) : [];
  const col3 = selected2 ? (areaViewMode === 'xp' 
    ? getColumnProjects(projects, selected2)
    : getColumnProjectsWithTime(projects, items, selected2)) : [];

  // Determine parentId for each column
  const parentIds = [null, selected1, selected2];

  // Check if a project or its descendants have tasks in the plan column
  const hasTasks = (projectId) => {
    const allProjectIds = [projectId, ...getDescendantProjectIds(projects, projectId)];
    if (viewMode === 'overview') {
      // Overview: filter by selected day
      return items.some(item => 
        allProjectIds.includes(item.project_id) && 
        item.column_location === 'plan' &&
        item.day_id && 
        item.day_id.slice(0, 10) === selectedDay
      );
    } else {
      // Target: show dot if any plan task exists, regardless of date
      return items.some(item => 
        allProjectIds.includes(item.project_id) && 
        item.column_location === 'plan'
      );
    }
  };

  const handleAdd = (project) => {
    onAddProject(project);
    setAddCol(null);
  };

  const handleProjectDoubleClick = (project) => {
    setProjectPopup(project);
  };

  const handleDeleteProjectClick = (projectId) => {
    onDeleteProject(projectId);
    setProjectPopup(null); // Close the popup after deletion
  };

  const handleEditProject = (updatedProject) => {
    onUpdateProject(updatedProject);
    setProjectPopup(null); // Close the popup after edit
  };

  const handleCompleteProject = (completedProject) => {
    onUpdateProject(completedProject);
    setProjects(projects => projects.map(p => p.id === completedProject.id ? { ...p, completed: true } : p));
    setProjectPopup(null);
  };

  const labels = ['Area', 'Project', 'Sub-project'];
  const cols = [col1, col2, col3];

  return (
    <div className="columns-container">
      {cols.map((col, i) => (
        <div className="column" key={i}>
          <div className="column-header">
            <h3>{labels[i]}</h3>
            <div className="column-header-actions">
              {i === 0 && (
                <button
                  className="view-toggle-button"
                  onClick={() => setAreaViewMode(prev => prev === 'xp' ? 'time' : 'xp')}
                  title={areaViewMode === 'xp' ? 'Switch to Time view' : 'Switch to XP view'}
                >
                  {areaViewMode === 'xp' ? '⏱️' : '🎮'}
                </button>
              )}
              <button 
                onClick={() => setAddCol(i + 1)} 
                className="add-button"
                disabled={i > 0 && !parentIds[i]}
                style={{ opacity: i > 0 && !parentIds[i] ? 0.5 : 1 }}
              >
                Add
              </button>
            </div>
          </div>
          {col.length === 0 && <div className="no-items-message">Select / Create {i === 0 ? '' : `Project ${i}`}</div>}
          {col.map(p => {
            if (areaViewMode === 'time') {
              // Time view logic (duplicated from ProjectsTime)
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
                    if (selectedProjectIds[i] !== p.id) {
                      const newSel = [...selectedProjectIds];
                      newSel[i] = p.id;
                      for (let j = i + 1; j < 3; j++) newSel[j] = null;
                      onSelect(newSel);
                    }
                  }}
                  onDoubleClick={() => handleProjectDoubleClick(p)}
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
                  {hasTasks(p.id) && <div className="card-indicator"></div>}
                </div>
              );
            } else {
              // XP view logic (original)
              const getPrevLevelXP = (level) => 100 * Math.pow(level, 2);
              const prevLevelXP = getPrevLevelXP(p.current_level);
              const progress = (p.current_xp - prevLevelXP) / (p.next_level_xp - prevLevelXP);
              const progressPercentage = p.next_level_xp > prevLevelXP
                ? Math.max(0, Math.min(100, progress * 100))
                : 0; // Avoid division by zero or negative
              return (
                <div 
                  key={p.id} 
                  className={`card-relative ${selectedProjectIds[i] === p.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (selectedProjectIds[i] !== p.id) {
                      const newSel = [...selectedProjectIds];
                      newSel[i] = p.id;
                      for (let j = i + 1; j < 3; j++) newSel[j] = null;
                      onSelect(newSel);
                    }
                  }}
                  onDoubleClick={() => handleProjectDoubleClick(p)}
                >
                  <div className="card-header">
                    <div className="project-name">{p.name}</div>
                    <div className="project-level-badge">Level {p.current_level}</div>
                  </div>
                  <div className="card-progress-bar">
                    <div 
                      className="card-progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="card-item-details-end">
                    {p.current_xp} / {p.next_level_xp} XP
                  </div>
                  {hasTasks(p.id) && <div className="card-indicator"></div>}
                </div>
              );
            }
          })}
          <AddProjectPopup 
            open={addCol === i + 1} 
            onClose={() => setAddCol(null)} 
            onAdd={handleAdd} 
            parentId={parentIds[i]} 
            columnIndex={i}
          />
        </div>
      ))}
      <ProjectPopup 
        open={!!projectPopup} 
        onClose={() => setProjectPopup(null)} 
        project={projectPopup} 
        onDelete={handleDeleteProjectClick}
        onEdit={handleEditProject}
        onComplete={handleCompleteProject}
      />
    </div>
  );
} 