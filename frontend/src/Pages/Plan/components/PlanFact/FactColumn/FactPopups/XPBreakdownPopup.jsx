import React, { useEffect, useState } from 'react';
import { fetchXPBreakdown } from 'src/Pages/Plan/api/items.js';
import './XPBreakdownPopup.css';

function getMultiplierClass(name, value) {
  if (name === 'Quality') {
    if (value === 4) return 'xp-multiplier-green'; // A
    if (value === 3) return 'xp-multiplier-yellow'; // B
    if (value === 2 || value === 1) return 'xp-multiplier-red'; // C/D
  }
  if (name === 'Time Quality') {
    if (value === 1.5) return 'xp-multiplier-green';
    if (value === 1.0) return 'xp-multiplier-red';
  }
  if (name === 'Priority') {
    if (value === 1.5) return 'xp-multiplier-green';
    if (value === 1.4 || value === 1.3) return 'xp-multiplier-yellow';
    if (value === 1.0) return 'xp-multiplier-red';
  }
  if (name === 'Penalty') {
    if (value === 0.8) return 'xp-multiplier-red';
    if (value === 1.0) return 'xp-multiplier-yellow';
    if (value === 1.1) return 'xp-multiplier-yellow';
    if (value === 1.2) return 'xp-multiplier-green';
    return '';
  }
  return '';
}

function getMultiplierLabel(name, value, breakdown) {
  if (name === 'Quality') {
    return `Quality (${breakdown.quality_letter || ''})`;
  }
  if (name === 'Time Quality') {
    return `Time Quality (${value === 1.5 ? 'pure' : 'not-pure'})`;
  }
  if (name === 'Priority') {
    return `Priority #${breakdown.priority_value || ''}`;
  }
  if (name === 'Penalty') {
    if (value === 0.8) return 'Estimation Penalty';
    if (value === 1.0) return 'Estimation Penalty';
    if (value === 1.1) return 'Estimation Bonus';
    if (value === 1.2) return 'Estimation Bonus';
    return 'Estimation Accuracy';
  }
  return name;
}

export default function XPBreakdownPopup({ open, onClose, taskId }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !taskId) return;
    setLoading(true);
    setError(null);
    setBreakdown(null);
    fetchXPBreakdown(taskId)
      .then(data => setBreakdown(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, taskId]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      onClose();
    }
  };

  let quality_letter = '';
  let priority_value = '';
  if (breakdown && breakdown.multipliers) {
    const q = breakdown.multipliers.find(m => m.name === 'Quality');
    if (q) {
      if (q.value === 4) quality_letter = 'A';
      if (q.value === 3) quality_letter = 'B';
      if (q.value === 2) quality_letter = 'C';
      if (q.value === 1) quality_letter = 'D';
    }
    const p = breakdown.multipliers.find(m => m.name === 'Priority');
    if (p) {
      if (p.value === 1.5) priority_value = '1';
      if (p.value === 1.4) priority_value = '2';
      if (p.value === 1.3) priority_value = '3';
      if (p.value === 1.0) priority_value = '4+';
    }
  }

  return (
    <div className="popup-overlay" onClick={handleOverlayClick} style={{ zIndex: 2000 }}>
      <div className="popup" style={{ minWidth: 340, maxWidth: 400, position: 'relative', padding: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 24 }}>XP Calculation</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {breakdown && (
          <div>
            <div className="xp-base-row">
              <span>Base XP (1 per 10min)</span>
              <span>{breakdown.base_xp}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
              {breakdown.multipliers.map((m, idx) => {
                const label = getMultiplierLabel(m.name, m.value, { ...breakdown, quality_letter, priority_value });
                const className = `xp-multiplier-row ${getMultiplierClass(m.name, m.value)}`;
                return (
                  <div key={idx} className={className}>
                    <span>{label}</span>
                    <span>×{m.value}</span>
                  </div>
                );
              })}
            </div>
            <hr style={{ margin: '24px 0 12px 0', border: 0, borderTop: '2px solid #eee' }} />
            <div className="xp-total-row">
              <span>Total XP</span>
              <span>{breakdown.total_xp}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 