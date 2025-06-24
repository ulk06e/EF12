import React, { useEffect, useState } from 'react';
import '../index.css';
import ProjectsTime from '../ProjectsTime/ProjectsTime';
import { API_URL } from '../../Plan/api';

export default function ProjectsTimeApp({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_URL}/projects`).then(res => res.json()),
      fetch(`${API_URL}/items`).then(res => res.json())
    ])
      .then(([projectsData, itemsData]) => {
        setProjects(projectsData);
        setItems(itemsData);
      })
      .catch(err => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="statistics-page">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ProjectsTime projects={projects} items={items} />
      )}
      {/* Add statistics subcomponents here */}
    </div>
  );
} 