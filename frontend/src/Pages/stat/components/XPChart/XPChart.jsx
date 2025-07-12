import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { filterItemsByView } from 'src/Pages/stat/utils/statistics';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const METRICS = [
  { label: 'XP', value: 'xp', color: '#007bff' },
  { label: 'Durations', value: 'durations' },
  { label: 'Tasks', value: 'tasks', color: '#6b7280' },
  { label: 'Productivity', value: 'productivity', color: '#059669' },
];

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatYAxis(metric, value) {
  if (metric === 'actual' || metric === 'plan') {
    const h = Math.floor(value / 60);
    const m = Math.round(value % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  if (metric === 'xp') return `${value}xp`;
  if (metric === 'productivity') return value.toFixed(1);
  return value;
}

// Helper to get day items for a specific day
function getDayItems(items, day) {
  return items.filter(item => (item.day_id || item.completed_time || '').slice(0, 10) === day);
}

// Helper to calculate metric value for items
function calculateMetricValue(items, metric) {
  if (metric === 'tasks') return items.filter(i => i.completed_time).length;
  if (metric === 'xp') return items.reduce((sum, i) => sum + (i.xp_value || 0), 0);
  if (metric === 'actual') return items.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
  if (metric === 'plan') return items.filter(i => i.type !== 'daily_basic').reduce((sum, i) => sum + (i.estimated_duration || 0), 0);
  if (metric === 'productivity') {
    const xp = items.reduce((sum, i) => sum + (i.xp_value || 0), 0);
    const actual = items.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
    return actual > 0 ? xp / actual : 0;
  }
  return 0;
}

function aggregateDaily(items, metric, days) {
  if (metric === 'durations') {
    return days.map(day => {
      const dayItems = getDayItems(items, day);
      const actual = calculateMetricValue(dayItems, 'actual');
      const plan = calculateMetricValue(dayItems, 'plan');
      return { day, actual, plan };
    });
  }
  return days.map(day => {
    const dayItems = getDayItems(items, day);
    const value = calculateMetricValue(dayItems, metric);
    return { day, value };
  });
}

function getDaysForView(view, items, today = new Date()) {
  const current = new Date(today);
  
  if (view === 'all') {
    const allDates = items.map(i => (i.day_id || i.completed_time || '').slice(0, 10)).filter(Boolean);
    if (!allDates.length) return [];
    const minDate = allDates.reduce((min, d) => d < min ? d : min, allDates[0]);
    const min = new Date(minDate);
    const daysArr = [];
    let d = new Date(current);
    while (d >= min) {
      daysArr.push(getLocalDateString(d));
      d.setDate(d.getDate() - 1);
    }
    return daysArr.reverse();
  }
  
  const daysMap = { week: 7, '30d': 30, quarter: 91, '1y': 365 };
  const daysBack = daysMap[view] || 0;
  
  const days = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    days.push(getLocalDateString(d));
  }
  return days;
}

function getStepForView(view, days) {
  const stepMap = { quarter: '2week', '1y': 'month' };
  if (stepMap[view]) return stepMap[view];
  
  if (view === 'all') {
    const totalDays = days.length;
    if (totalDays <= 31) return 'day';
    if (totalDays <= 92) return '2week';
    if (totalDays <= 730) return 'month';
    return 'year';
  }
  return 'day';
}

function groupByStep(days, step) {
  if (step === 'day') {
    return days.map(day => ({ label: getDayLabel(day), days: [day] }));
  }
  
  if (step === 'week' || step === '2week') {
    const groupSize = step === 'week' ? 7 : 14;
    const groups = [];
    let currentGroup = [];
    
    days.forEach((day, i) => {
      currentGroup.push(day);
      if (currentGroup.length === groupSize || i === days.length - 1) {
        if (currentGroup.length) {
          const label = currentGroup.length === 1 
            ? getDayLabel(currentGroup[0]) 
            : `${getDayLabel(currentGroup[0])} - ${getDayLabel(currentGroup[currentGroup.length - 1])}`;
          groups.push({ label, days: [...currentGroup] });
        }
        currentGroup = [];
      }
    });
    return groups;
  }
  
  if (step === 'month') {
    const groups = [];
    let currentMonth = '';
    let monthDays = [];
    
    days.forEach((day, i) => {
      const month = day.slice(0, 7);
      if (month !== currentMonth && monthDays.length) {
        const label = new Date(monthDays[0]).toLocaleString('en-US', { month: 'short', year: 'numeric' });
        groups.push({ label, days: [...monthDays] });
        monthDays = [];
      }
      currentMonth = month;
      monthDays.push(day);
      if (i === days.length - 1 && monthDays.length) {
        const label = new Date(monthDays[0]).toLocaleString('en-US', { month: 'short', year: 'numeric' });
        groups.push({ label, days: [...monthDays] });
      }
    });
    return groups;
  }
  
  if (step === 'year') {
    const groups = [];
    let currentYear = '';
    let yearDays = [];
    
    days.forEach((day, i) => {
      const year = day.slice(0, 4);
      if (year !== currentYear && yearDays.length) {
        groups.push({ label: currentYear, days: [...yearDays] });
        yearDays = [];
      }
      currentYear = year;
      yearDays.push(day);
      if (i === days.length - 1 && yearDays.length) {
        groups.push({ label: currentYear, days: [...yearDays] });
      }
    });
    return groups;
  }
  
  return [];
}

function aggregateByStep(items, metric, groups) {
  return groups.map(group => {
    const groupItems = items.filter(item => 
      group.days.includes((item.day_id || item.completed_time || '').slice(0, 10))
    );
    
    if (metric === 'durations') {
      const actual = calculateMetricValue(groupItems, 'actual');
      const plan = calculateMetricValue(groupItems, 'plan');
      return { label: group.label, actual, plan };
    }
    
    const value = calculateMetricValue(groupItems, metric);
    return { label: group.label, value };
  });
}

export default function XPChart({ items = [], view = 'week' }) {
  const [selectedMetric, setSelectedMetric] = useState('xp');
  const filteredItems = useMemo(() => filterItemsByView(items, view), [items, view]);
  const days = useMemo(() => getDaysForView(view, items), [view, items]);
  const step = useMemo(() => getStepForView(view, days), [view, days]);
  const groups = useMemo(() => groupByStep(days, step), [days, step]);
  const chartData = useMemo(() => 
    aggregateByStep(filteredItems, selectedMetric, groups), 
    [filteredItems, selectedMetric, groups]
  );

  const layout = [{ i: 'xpchart', x: 0, y: 0, w: 12, h: 6, minW: 6, minH: 4 }];
  const selectedColor = METRICS.find(m => m.value === selectedMetric)?.color || '#007bff';

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Graph</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {METRICS.map(metric => (
              <button
                key={metric.value}
                className={`menu-button${selectedMetric === metric.value ? ' selected' : ''}`}
                style={{ minWidth: 80 }}
                onClick={() => setSelectedMetric(metric.value)}
              >
                {metric.label}
              </button>
            ))}
          </div>
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
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                <XAxis dataKey="label" tick={{ fontSize: 14, fill: '#222' }} axisLine={false} tickLine={false} tickMargin={16} />
                <YAxis 
                  tick={{ fontSize: 14, fill: '#222' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={16} 
                  tickFormatter={v => formatYAxis(selectedMetric === 'durations' ? 'actual' : selectedMetric, v)} 
                />
                <Tooltip 
                  formatter={(v, name) => formatYAxis(name === 'Actual Duration' ? 'actual' : name === 'Plan Duration' ? 'plan' : selectedMetric, v)}
                  labelStyle={{ color: '#222' }}
                  {...(selectedMetric === 'durations' ? { 
                    content: ({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const actual = payload.find(p => p.dataKey === 'actual');
                      const plan = payload.find(p => p.dataKey === 'plan');
                      return (
                        <div style={{ background: '#fff', border: '1px solid #eee', padding: 8 }}>
                          <div style={{ fontWeight: 600 }}>{label}</div>
                          <div style={{ color: '#e53935' }}>Actual Duration: {formatYAxis('actual', actual?.value || 0)}</div>
                          <div style={{ color: '#fbbf24' }}>Plan Duration: {formatYAxis('plan', plan?.value || 0)}</div>
                        </div>
                      );
                    }
                  } : {})}
                />
                {selectedMetric === 'durations' ? (
                  <>
                    <Line type="monotone" dataKey="actual" stroke="#e53935" strokeWidth={3} dot={{ r: 5, fill: '#e53935', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} name="Actual Duration" />
                    <Line type="monotone" dataKey="plan" stroke="#fbbf24" strokeWidth={3} dot={{ r: 5, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} name="Plan Duration" />
                  </>
                ) : (
                  <Line type="monotone" dataKey="value" stroke={selectedColor} strokeWidth={3} dot={{ r: 5, fill: selectedColor, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} name={METRICS.find(m => m.value === selectedMetric)?.label || ''} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
} 