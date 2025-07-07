import React from 'react';
import { formatMinutesToHours } from 'src/shared/utils/time.js';

/**
 * GapCard component for rendering unaccounted time gaps.
 * @param {object} props
 * @param {number} props.minutes - The gap duration in minutes
 * @param {string} props.viewMode - Current view mode
 * @param {number} [props.startMinutes] - Start time in minutes since midnight
 * @param {number} [props.endMinutes] - End time in minutes since midnight
 */
export default function GapCard({ minutes, viewMode, startMinutes, endMinutes }) {
  const duration = minutes || 0;
  
  // Calculate precise styling based on actual minutes
  const cardStyle = viewMode === 'overview' && duration > 30
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: `${Math.floor(duration / 15) * 6}px`
      }
    : {};

  // Format start and end times for display
  const formatTimeFromMinutes = (minutes) => {
    if (minutes == null || minutes < 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startTime = startMinutes != null ? formatTimeFromMinutes(startMinutes) : '';
  const endTime = endMinutes != null ? formatTimeFromMinutes(endMinutes) : '';
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

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