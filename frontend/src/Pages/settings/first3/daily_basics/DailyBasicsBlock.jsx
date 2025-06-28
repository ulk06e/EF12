import React, { useState, useEffect } from 'react';
import '../../../Plan/shared/Column.css';
import '../../../Plan/shared/Card.css';
import '../timespan/TimespanBlock.css';
import AddRoutineTaskPopup from './AddRoutineTaskPopup';
import RoutineTaskPopup from './RoutineTaskPopup';
import { fetchSettings, updateSettings, rescheduleDailyBasics } from './tapi';
import { getLocalSettings, setLocalSettings } from '../shared/localDb';
import { getTodayDateString } from '../../../Plan/utils/time';

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