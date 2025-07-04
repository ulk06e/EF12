import React, { useState, useEffect } from 'react';
import 'src/pages/plan/shared/Column.css';
import 'src/pages/plan/shared/Card.css';
import '../timespan/TimespanBlock.css';
import AddRoutineTaskPopup from 'src/pages/settings/first3/components/daily_basics/Popups/AddRoutineTaskPopup';
import RoutineTaskPopup from 'src/pages/settings/first3/components/daily_basics/Popups/RoutineTaskPopup';
import { fetchSettings, updateSettings, rescheduleDailyBasics } from 'src/pages/settings/first3/api/daily_basics';
import { getLocalSettings, setLocalSettings } from '../../shared/localDb';
import { getTodayDateString, formatMinutesToHours } from 'src/pages/plan/utils/time';

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

  const handleAddRoutineTask = async (task) => {
    const settings = getLocalSettings();
    const newTasks = [...(settings.routine_tasks || []), task];
    const newSettings = { ...settings, routine_tasks: newTasks };
    setRoutineTasks(newTasks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
      await rescheduleDailyBasics();
    } catch (err) {
      console.error('[DailyBasics] Error adding routine task:', err);
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
      await rescheduleDailyBasics();
    } catch (err) {
      console.error('[DailyBasics] Error editing routine task:', err);
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
      await rescheduleDailyBasics();
    } catch (err) {
      console.error('[DailyBasics] Error deleting routine task:', err);
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
          .sort((a, b) => {
            if (!a.end) return 1;
            if (!b.end) return -1;
            return a.end.localeCompare(b.end);
          })
          .map((task) => (
            <div
              className="card-relative"
              key={task.id}
              onDoubleClick={() => { setSelectedTask(task); setTaskPopupOpen(true); }}
            >
              <div className="card-content time-block-row">
                <span>{task.priority}: {task.name} ({formatMinutesToHours(task.duration || 0)})</span>
                <span>{task.start} - {task.end}</span>
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