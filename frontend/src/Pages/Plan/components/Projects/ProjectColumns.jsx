import React, { useState } from 'react';
import AddProjectPopup from './Popups/AddProjectPopup';
import ProjectPopup from './Popups/ProjectPopup';
import './Projects.css';
import { getColumnProjects, getDescendantProjectIds, getPrevLevelXP } from '../../utils/projectUtils';

export default function ProjectColumns({ 
  projects, 
  setProjects, 
  selectedProjectIds, 
  onSelect, 
  onAddProject, 
  onDeleteProject, 
  onUpdateProject,
  items,
  selectedDay
}) {
  const [addCol, setAddCol] = useState(null); // 1, 2, or 3 for which column to add
  const [projectPopup, setProjectPopup] = useState(null); // State for ProjectPopup

  const [selected1, selected2, selected3] = selectedProjectIds;
  const col1 = getColumnProjects(projects, null);
  const col2 = selected1 ? getColumnProjects(projects, selected1) : [];
  const col3 = selected2 ? getColumnProjects(projects, selected2) : [];

  // Determine parentId for each column
  const parentIds = [null, selected1, selected2];

  // Check if a project or its descendants have tasks in the plan column for the selected date
  const hasTasks = (projectId) => {
    const allProjectIds = [projectId, ...getDescendantProjectIds(projects, projectId)];
    return items.some(item => 
      allProjectIds.includes(item.project_id) && 
      item.column_location === 'plan' &&
      item.day_id && 
      item.day_id.slice(0, 10) === selectedDay
    );
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
            <button 
              onClick={() => setAddCol(i + 1)} 
              className="add-button"
              disabled={i > 0 && !parentIds[i]}
              style={{ opacity: i > 0 && !parentIds[i] ? 0.5 : 1 }}
            >
              Add
            </button>
          </div>
          {col.length === 0 && <div className="no-items-message">Select / Create {i === 0 ? '' : `Project ${i}`}</div>}
          {col.map(p => {
            // Utility to get previous level XP threshold
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
                  const newSel = [...selectedProjectIds];
                  newSel[i] = p.id;
                  for (let j = i + 1; j < 3; j++) newSel[j] = null;
                 
                  onSelect(newSel);
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