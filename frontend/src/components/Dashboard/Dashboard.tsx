import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface Task {
  id: string;
  xp_value: number;
  completed_time: string;
  actual_duration: number;
}

interface Statistics {
  current_streak: number;
  best_streak: number;
  best_xp_day: number;
  best_duration_day: number;
}

interface DashboardProps {
  items: Task[];
}

export default function Dashboard({ items }: DashboardProps) {
  const [statistics, setStatistics] = useState<Statistics>({ 
    current_streak: 0, 
    best_streak: 0,
    best_xp_day: 0,
    best_duration_day: 0
  });

  // Check for new day and reload if needed
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      // Set timeout to reload at midnight
      setTimeout(() => {
        window.location.reload();
      }, timeUntilMidnight);
    };

    checkNewDay();
  }, []);

  // Fetch statistics when component mounts
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:8000/statistics');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStatistics({
          current_streak: data.current_streak,
          best_streak: data.best_streak,
          best_xp_day: data.best_xp_day,
          best_duration_day: data.best_duration_day
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  // Calculate today's XP from completed tasks
  const today = new Date().toISOString().split('T')[0];
  const todayXP = items
    .filter(item => item.completed_time && item.completed_time.startsWith(today))
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);

  // Calculate today's total actual time
  const todayActualTime = items
    .filter(item => item.completed_time && item.completed_time.startsWith(today))
    .reduce((sum, item) => sum + (item.actual_duration || 0), 0);

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h3>Dashboard</h3>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Todays XP</h4>
            </div>
            <div className="card-content">

              <span className={`card-value ${todayActualTime < 500 ? 'red-text' : ''}`}>{todayXP}XP</span>
              <span className="card-label">Required 500XP</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Accounted time</h4>
            </div>
            <div className="card-content">
              <span className="card-value">{formatTime(todayActualTime)}</span>
              {/* <span className="card-label">Best {formatTime(statistics.best_duration_day)}</span> */}
            </div>
          </div>
          
          {/* <div className="dashboard-card">
            <div className="card-header">
              <h4>Streak</h4>
            </div>
            <div className="card-content">
              <span className="card-value">
                {statistics.current_streak}
                {statistics.current_streak > 7 && <span className="fire-emoji">🔥</span>}
              </span>
              <span className="card-label">Best: {statistics.best_streak} days</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
