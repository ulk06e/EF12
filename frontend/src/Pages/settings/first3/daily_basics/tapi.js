import { API_URL } from 'src/shared/getApiUrl';

import { getLocalSettings } from 'src/shared/cache/localDb';
import { toLocalDateString } from 'src/shared/utils/time.js';

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

function createDailyBasicTask(basic, day) {
  const duration = basic.duration ? Number(basic.duration) : 30;
  const task = {
    id: `${basic.id || Date.now()}_${day}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    planned_time: null,
    approximate_planned_time: `${basic.start} - ${basic.end}`,
    type: 'daily_basic',
    xp_value: 0,
  };
  return task;
}

export async function rescheduleDailyBasics() {
  try {
    // Use bulk deletion endpoint
    const deleteRes = await fetch(`${API_URL}/items/bulk/daily_basics/future`, { 
      method: 'DELETE' 
    });
    if (!deleteRes.ok) {
      throw new Error(`Failed to delete future daily basics: ${deleteRes.status}`);
    }
    
    const settings = getLocalSettings();
    const basics = settings.routine_tasks || [];
    
    if (basics.length === 0) {
      return;
    }
    
    // Get today and future dates for the current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return toLocalDateString(d);
    });
    
    const todayIso = toLocalDateString(new Date());
    const futureDates = weekDates.filter(date => date >= todayIso);
    
    // Create new daily basics for today and future days (bulk)
    const allTasks = [];
    for (const day of futureDates) {
      for (const basic of basics) {
        allTasks.push(createDailyBasicTask(basic, day));
      }
    }
    if (allTasks.length > 0) {
      const createRes = await fetch(`${API_URL}/items/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allTasks)
      });
      if (!createRes.ok) {
        throw new Error(`Failed to create daily basic tasks in bulk: ${createRes.status}`);
      }
    }
  } catch (error) {
    console.error('[DailyBasics] Error in rescheduleDailyBasics:', error);
    throw error;
  }
}

export async function populateWeekWithDailyBasics(weekStartDate) {
  const settings = getLocalSettings();
  const basics = settings.routine_tasks || [];
  
  if (basics.length === 0) {
    return;
  }
  
  // Generate all 7 days of the week starting from weekStartDate
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    return toLocalDateString(d);
  });
  
  // Create daily basic tasks for each day of the week (bulk)
  const allTasks = [];
  for (const day of weekDates) {
    for (const basic of basics) {
      allTasks.push(createDailyBasicTask(basic, day));
    }
  }
  if (allTasks.length > 0) {
    try {
      await fetch(`${API_URL}/items/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allTasks)
      });
    } catch (error) {
      console.error('[DailyBasics] Error creating tasks in bulk:', error);
      console.error('[DailyBasics] Tasks that failed:', allTasks);
    }
  }
} 