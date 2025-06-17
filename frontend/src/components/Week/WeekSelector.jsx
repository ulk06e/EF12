import React from 'react';

function getCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  // Calculate Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  // Build week array
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function WeekSelector({ selectedDay, onSelect }) {
  const week = getCurrentWeek();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {week.map((date, i) => {
        const iso = date.toISOString().slice(0, 10);
        return (
          <button
            key={iso}
            style={{
              padding: '8px 12px',
              background: selectedDay === iso ? '#eef' : '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontWeight: selectedDay === iso ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
            onClick={() => onSelect(iso)}
          >
            {dayNames[i]}<br />{iso}
          </button>
        );
      })}
    </div>
  );
} 