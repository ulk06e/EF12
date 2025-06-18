import React from 'react';
import './WeekSelector.css';

function getCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  // Calculate Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  // Build week array
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function WeekSelector({ selectedDay, onSelect, items }) {
  const [currentWeek, setCurrentWeek] = React.useState(getCurrentWeek());
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const handleTodayClick = () => {
    const today = new Date();
    onSelect(today.toISOString().slice(0, 10));
    setCurrentWeek(getCurrentWeek());
  };

  const handlePreviousWeek = () => {
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 7);
      return newDate;
    });
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 7);
      return newDate;
    });
    setCurrentWeek(newWeek);
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const getDayEstimatedDuration = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const dayItems = items?.filter(item => item.day_id === formattedDate) || [];
    const totalDuration = dayItems.reduce((sum, item) => sum + (item.estimated_duration || 0), 0);
    return totalDuration;
  };

  const getDurationClass = (duration) => {
    if (duration < 240) return 'duration-low';
    if (duration <= 480) return 'duration-medium';
    return 'duration-high';
  };

  return (
    <div className="columns-container">
      <div className="column-custom-padding">
        <div className="column-header-custom-padding">
          <h3>Week</h3>
          <div className="header-buttons">
            <button onClick={handlePreviousWeek} className="nav-button">←</button>
            <button onClick={handleTodayClick} className="add-button">Today</button>
            <button onClick={handleNextWeek} className="nav-button">→</button>
          </div>
        </div>
        <div className="week-days">
          {currentWeek.map((date) => {
            const iso = date.toISOString().slice(0, 10);
            const estimatedDuration = getDayEstimatedDuration(date);
            const durationClass = getDurationClass(estimatedDuration);
            return (
              <div key={iso} className="week-day-container">
                <button
                  className={`card-custom ${selectedDay === iso ? 'selected' : ''} ${durationClass}`}
                  onClick={() => onSelect(iso)}
                >
                  <div className="week-day-name">{formatDayName(date)}</div>
                  <div className="week-day-date">{formatDate(date)}</div>
                </button>
                <div className="week-day-duration">{estimatedDuration} min</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 