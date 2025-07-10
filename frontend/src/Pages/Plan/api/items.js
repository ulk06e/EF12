// Item/task-related API functions
import { API_URL } from 'src/shared/getApiUrl';
import { checkAndTriggerBonus } from 'src/shared/Bonuses/checkAndTriggerBonus.js';

export function handleAddTask(item, setItems) {
  // Remove frontend-only fields
  const { approximate_start, approximate_end, ...itemToSend } = item;
  fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemToSend)
  })
    .then(res => res.json())
    .then(data => {
      setItems(items => [...items, data]);
    });
}

export function handleDeleteTask(taskId, setItems, options = {}) {
  setItems(items => {
    // If options.deleteAllPlanChildren is true, delete all children in the plan column, regardless of day
    let children = [];
    if (options.deleteAllPlanChildren) {
      children = items.filter(item => item.parent_id === taskId && item.column_location === 'plan');
    } else {
      // Default: only today's children
      const today = new Date().toISOString().slice(0, 10);
      children = items.filter(item =>
        item.parent_id === taskId &&
        item.column_location === 'plan' &&
        (item.day_id || '').slice(0, 10) === today
      );
    }
    // Delete each child from backend
    children.forEach(child => {
      fetch(`${API_URL}/items/${child.id}`, { method: 'DELETE' });
    });
    // Delete parent from backend
    fetch(`${API_URL}/items/${taskId}`, { method: 'DELETE' });
    // Remove parent and relevant plan children from local state
    const newItems = items.filter(item =>
      item.id !== taskId &&
      !(item.parent_id === taskId && item.column_location === 'plan' && (options.deleteAllPlanChildren || (item.day_id || '').slice(0, 10) === (new Date().toISOString().slice(0, 10))))
    );
    return newItems;
  });
}

export function handleUpdateTask(updatedTask, setItems, updateItemsState, setProjects) {
  // Remove frontend-only fields
  const { approximate_start, approximate_end, ...itemToSend } = updatedTask;
  fetch(`${API_URL}/items/${updatedTask.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemToSend)
  })
    .then(res => res.json())
    .then(data => {
      updateItemsState(data);
      if (data.completed) {
        return fetch(`${API_URL}/projects`);
      }
    })
    .then(res => {
      if (res) {
        return res.json();
      }
    })
    .then(projectsData => {
      if (projectsData) {
        setProjects(projectsData);
      }
    })
    .catch(error => {
      console.error('Error updating task:', error);
    });
}

export function handleCompleteTask(updatedTask, updateItemsState, setProjects, items, onAddTask, showPopup) {
  // Remove frontend-only fields
  const { approximate_start, approximate_end, ...itemToSend } = updatedTask;
  fetch(`${API_URL}/items/${updatedTask.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemToSend)
  })
    .then(res => res.json())
    .then(async data => {
      updateItemsState(data);
      // Call checkAndTriggerBonus after the real task is added to the items list
      if (items && onAddTask && showPopup) {
        // Compose the new items list with the just-completed real task
        const updatedItems = [...items.filter(i => i.id !== data.id), data];
        await checkAndTriggerBonus({ items: updatedItems, onAddTask, showPopup });
      }
      return fetch(`${API_URL}/projects`);
    })
    .then(res => res.json())
    .then(projectsData => {
      setProjects(projectsData);
    })
    .catch(error => {
      console.error('Error completing task:', error);
    });
}

export function updateItemsState(data, setItems) {
  setItems(items => {
    const idx = items.findIndex(item => item.id === data.id);
    if (idx !== -1) {
      const newItems = [...items];
      newItems[idx] = data;
      return newItems;
    } else {
      return [...items, data];
    }
  });
}

export function filterItemsByProjectAndDay(items, projects, selectedProjectIds, selectedDay, getDescendantProjectIds) {
  let filteredItems = items;
  const lastSelected = selectedProjectIds.slice().reverse().find(id => id);

  // Check if selected day is in the past
  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000) : false;

  if (lastSelected && !isPastDate) {
    const descendantIds = [lastSelected, ...getDescendantProjectIds(projects, lastSelected)];
    
    filteredItems = filteredItems.filter(item => descendantIds.includes(item.project_id));
  }
  if (selectedDay) {
    filteredItems = filteredItems.filter(item => (item.day_id || '').slice(0, 10) === selectedDay);
  }
  return filteredItems;
}

export async function fetchXPBreakdown(taskId) {
  const res = await fetch(`${API_URL}/items/${taskId}/xp_breakdown`);
  if (!res.ok) throw new Error('Failed to fetch XP breakdown');
  return res.json();
}

