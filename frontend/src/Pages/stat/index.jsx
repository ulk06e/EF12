import React, { useEffect, useState } from 'react';
import ProjectsTime from './ProjectsTime/ProjectsTime';
import XPChart from './XPChart/XPChart';
import { API_URL } from '../Plan/api';
import { fetchStatisticsData } from './api/xp';
import './index.css';

export default function StatisticsPage({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStatisticsData()
      .then(({ projects, items }) => {
        setProjects(projects);
        setItems(items);
      })
      .catch(err => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="statistics-page" style={{padding: "0px 0px 0px 0px"}}>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div className="columns-container">
            <div className="column">
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button className="add-button" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
          <XPChart items={items} />
          <ProjectsTime projects={projects} items={items} />
        </>
      )}
    </div>
  );
}