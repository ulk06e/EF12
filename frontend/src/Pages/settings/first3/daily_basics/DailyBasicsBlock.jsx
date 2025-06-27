import React, { useState, useEffect } from 'react';
import '../../../Plan/shared/Column.css';
import '../../../Plan/shared/Card.css';
import '../timespan/TimespanBlock.css';
import AddRoutineTaskPopup from './AddRoutineTaskPopup';
import RoutineTaskPopup from './RoutineTaskPopup';
import { fetchSettings, updateSettings } from './tapi';
import { getLocalSettings, setLocalSettings } from '../shared/localDb';
import { handleDeleteTask, handleAddTask } from '../../../Plan/api/items';
import { getTodayDateString, toLocalDateString } from '../../../Plan/utils/time';

export default function DailyBasicsBlock({ addOpen, setAddOpen }) {
  const [routineTasks, setRoutineTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskPopupOpen, setTaskPopupOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSettings()
      .then(data => {
        setRoutineTasks(data.routine_tasks || []);
        setLocalSettings(data);
      })
      .catch(err => { console.error(err); setRoutineTasks([]); })
      .finally(() => setLoading(false));
  }, []);

  function getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toLocalDateString(d);
    });
  }

  async function rescheduleWeekDailyBasics() {
    // Fetch all items
    const weekDates = getCurrentWeekDates();
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/items`);
    const items = await res.json();
    const allDailyBasics = items.filter(item => item.type === 'daily_basic');
    // Delete all daily_basic items for the current week (regardless of other plan tasks)
    for (const item of allDailyBasics) {
      if (weekDates.includes((item.day_id || '').slice(0, 10))) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/items/${item.id}`, { method: 'DELETE' });
      }
    }
    // Add new daily basics for each day in the week, even if those days already have plan tasks
    const settings = getLocalSettings();
    const basics = settings.routine_tasks || [];
    for (const day of weekDates) {
      for (const basic of basics) {
        let duration = basic.duration ? Number(basic.duration) : 30;
        const newTask = {
          id: `${basic.id || Date.now()}_${day}`,
          description: basic.name,
          task_quality: 'D',
          priority: basic.priority,
          estimated_duration: duration,
          project_id: null,
          day_id: day,
          column_location: 'plan',
          completed: false,
          completed_time: null,
          actual_duration: null,
          planned_time: basic.start || null,
          approximate_planned_time: null,
          type: 'daily_basic',
          xp_value: 0,
        };
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
      }
    }
  }

  const handleAddRoutineTask = async (task) => {
    const settings = getLocalSettings();
    const newTasks = [...(settings.routine_tasks || []), task];
    const newSettings = { ...settings, routine_tasks: newTasks };
    setRoutineTasks(newTasks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
      await rescheduleWeekDailyBasics();
    } catch (err) {
      console.error(err);
    }
    setAddOpen(false);
  };

  const handleEditRoutineTask = async (editedTask) => {
    const settings = getLocalSettings();
    const newTasks = (settings.routine_tasks || []).map(t => t.id === editedTask.id ? editedTask : t);
    const newSettings = { ...settings, routine_tasks: newTasks };
    setRoutineTasks(newTasks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
      await rescheduleWeekDailyBasics();
    } catch (err) {
      console.error(err);
    }
    setTaskPopupOpen(false);
  };

  const handleDeleteRoutineTask = async (taskToDelete) => {
    const settings = getLocalSettings();
    const newTasks = (settings.routine_tasks || []).filter(t => t.id !== taskToDelete.id);
    const newSettings = { ...settings, routine_tasks: newTasks };
    setRoutineTasks(newTasks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
      await rescheduleWeekDailyBasics();
    } catch (err) {
      console.error(err);
    }
    setTaskPopupOpen(false);
  };

  return (
    <>
      {loading ? (
        <div className="no-items-message">Loading...</div>
      ) : routineTasks.length === 0 ? (
        <div className="no-items-message">No routine tasks yet</div>
      ) : (
        [...routineTasks]
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((task) => (
            <div
              className="card-relative"
              key={task.id}
              onDoubleClick={() => { setSelectedTask(task); setTaskPopupOpen(true); }}
            >
              <div className="card-content time-block-row">
                <span>{task.priority}: {task.name}</span>
                <span>{task.start} - {task.end}</span>
                <span>{task.duration} min</span>
              </div>
            </div>
          ))
      )}
      <AddRoutineTaskPopup open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddRoutineTask} />
      <RoutineTaskPopup
        open={taskPopupOpen}
        onClose={() => setTaskPopupOpen(false)}
        routineTask={selectedTask}
        onEdit={handleEditRoutineTask}
        onDelete={handleDeleteRoutineTask}
      />
    </>
  );
} 