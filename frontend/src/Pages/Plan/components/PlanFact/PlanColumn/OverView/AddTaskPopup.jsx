import React from 'react';
import TaskFormPopup from './TaskFormPopup';

function AddTaskPopup({ open, onClose, onAdd, projectId, dayId, planItems, projects, selectedProjectIds }) {
  return (
    <TaskFormPopup
      mode="add"
      open={open}
      onClose={onClose}
      onSubmit={onAdd}
      projectId={projectId}
      dayId={dayId}
      allPlanItems={planItems}
      projects={projects}
      selectedProjectIds={selectedProjectIds}
    />
  );
}

export default AddTaskPopup; 