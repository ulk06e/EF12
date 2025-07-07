import React from 'react';
import './WeekSelector.css';
import { SETTINGS } from '../../../../config';
import { formatMinutesToHours, toLocalDateString, getDayEstimatedDuration } from '../../utils/time';
import { getLocalSettings, checkAndUpdateLocalSettingsIfEmpty } from '../../cache/localDb';
import { populateWeekWithDailyBasics } from '../../../settings/first3/daily_basics/tapi';
import { API_URL } from 'api/index';

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

export default function WeekSelector({ selectedDay, onSelect, items, setItems }) {
  const [currentWeek, setCurrentWeek] = React.useState(getCurrentWeek());
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const handleTodayClick = () => {
    const today = new Date();
    onSelect(toLocalDateString(today));
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

  const handleNextWeek = async () => {
    // Navigate to next week
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 7);
      return newDate;
    });
    setCurrentWeek(newWeek);
    
    // Check and update local database if needed
    await checkAndUpdateLocalSettingsIfEmpty();
    
    // Check Monday's estimated duration
    const nextMondayIso = toLocalDateString(newWeek[0]);
    const mondayDuration = getDayEstimatedDuration(nextMondayIso, items);
    
    // If Monday has zero duration, populate the week
    if (mondayDuration === 0) {
      await populateWeekWithDailyBasics(nextMondayIso);
      // Refresh items from the backend to show the newly created daily basics
      if (setItems) {
        try {
          const res = await fetch(`${API_URL}/items`);
          const updatedItems = await res.json();
          setItems(updatedItems);
        } catch (error) {
          console.error('[WeekSelector] Failed to refresh items:', error);
        }
      }
    }
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

  const getDurationClass = (duration) => {
    if (duration < SETTINGS.WEEK_SELECTOR.DURATION_LOW_MINUTES) return 'duration-low';
    if (duration <= SETTINGS.WEEK_SELECTOR.DURATION_MEDIUM_MINUTES) return 'duration-medium';
    return 'duration-high';
  };

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>Week</h3>
          <div className="header-buttons">
            <button onClick={handlePreviousWeek} className="nav-button">←</button>
            <button onClick={handleTodayClick} className="add-button">Today</button>
            <button onClick={handleNextWeek} className="nav-button">→</button>
          </div>
        </div>
        <div className="week-days">
          {currentWeek.map((date) => {
            const iso = toLocalDateString(date);
            const estimatedDuration = getDayEstimatedDuration(iso, items);
            const durationClass = getDurationClass(estimatedDuration);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={iso} className="week-day-container">
                <button
                  className={`card-custom ${selectedDay === iso ? 'selected' : ''} ${durationClass}`}
                  onClick={() => onSelect(iso)}
                >
                  <div className={`week-day-name${isToday ? ' today' : ''}`}>{formatDayName(date)}</div>
                  <div className="week-day-date">{formatDate(date)}</div>
                </button>
                <div className="week-day-duration">{formatMinutesToHours(estimatedDuration)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 