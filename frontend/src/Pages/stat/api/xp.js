import { API_URL } from '../../Plan/api/index';

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function fetchXPForLast7Days() {
  const res = await fetch(`${API_URL}/items`);
  const items = await res.json();
  const days = getLast7Days();
  return days.map(day => {
    const xp = items
      .filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time)
      .reduce((sum, item) => sum + (item.xp_value || 0), 0);
    return { day, xp };
  });
}

export async function fetchXPAndActualForLast7Days() {
  const res = await fetch(`${API_URL}/items`);
  const items = await res.json();
  const days = getLast7Days();
  return days.map(day => {
    const dayItems = items.filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time);
    const xp = dayItems.reduce((sum, item) => sum + (item.xp_value || 0), 0);
    const actual = dayItems.reduce((sum, item) => sum + (item.actual_duration || 0), 0);
    return { day, xp, actual };
  });
}

export async function fetchStatisticsData() {
  const [projectsRes, itemsRes] = await Promise.all([
    fetch(`${API_URL}/projects`),
    fetch(`${API_URL}/items`)
  ]);
  const projects = await projectsRes.json();
  const items = await itemsRes.json();
  return { projects, items };
} 