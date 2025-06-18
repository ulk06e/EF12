import { useEffect } from 'react';
import { API_URL } from '../api/index';

export function useInitialData(setItems, setProjects, setSelectedDay) {
  useEffect(() => {
    fetch(`${API_URL}/items`)
      .then(res => res.json())
      .then(data => setItems(data))
    
    fetch(`${API_URL}/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
    
    // Auto-select today's date
    const today = new Date()
    const isoToday = today.toISOString().slice(0, 10)
    setSelectedDay(isoToday)
  }, [])
} 