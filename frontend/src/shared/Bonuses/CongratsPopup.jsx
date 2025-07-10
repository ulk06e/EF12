import React from 'react';
import '../styles/Popup.css';
import { handleAddTask } from 'src/Pages/Plan/api/items';

export default function CongratsPopup({ open, onClose, bonus, setItems }) {
  if (!open || !bonus) return null;

  const handleClaim = () => {
    const today = new Date().toISOString().slice(0, 10);
    const bonusTask = {
      // id is omitted, backend will generate it
      type: 'bonus',
      column_location: 'fact',
      completed: true,
      day_id: today,
      completed_time: new Date().toISOString(),
      xp_value: bonus.xp,
      description: bonus.id, // Use bonus.id as the description (bonus ID)
    };
    handleAddTask(bonusTask, setItems);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick} style={{ zIndex: 2000 }}>
      <div className="popup" style={{ minWidth: 320, maxWidth: 400, position: 'relative', padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 16 }}>🎉 Congratulations!</h2>
        <div style={{ fontSize: '1.1em', marginBottom: 12 }}>{bonus.message}</div>
        {bonus.quote && (
          <div style={{ fontStyle: 'italic', color: '#888', marginBottom: 16 }}>&ldquo;{bonus.quote}&rdquo;</div>
        )}
        <div style={{ fontSize: '2em', fontWeight: 700, color: '#059669', marginBottom: 16 }}>+{bonus.xp} XP</div>
        <button className="add-button" onClick={handleClaim} style={{ marginTop: 8 }}>Claim</button>
      </div>
    </div>
  );
} 