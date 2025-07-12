import React from 'react';
import 'src/shared/styles/Popup.css';

export default function BadgeEarnedPopup({ open, onClose, badge, level }) {
  if (!open || !badge) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      if (onClose) onClose();
    }
  };

  // Determine badge icon and class
  const getBadgeIcon = (level) => {
    if (!level) return { icon: '', class: 'none' };
    
    const levelMap = {
      'Bronze': { icon: '🥉', class: 'bronze' },
      'Silver': { icon: '🥈', class: 'silver' },
      'Gold': { icon: '🥇', class: 'gold' },
      'Platinum': { icon: '💎', class: 'platinum' }
    };
    
    return levelMap[level.name] || { icon: '', class: 'none' };
  };

  const badgeIcon = getBadgeIcon(level);

  return (
    <div className="popup-overlay" onClick={handleOverlayClick} style={{ zIndex: 2000 }}>
      <div className="popup" style={{ minWidth: 320, maxWidth: 400, position: 'relative', padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 16 }}>🏆 Badge Earned!</h2>
        
        <div style={{ fontSize: '2em', marginBottom: 16 }}>
          <div className={`badge-icon ${badgeIcon.class}`} style={{ 
            width: '80px', 
            height: '80px', 
            fontSize: '32px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '3px solid',
            color: 'white'
          }}>
            {badgeIcon.icon}
          </div>
        </div>
        
        <div style={{ fontSize: '1.1em', marginBottom: 12, fontWeight: 600 }}>{badge.name}</div>
        <div style={{ fontSize: '0.9em', color: '#6b7280', marginBottom: 16 }}>{badge.description}</div>
        
        {level && (
          <div style={{ fontSize: '1em', fontWeight: 500, color: '#059669', marginBottom: 16 }}>
            {level.name} Level Achieved!
          </div>
        )}
        
        <button className="add-button" onClick={onClose} style={{ marginTop: 8 }}>Continue</button>
      </div>
    </div>
  );
} 