const LOCAL_KEY = 'settings_all';
import { API_URL } from 'src/shared/getApiUrl';

const XP_CACHE_KEY = 'last7DaysXP';

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

export function setLocalXP(xpData) {
  try {
    localStorage.setItem(XP_CACHE_KEY, JSON.stringify(xpData));
  } catch (e) {
    console.error('Failed to save XP to localStorage', e);
  }
}

export async function getFreshXP() {
  return await fetchAndCacheLast7DaysXP();
}

export async function getLocalXP(forceRefresh = false) {
  try {
    const data = localStorage.getItem(XP_CACHE_KEY);
    let xpData = data ? JSON.parse(data) : null;
    const todayStr = new Date().toISOString().slice(0, 10);
    // If forceRefresh or no data or last day is not today, fetch new data
    if (
      forceRefresh ||
      !xpData ||
      !Array.isArray(xpData) ||
      xpData.length === 0 ||
      xpData[xpData.length - 1].day !== todayStr
    ) {
      xpData = await fetchAndCacheLast7DaysXP();
    }
    return xpData;
  } catch (e) {
    console.error('Failed to load XP from localStorage', e);
    return await fetchAndCacheLast7DaysXP();
  }
}

export async function fetchAndCacheLast7DaysXP() {
  const res = await fetch(`${API_URL}/items`);
  if (!res.ok) throw new Error('Failed to fetch items');
  const items = await res.json();

  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const xpData = days.map(day => {
    const xp = items
      .filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time)
      .reduce((sum, item) => sum + (item.xp_value || 0), 0);
    return { day, xp };
  });

  setLocalXP(xpData);
  return xpData;
} 