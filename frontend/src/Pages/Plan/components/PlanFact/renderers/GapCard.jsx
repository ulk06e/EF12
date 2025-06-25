import React from 'react';
import { formatMinutesToHours } from '../../../utils/time';

/**
 * GapCard component for rendering unaccounted time gaps.
 * @param {object} props
 * @param {number} props.minutes - The gap duration in minutes
 * @param {string} props.viewMode - Current view mode
 */
export default function GapCard({ minutes, viewMode }) {
  const duration = minutes || 0;
  const cardStyle = viewMode === 'overview' && duration > 30
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: `${Math.floor(duration / 15) * 6}px`
      }
    : {};

  return (
    <div className="card gap-card" style={cardStyle}>
      <div className="card-item-block">
        <div className="card-item-header">
          <span className="gap-label">Unaccounted Time</span>
        </div>
      </div>
      <div className="card-item-block">
        <div className="card-item-details">
          <span>{formatMinutesToHours(duration)}</span>
        </div>
      </div>
    </div>
  );
} 