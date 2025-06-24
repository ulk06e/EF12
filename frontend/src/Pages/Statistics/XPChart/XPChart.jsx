import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchXPAndActualForLast7Days } from '../../Statistics/api/xp';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Responsive, WidthProvider } from "react-grid-layout";
import { formatMinutesToHours } from '../../Plan/utils/time';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function getDayFullLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Helper to fetch actual duration for each day
async function fetchActualDurationForLast7Days() {
  const res = await fetch('/api/items'); // Use your actual API endpoint
  const items = await res.json();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  return days.map(day => {
    const actual = items
      .filter(item => (item.day_id || '').slice(0, 10) === day && item.completed_time)
      .reduce((sum, item) => sum + (item.actual_duration || 0), 0);
    return { day, actual };
  });
}

export default function XPChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchXPAndActualForLast7Days()
      .then(rawData => setData(rawData.map(d => ({
        day: getDayFullLabel(d.day),
        xp: d.xp,
        actual: d.actual
      }))))
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const layout = [
    { i: 'xpchart', x: 0, y: 0, w: 12, h: 6, minW: 6, minH: 4 }
  ];

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>XP & Tracked Time</h3>
        </div>
        <ResponsiveReactGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 8, xs: 6, xxs: 4 }}
          rowHeight={48}
          margin={[0, 0]}
          isDraggable={false}
          isResizable={false}
        >
          <div key="xpchart" style={{ padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 8 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 14, fill: '#222' }} axisLine={false} tickLine={false} tickMargin={16} />
                  <YAxis tick={{ fontSize: 14, fill: '#222' }} axisLine={false} tickLine={false} tickMargin={16} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;
                        const xp = payload.find(p => p.dataKey === 'xp')?.value || 0;
                        return (
                          <div style={{ background: '#fff', border: '1px solid #eee', color: '#222', padding: 8, borderRadius: 6, fontWeight: 500, minWidth: 90 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ display: 'inline-block', width: 12, height: 3, borderRadius: 2, background: '#e53935' }}></span>
                              <span>{formatMinutesToHours(actual)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ display: 'inline-block', width: 12, height: 3, borderRadius: 2, background: '#007bff' }}></span>
                              <span>{xp}XP</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    labelStyle={{ color: '#222' }}
                  />
                  <Line type="monotone" dataKey="xp" stroke="#007bff" strokeWidth={3} dot={{ r: 5, fill: '#007bff', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} name="XP" />
                  <Line type="monotone" dataKey="actual" stroke="#e53935" strokeWidth={3} dot={{ r: 5, fill: '#e53935', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} name="Tracked Time" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
} 