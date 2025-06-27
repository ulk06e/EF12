const LOCAL_KEY = 'settings_routine_tasks';

export function setLocalRoutineTasks(routineTasks) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(routineTasks));
  } catch (e) {
    console.error('Failed to save routine tasks to localStorage', e);
  }
}

export function getLocalRoutineTasks() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load routine tasks from localStorage', e);
    return [];
  }
} 