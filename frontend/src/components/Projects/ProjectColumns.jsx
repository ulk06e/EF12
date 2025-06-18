import React, { useState } from 'react';
import AddProjectPopup from './AddProjectPopup';
import ProjectPopup from './ProjectPopup';
import './Projects.css'; // Import the new CSS file

function getColumnProjects(projects, parentId) {
  return projects.filter(p => (parentId ? p.parent_id === parentId : !p.parent_id))
    .sort((a, b) => {
      // Sort by current_level (descending)
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      // Then by current_xp (descending)
      return b.current_xp - a.current_xp;
    });
}

export default function ProjectColumns({ projects, setProjects, selectedProjectIds, onSelect, onAddProject, onDeleteProject, items }) {
  const [addCol, setAddCol] = useState(null); // 1, 2, or 3 for which column to add
  const [projectPopup, setProjectPopup] = useState(null); // State for ProjectPopup

  const [selected1, selected2, selected3] = selectedProjectIds;
  const col1 = getColumnProjects(projects, null);
  const col2 = getColumnProjects(projects, selected1);
  const col3 = selected2 ? getColumnProjects(projects, selected2) : [];

  const API_URL_LOCAL = 'https://ef12.onrender.com';
   const API_URL_OUT = 'http://localhost:8000';

  // Determine parentId for each column
  const parentIds = [null, selected1, selected2];

  // Helper function to get all descendant project IDs
  const getDescendantProjectIds = (parentId) => {
    const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id);
    let all = [...direct];
    for (const id of direct) {
      all = all.concat(getDescendantProjectIds(id));
    }
    return all;
  };

  // Check if a project or its descendants have tasks
  const hasTasks = (projectId) => {
    const allProjectIds = [projectId, ...getDescendantProjectIds(projectId)];
    return items.some(item => 
      allProjectIds.includes(item.project_id) && 
      item.column_location === 'plan'
    );
  };

  const handleAdd = (project) => {
    fetch(`${API_URL_OUT}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
      .then(res => res.json())
      .then(data => {
        onAddProject(data);
        
        // Auto-select the newly added project
        const newSelected = [...selectedProjectIds];
        if (project.parent_id === null) {
          // If it's a top-level project (Area), select it in column 1
          newSelected[0] = data.id;
          newSelected[1] = null; // Clear column 2
          newSelected[2] = null; // Clear column 3
        } else if (project.parent_id === selected1) {
          // If it's a child of the selected project in column 1, select it in column 2
          newSelected[1] = data.id;
          newSelected[2] = null; // Clear column 3
        } else if (project.parent_id === selected2) {
          // If it's a child of the selected project in column 2, select it in column 3
          newSelected[2] = data.id;
        }
        onSelect(newSelected);
        
        setAddCol(null);
      });
  };

  const handleProjectDoubleClick = (project) => {
    setProjectPopup(project);
  };

  const handleDeleteProjectClick = (projectId) => {
    onDeleteProject(projectId);
    setProjectPopup(null); // Close the popup after deletion
  };

  const handleEditProject = (updatedProject) => {
    fetch(`${API_URL_OUT}/projects/${updatedProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProject)
    })
      .then(res => res.json())
      .then(data => {
        // Update the project in the local state
        const updatedProjects = projects.map(p => 
          p.id === data.id ? data : p
        );
        setProjects(updatedProjects);
        setProjectPopup(null); // Close the popup after edit
      });
  };

const labels = ['Area', 'Project', 'Sub-project'];
const cols = [col1, col2, col3];

  return (
    <div className="project-columns-container">
      {cols.map((col, i) => (
    <div className="project-column" key={i}>
      <div className="projects-column-header">
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
          {col.length === 0 && <div className="no-projects-message">Select {i === 0 ? '' : `Project ${i}`}</div>}
          {col.map(p => {
            const progressPercentage = p.next_level_xp > 0 
              ? Math.min(100, (p.current_xp / p.next_level_xp) * 100) 
              : 0; // Avoid division by zero
            return (
              <div 
                key={p.id} 
                className={`project-card ${selectedProjectIds[i] === p.id ? 'selected' : ''}`}
                onClick={() => {
                  const newSel = [...selectedProjectIds];
                  newSel[i] = p.id;
                  for (let j = i + 1; j < 3; j++) newSel[j] = null;
                  onSelect(newSel);
                }}
                onDoubleClick={() => handleProjectDoubleClick(p)}
              >
                <div className="project-card-header">
                  <div className="project-name">{p.name}</div>
                  <div className="project-level-badge">Level {p.current_level}</div>
                </div>
                <div className="project-progress-bar">
                  <div 
                    className="project-progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="project-xp-details">
                  {p.current_xp} / {p.next_level_xp} XP
                </div>
                {hasTasks(p.id) && <div className="task-indicator"></div>}
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
      />
    </div>
  );
} 