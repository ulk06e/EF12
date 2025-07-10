import React, { useState, useEffect } from 'react';
import '../styles/Popup.css';
import { handleAddTask } from 'src/Pages/Plan/api/items';

export default function CongratsPopup({ open, onClose, bonuses, setItems }) {
  // Accept either a single bonus or an array
  const initialQueue = Array.isArray(bonuses) ? bonuses : bonuses ? [bonuses] : [];
  const [queue, setQueue] = useState(initialQueue);
  const [current, setCurrent] = useState(initialQueue[0] || null);

  useEffect(() => {
    const newQueue = Array.isArray(bonuses) ? bonuses : bonuses ? [bonuses] : [];
    setQueue(newQueue);
    setCurrent(newQueue[0] || null);
  }, [bonuses]);

  const handleClaim = () => {
    if (!current) return;
    const today = new Date().toISOString().slice(0, 10);
    const bonusTask = {
      type: 'bonus',
      column_location: 'fact',
      completed: true,
      day_id: today,
      completed_time: new Date().toISOString(),
      xp_value: current.xp,
      description: current.id,
    };
    handleAddTask(bonusTask, setItems);
    if (queue.length > 1) {
      setQueue(queue.slice(1));
      setCurrent(queue[1]);
    } else {
      setCurrent(null);
      if (onClose) onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      if (onClose) onClose();
    }
  };

  if (!open || !current) return null;

  return (
    <div className="popup-overlay" onClick={handleOverlayClick} style={{ zIndex: 2000 }}>
      <div className="popup" style={{ minWidth: 320, maxWidth: 400, position: 'relative', padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 16 }}>🎉 Congratulations!</h2>
        <div style={{ fontSize: '1.1em', marginBottom: 12 }}>{current.message}</div>
        {current.quote && (
          <div style={{ fontStyle: 'italic', color: '#888', marginBottom: 16 }}>&ldquo;{current.quote}&rdquo;</div>
        )}
        <div style={{ fontSize: '2em', fontWeight: 700, color: '#059669', marginBottom: 16 }}>+{current.xp} XP</div>
        <button className="add-button" onClick={handleClaim} style={{ marginTop: 8 }}>Claim</button>
      </div>
    </div>
  );
} 