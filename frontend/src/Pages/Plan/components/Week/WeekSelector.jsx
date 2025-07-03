import React from 'react';
import './WeekSelector.css';
import { formatMinutesToHours, toLocalDateString, getDayEstimatedDuration } from '../../utils/time';
import { getLocalSettings, checkAndUpdateLocalSettingsIfEmpty } from 'src/pages/settings/first3/shared/localDb';
import { populateWeekWithDailyBasics } from 'src/pages/settings/first3/api/daily_basics';
import { getCurrentWeek, formatDayName, formatDate, getDurationClass } from '../../utils/weekUtils';
import { fetchItems } from '../../api/weeks';

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
    
    // Check if the new week has any items before populating
    const weekHasItems = newWeek.some(date => 
      items.some(item => (item.day_id || '').slice(0, 10) === toLocalDateString(date))
    );

    if (!weekHasItems) {
      await checkAndUpdateLocalSettingsIfEmpty();
      const nextMondayIso = toLocalDateString(newWeek[0]);
      await populateWeekWithDailyBasics(nextMondayIso);

      // Refresh items from the backend
      if (setItems) {
        try {
          const updatedItems = await fetchItems();
          setItems(updatedItems);
        } catch (error) {
          console.error('[WeekSelector] Failed to refresh items:', error);
        }
      }
    }
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