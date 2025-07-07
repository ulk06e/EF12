// Project-related API functions
import { API_URL } from 'src/shared/getApiUrl';
import { getDescendantProjectIds } from 'src/Pages/Plan/hooks/useProjects';

export function handleAddProject(project, setProjects, selectedProjectIds, setSelectedProjectIds) {
  fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })
    .then(res => res.json())
    .then(data => {
      setProjects(projects => [...projects, data]);
      // Auto-select the newly added project
      const newSelected = [...selectedProjectIds];
      if (project.parent_id === null) {
        newSelected[0] = data.id;
        newSelected[1] = null;
        newSelected[2] = null;
      } else if (project.parent_id === selectedProjectIds[0]) {
        newSelected[1] = data.id;
        newSelected[2] = null;
      } else if (project.parent_id === selectedProjectIds[1]) {
        newSelected[2] = data.id;
      }
      setSelectedProjectIds(newSelected);
    });
}

export function handleUpdateProject(updatedProject, setProjects) {
  fetch(`${API_URL}/projects/${updatedProject.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProject)
  })
    .then(res => res.json())
    .then(data => {
      setProjects(projects => projects.map(p => 
        p.id === data.id ? data : p
      ));
    });
}

export function handleDeleteProject(projectId, projects, setProjects, setSelectedProjectIds, getDescendantProjectIds) {
  const descendantIds = getDescendantProjectIds(projects, projectId);
  const allIdsToDelete = [projectId, ...descendantIds];
  const deletePromises = allIdsToDelete.map(id => 
    fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
  );
  Promise.all(deletePromises)
    .then(responses => {
      const allSuccessful = responses.every(res => res.ok);
      if (allSuccessful) {
        setProjects(projects => projects.filter(p => !allIdsToDelete.includes(p.id)));
        setSelectedProjectIds(current => {
          const newSelection = current.map(id => 
            allIdsToDelete.includes(id) ? null : id
          );
          return newSelection;
        });
      } else {
        console.error('Some project deletions failed');
      }
    })
    .catch(error => {
      console.error('Error deleting projects:', error);
    });
}


