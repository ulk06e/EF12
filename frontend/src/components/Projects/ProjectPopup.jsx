import React from 'react';
import '../Shared/popup.css'; // Assuming a shared popup style

export default function ProjectPopup({ open, onClose, project }) {
  if (!open || !project) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{project.name}</h2>
        <div className="popup-buttons">
          <button className="popup-button delete-button">Delete</button>
          <button className="popup-button edit-button">Edit</button>
          <button className="popup-button complete-button">Complete</button>
        </div>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 