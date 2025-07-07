import React, { useEffect, useState } from 'react';
import ProjectsTime from 'src/Pages/stat/components/ProjectsTime/ProjectsTime';
import XPChart from 'src/Pages/stat/components/XPChart/XPChart';
import { fetchStatisticsData } from 'src/Pages/stat/api/xp';
import 'src/Pages/stat/index.css';

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
            <div className="column sticky-column">
              <div className="header-actions">
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