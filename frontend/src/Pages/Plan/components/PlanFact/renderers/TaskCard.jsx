import React from 'react';
import { formatMinutesToHours, getProjectBreadcrumb } from '../../../utils/time';

/**
 * TaskCard component for rendering a plan or fact task card.
 * @param {object} props
 * @param {object} props.item - The task item object
 * @param {boolean} props.isPlan - Is this a plan card?
 * @param {number} props.index - Index in the list
 * @param {boolean} props.isUnscheduled - Is this an unscheduled task?
 * @param {boolean} props.isPastDate - Is this a past date?
 * @param {string} props.viewMode - Current view mode
 * @param {function} props.onClick - Click handler (optional)
 * @param {Array} props.projects - The list of all projects
 */
export default function TaskCard({ item, isPlan = false, index = 0, isUnscheduled = false, isPastDate = false, viewMode, onClick, projects }) {
  // Get time information for overview mode
  const getTimeInfo = () => {
    if (item.planned_time) {
      // Extract just the time portion (HH:MM) from planned_time
      const timeMatch = item.planned_time.match(/(\d{1,2}):(\d{2})/);
      const timeDisplay = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : item.planned_time;
      return `${formatMinutesToHours(item.estimated_duration)} - ${timeDisplay}`;
    } else if (item.approximate_planned_time) {
      return `${formatMinutesToHours(item.estimated_duration)} - ${item.approximate_planned_time}`;
    }
    return formatMinutesToHours(item.estimated_duration);
  };

  // Get the project breadcrumb (Parent / Project)
  const breadcrumb = getProjectBreadcrumb(item.project_id, projects);

  const duration = isPlan ? item.estimated_duration || 0 : item.actual_duration || 0;
  const cardStyle = viewMode === 'overview' && duration > 30
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: `${Math.floor(duration / 15) * 6}px`
      }
    : {};

  return (
    <div
      key={item.id}
      className={`card ${isPlan && index === 0 ? 'priority-task' : ''} ${!isPlan && item.time_quality === 'pure' ? 'pure-time' : ''} ${isUnscheduled ? 'unscheduled-task' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="card-item-block">
        <div className="card-item-header">
          <span className="card-item-name">
            <span className="card-item-priority">#{item.priority}</span>
            <span className="card-item-separator">-</span>
            <span className="card-item-quality">{item.task_quality}</span>
          </span>
          {/* Show breadcrumb only in overview mode */}
          <span className="item-description">: {item.description} {viewMode === 'overview' && breadcrumb ? `(${breadcrumb})` : ''}</span>
        </div>
      </div>
      <div className="card-item-block">
        <div className="card-item-details">
          {isPlan ? (
            viewMode === 'overview' ? (
              <span>{getTimeInfo()}</span>
            ) : (
              <span>{formatMinutesToHours(item.estimated_duration)}</span>
            )
          ) : (
            <>
              <div>
                {formatMinutesToHours(item.actual_duration)}/{formatMinutesToHours(item.estimated_duration)} - {item.formatted_time}
                {item.showUnaccountedInline && (
                  <span className="card-text-unaccounted"> (+{formatMinutesToHours(Math.round(item.unaccounted))})</span>
                )}
              </div>
              <div className="card-text-xp">+{item.xp_value} XP</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 