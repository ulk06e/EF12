const LOCAL_KEY = 'settings_time_blocks';

export function setLocalTimeBlocks(timeBlocks) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(timeBlocks));
  } catch (e) {
    // handle quota or other errors
    console.error('Failed to save time blocks to localStorage', e);
  }
}

export function getLocalTimeBlocks() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load time blocks from localStorage', e);
    return [];
  }
} 