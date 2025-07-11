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

function getDayLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatYAxis(metric, value) {
  if (metric === 'actual' || metric === 'plan') {
    // Show as hours/minutes
    const h = Math.floor(value / 60);
    const m = Math.round(value % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  if (metric === 'xp') return `${value}xp`;
  if (metric === 'productivity') return value.toFixed(1);
  return value;
}

function aggregateDaily(items, metric, days) {
  // days: array of YYYY-MM-DD strings in order
  if (metric === 'durations') {
    // Return both actual and plan durations for each day
    return days.map(day => {
      let dayItems = items.filter(item => (item.day_id || item.completed_time || '').slice(0, 10) === day);
      let actual = dayItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
      let plan = dayItems.filter(i => i.type !== 'daily_basic').reduce((sum, i) => sum + (i.estimated_duration || 0), 0);
      return { day, actual, plan };
    });
  }
  return days.map(day => {
    let dayItems = items.filter(item => (item.day_id || item.completed_time || '').slice(0, 10) === day);
    let value = 0;
    if (metric === 'tasks') value = dayItems.filter(i => i.completed_time).length;
    if (metric === 'xp') value = dayItems.reduce((sum, i) => sum + (i.xp_value || 0), 0);
    if (metric === 'actual') value = dayItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
    if (metric === 'plan') value = dayItems.filter(i => i.type !== 'daily_basic').reduce((sum, i) => sum + (i.estimated_duration || 0), 0);
    if (metric === 'productivity') {
      const xp = dayItems.reduce((sum, i) => sum + (i.xp_value || 0), 0);
      const actual = dayItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
      value = actual > 0 ? xp / actual : 0;
    }
    return { day, value };
  });
}

function getDaysForView(view, items, today = new Date()) {
  // Returns an array of YYYY-MM-DD strings for the selected view
  const days = [];
  const current = new Date(today);
  if (view === 'week') {
    // Rolling last 7 days ending with today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(current);
      d.setDate(current.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }
  if (view === '30d') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(current);
      d.setDate(current.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }
  if (view === 'quarter') {
    // Last 3 months (approx 92 days) ending today
    for (let i = 91; i >= 0; i--) {
      const d = new Date(current);
      d.setDate(current.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }
  if (view === '1y') {
    for (let i = 364; i >= 0; i--) {
      const d = new Date(current);
      d.setDate(current.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }
  if (view === 'all') {
    // Find the earliest date in items
    const allDates = items.map(i => (i.day_id || i.completed_time || '').slice(0, 10)).filter(Boolean);
    if (!allDates.length) return [];
    const minDate = allDates.reduce((min, d) => d < min ? d : min, allDates[0]);
    const min = new Date(minDate);
    const daysArr = [];
    let d = new Date(current);
    while (d >= min) {
      daysArr.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() - 1);
    }
    return daysArr.reverse(); // chronological order
  }
  // Default: all days present in items
  return Array.from(new Set(items.map(i => (i.day_id || i.completed_time || '').slice(0, 10)))).sort();
}

function getStepForView(view, days) {
  if (view === 'quarter') return '2week';
  if (view === '1y') return 'month';
  if (view === 'all') {
    const totalDays = days.length;
    if (totalDays <= 31) return 'day';
    if (totalDays > 31 && totalDays <= 92) return '2week'; // 1 month < x <= 1 quarter
    if (totalDays > 92 && totalDays <= 730) return 'month'; // 1 quarter < x <= 2 years
    return 'year'; // > 2 years
  }
  // Default for week, 30d
  return 'day';
}

function groupByStep(days, step) {
  // Returns an array of { label, days: [YYYY-MM-DD, ...] }
  if (step === 'day') {
    return days.map(day => ({ label: getDayLabel(day), days: [day] }));
  }
  if (step === 'week') {
    const groups = [];
    let week = [];
    days.forEach((day, i) => {
      week.push(day);
      if (week.length === 7 || i === days.length - 1) {
        if (week.length) {
          const label = week.length === 1 ? getDayLabel(week[0]) : `${getDayLabel(week[0])} - ${getDayLabel(week[week.length - 1])}`;
          groups.push({ label, days: [...week] });
        }
        week = [];
      }
    });
    return groups;
  }
  if (step === '2week') {
    const groups = [];
    let twoweek = [];
    days.forEach((day, i) => {
      twoweek.push(day);
      if (twoweek.length === 14 || i === days.length - 1) {
        if (twoweek.length) {
          const label = twoweek.length === 1 ? getDayLabel(twoweek[0]) : `${getDayLabel(twoweek[0])} - ${getDayLabel(twoweek[twoweek.length - 1])}`;
          groups.push({ label, days: [...twoweek] });
        }
        twoweek = [];
      }
    });
    return groups;
  }
  if (step === 'month') {
    const groups = [];
    let currentMonth = '';
    let monthDays = [];
    days.forEach((day, i) => {
      const month = day.slice(0, 7); // YYYY-MM
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
      const year = day.slice(0, 4); // YYYY
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
    let groupItems = items.filter(item => group.days.includes((item.day_id || item.completed_time || '').slice(0, 10)));
    let value = 0, actual = 0, plan = 0;
    if (metric === 'tasks') value = groupItems.filter(i => i.completed_time).length;
    if (metric === 'xp') value = groupItems.reduce((sum, i) => sum + (i.xp_value || 0), 0);
    if (metric === 'actual') value = groupItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
    if (metric === 'plan') value = groupItems.filter(i => i.type !== 'daily_basic').reduce((sum, i) => sum + (i.estimated_duration || 0), 0);
    if (metric === 'productivity') {
      const xp = groupItems.reduce((sum, i) => sum + (i.xp_value || 0), 0);
      const actualDur = groupItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
      value = actualDur > 0 ? xp / actualDur : 0;
    }
    if (metric === 'durations') {
      actual = groupItems.reduce((sum, i) => sum + (i.actual_duration || 0), 0);
      plan = groupItems.filter(i => i.type !== 'daily_basic').reduce((sum, i) => sum + (i.estimated_duration || 0), 0);
      return { label: group.label, actual, plan };
    }
    return { label: group.label, value };
  });
}

export default function XPChart({ items = [], view = 'week' }) {
  const [selectedMetric, setSelectedMetric] = useState('xp');
  const filteredItems = useMemo(() => filterItemsByView(items, view), [items, view]);
  const days = useMemo(() => getDaysForView(view, items), [view, items]);
  const step = useMemo(() => getStepForView(view, days), [view, days]);
  const groups = useMemo(() => groupByStep(days, step), [days, step]);
  const chartData = useMemo(() => {
    return aggregateByStep(filteredItems, selectedMetric, groups);
  }, [filteredItems, selectedMetric, groups]);

  const layout = [
    { i: 'xpchart', x: 0, y: 0, w: 12, h: 6, minW: 6, minH: 4 }
  ];

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
                <YAxis tick={{ fontSize: 14, fill: '#222' }} axisLine={false} tickLine={false} tickMargin={16} tickFormatter={v => formatYAxis(selectedMetric === 'durations' ? 'actual' : selectedMetric, v)} />
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