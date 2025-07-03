// Week-related utility functions

import { SETTINGS } from '../../../config/config';
import { toLocalDateString } from '../utils/time';

export function getCurrentWeek() {
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

export function formatDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
}

export function getDurationClass(duration) {
  if (duration < SETTINGS.WEEK_SELECTOR.DURATION_LOW_MINUTES) return 'duration-low';
  if (duration <= SETTINGS.WEEK_SELECTOR.DURATION_MEDIUM_MINUTES) return 'duration-medium';
  return 'duration-high';
} 