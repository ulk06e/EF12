const LOCAL_KEY = 'settings_all';
import { API_URL } from 'api/index';

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

export async function checkAndUpdateLocalSettingsIfEmpty() {
  const currentSettings = getLocalSettings();
  
  // Check if routine_tasks exist and have data
  if (currentSettings.routine_tasks && currentSettings.routine_tasks.length > 0) {
    return false; // No update needed
  }
  
  // Fetch from backend
  try {
    const res = await fetch(`${API_URL}/settings/default`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const settings = await res.json();
    
    // Update local storage
    setLocalSettings(settings);
    return true; // Settings were updated
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return false; // Failed to update
  }
} 