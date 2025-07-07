import { useState, useEffect } from 'react';
import { API_URL } from '../api/index';
import { getTodayDateString } from '../utils/time';
import { getLocalSettings } from '../cache/localDb';
import { handleAddTask } from '../api/items';

export default function useInitialData() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(getTodayDateString());

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsRes, projectsRes] = await Promise.all([
          fetch(`${API_URL}/items`),
          fetch(`${API_URL}/projects`),
        ]);
        const itemsData = await itemsRes.json();
        const projectsData = await projectsRes.json();
        setItems(itemsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { 
    items, setItems, 
    projects, setProjects, 
    days, setDays, 
    selectedProjectIds, setSelectedProjectIds, 
    loading, 
    selectedDay, setSelectedDay 
  };
} 