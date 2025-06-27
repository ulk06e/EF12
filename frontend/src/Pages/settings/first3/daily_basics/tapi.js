const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import { getLocalSettings } from '../shared/localDb';
import { toLocalDateString } from '../../../Plan/utils/time';

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/settings/default`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data) {
  const res = await fetch(`${API_URL}/settings/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function rescheduleFutureDailyBasics() {
  function getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toLocalDateString(d);
    });
  }
  const weekDates = getCurrentWeekDates();
  const todayIso = toLocalDateString(new Date());
  // Only keep today and future days
  const futureDates = weekDates.filter(date => date >= todayIso);
  const res = await fetch(`${API_URL}/items`);
  const items = await res.json();
  const allDailyBasics = items.filter(item => item.type === 'daily_basic');
  for (const item of allDailyBasics) {
    if (futureDates.includes((item.day_id || '').slice(0, 10))) {
      await fetch(`${API_URL}/items/${item.id}`, { method: 'DELETE' });
    }
  }
  const settings = getLocalSettings();
  const basics = settings.routine_tasks || [];
  for (const day of futureDates) {
    for (const basic of basics) {
      let duration = basic.duration ? Number(basic.duration) : 30;
      const newTask = {
        id: `${basic.id || Date.now()}_${day}`,
        description: basic.name,
        task_quality: 'D',
        priority: basic.priority,
        estimated_duration: duration,
        project_id: null,
        day_id: day,
        column_location: 'plan',
        completed: false,
        completed_time: null,
        actual_duration: null,
        planned_time: basic.start || null,
        approximate_planned_time: null,
        type: 'daily_basic',
        xp_value: 0,
      };
      await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    }
  }
} 