import React from 'react';
import TaskFormPopup from './TaskFormPopup';

export default function EditTaskPopup({ open, onClose, task, onSave, projects }) {
  return (
    <TaskFormPopup
      mode="edit"
      open={open}
      onClose={onClose}
      onSubmit={onSave}
      initialTask={task}
      projectId={task?.project_id}
      projects={projects}
    />
  );
} 