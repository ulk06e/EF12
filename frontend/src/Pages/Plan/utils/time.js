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

/**
 * Converts UTC completed_time to local date string by adding 6 hours offset.
 * @param {string} completedTime The UTC ISO string from completed_time field.
 * @returns {string|null} The local date string in 'YYYY-MM-DD' format, or null if invalid.
 */
export const getLocalDateFromCompletedTime = (completedTime) => {
  if (!completedTime) return null;
  try {
    const utcDate = new Date(completedTime);
    // Add 6 hours to convert from UTC to local timezone
    const localDate = new Date(utcDate.getTime() + 6 * 60 * 60 * 1000);
    return toLocalDateString(localDate);
  } catch (error) {
    return null;
  }
};

/**
 * Converts UTC completed_time to a local Date object for time calculations.
 * @param {string} completedTime The UTC ISO string from completed_time field.
 * @returns {Date|null} The local Date object, or null if invalid.
 */
export const getLocalDateObjectFromCompletedTime = (completedTime) => {
  if (!completedTime) return null;
  try {
    const utcDate = new Date(completedTime);
    // Add 6 hours to convert from UTC to local timezone
    return new Date(utcDate.getTime() + 6 * 60 * 60 * 1000);
  } catch (error) {
    return null;
  }
};


export const formatCompletedTimeForDisplay = (completedTime) => {
  if (!completedTime) return 'Invalid Date';
  try {
    const originalDate = new Date(completedTime);
    const adjustedDate = new Date(originalDate.getTime() + 3 * 60 * 60 * 1000); // +3 часа
    return adjustedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export function isApproximatePeriodInPast(period) {
  const now = new Date();
  const hour = now.getHours();
  if (period === 'night') {
    return hour >= 6; // Night is over after 6:00 AM
  } else if (period === 'morning') {
    return hour >= 12;
  } else if (period === 'afternoon') {
    return hour >= 18;
  } else if (period === 'evening') {
    return false; // Evening is never disabled
  }
  return false;
}

/**
 * Returns the breadcrumb (parent/project) for a given project id.
 * @param {string} projectId - The id of the project.
 * @param {Array} projects - The list of all projects.
 * @returns {string} The breadcrumb string ("Parent / Project") or just "Project" if no parent.
 */
export function getProjectBreadcrumb(projectId, projects) {
  if (!projects || !projectId) return '';
  const project = projects.find(p => p.id === projectId);
  if (!project) return '';
  if (project.parent_id) {
    const parent = projects.find(p => p.id === project.parent_id);
    if (parent) {
      return `${parent.name} / ${project.name}`;
    }
  }
  return project.name;
}
