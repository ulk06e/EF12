const LOCAL_KEY = 'settings_all';

export function setLocalSettings(settings) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getLocalSettings() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return {};
  }
} 