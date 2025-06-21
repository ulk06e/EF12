export const formatMinutesToHours = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Converts a Date object to a 'YYYY-MM-DD' string based on local time.
 * @param {Date} date The date to convert.
 * @returns {string} The formatted date string.
 */
export const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date as a 'YYYY-MM-DD' string in the local timezone.
 * @returns {string} The formatted date string for today.
 */
export const getTodayDateString = () => {
  return toLocalDateString(new Date());
}; 