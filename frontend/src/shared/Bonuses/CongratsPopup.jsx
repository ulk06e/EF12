import React from 'react';
import '../styles/Popup.css';

export default function CongratsPopup({ open, onClose, bonus }) {
  if (!open || !bonus) return null;

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
        <div style={{ fontSize: '2em', fontWeight: 700, color: '#059669', marginBottom: 16 }}>+{bonus.xp} XP</div>
        <button className="add-button" onClick={onClose} style={{ marginTop: 8 }}>Claim</button>
      </div>
    </div>
  );
} 