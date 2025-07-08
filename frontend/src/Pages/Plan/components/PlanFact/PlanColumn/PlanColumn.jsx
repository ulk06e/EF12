import React from 'react';
import PlanOverviewView from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/PlanOverviewView.jsx';
import PlanTargetView from 'src/Pages/Plan/components/PlanFact/PlanColumn/TargetView/PlanTargetView.jsx';
import { scheduleTasks } from 'src/Pages/Plan/components/PlanFact/utils/scheduler.js';
import { handleAddTask } from 'src/Pages/Plan/api/items.js';
import { API_URL } from 'src/shared/getApiUrl';

export default function PlanColumn({
  viewMode,
  setViewMode,
  isPastDate,
  setAddOpen,
  selectedProjectId,
  selectedProjectIds,
  scheduledOverview,
  setPopupTask,
  planItems,
  projects,
  onAddTask
}) {
  // Fill button handler
  const handleFill = async () => {
    try {
      // 1. Fetch all items from backend
      const res = await fetch(`${API_URL}/items`);
      const allItems = await res.json();
      // 2. Filter for not planned tasks and sort by priority (1 is highest)
      const notPlanned = allItems
        .filter(item => item.type === 'not planned')
        .sort((a, b) => (a.priority || 99) - (b.priority || 99));
      if (notPlanned.length === 0) {
        alert('No tasks to plan');
        return;
      }
      // 3. Get today's planned items and schedule to extract gaps
      const today = new Date().toISOString().slice(0, 10);
      const plannedToday = allItems.filter(item => (item.day_id || '').slice(0, 10) === today && item.column_location === 'plan');
      const now = new Date();
      const startTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const schedule = scheduleTasks(plannedToday, startTimeMinutes);
      const gaps = schedule.scheduledTasks.filter(item => item.type === 'gap' && item.minutes > 0);
      // 4. Try to fit as many duplicates of each not planned task as possible into the gaps
      const newTasks = [];
      let tempGaps = gaps.map(gap => ({ ...gap })); // Copy for mutation
      for (let task of notPlanned) {
        for (let gap of tempGaps) {
          let gapLeft = gap.minutes;
          let found = false;
          // Try durations from +20% to -20% in 5 min steps
          const base = task.estimated_duration || 0;
          // Ensure minDur and maxDur are multiples of 5
          const roundTo5 = x => Math.round(x / 5) * 5;
          const minDur = roundTo5(base * 0.8);
          const maxDur = roundTo5(base * 1.2);
          for (let dur = maxDur; dur >= minDur; dur -= 5) {
            while (gapLeft >= dur) {
              // Create a new planned task (duplicate)
              const newTask = {
                ...task,
                id: undefined, // Let backend assign new id
                day_id: today,
                column_location: 'plan',
                planned_time: null,
                approximate_planned_time: null,
                approximate_start: null,
                approximate_end: null,
                completed: false,
                completed_time: null,
                actual_duration: null,
                type: 'not planned', // Set type to 'not planned'
                parent_id: task.id, // Set parent_id to original task's id
                estimated_duration: dur,
                created_time: new Date().toISOString(),
              };
              newTasks.push(newTask);
              gapLeft -= dur;
              found = true;
            }
            if (gapLeft < minDur) break;
          }
          gap.minutes = gapLeft;
        }
      }
      // 5. Batch add all new planned tasks
      if (newTasks.length === 0) {
        alert('No time left');
        return;
      }
      for (let task of newTasks) {
        onAddTask(task);
      }
      // No reload needed; UI will update via state
    } catch (err) {
      alert('Failed to fill plan: ' + err.message);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>Plan</h3>
        <div className="column-header-actions">
          {viewMode === 'overview' && (
            <button
              className="add-button fill-button"
              onClick={handleFill}
            >
              Fill
            </button>
          )}
          <button
            className="view-toggle-button"
            onClick={() => setViewMode(prev => prev === 'target' ? 'overview' : 'target')}
          >
            {viewMode === 'target' ? '🎯' : '🗓️'}
          </button>
          <button
            className="add-button"
            onClick={() => !isPastDate && setAddOpen(true)}
            disabled={isPastDate || !selectedProjectId || !selectedProjectIds[2]}
          >
            Add Task
          </button>
        </div>
      </div>
      {viewMode === 'overview' ? (
        <PlanOverviewView
          scheduledOverview={scheduledOverview}
          isPastDate={isPastDate}
          setPopupTask={setPopupTask}
          viewMode={viewMode}
          projects={projects}
        />
      ) : (
        <PlanTargetView
          planItems={planItems}
          isPastDate={isPastDate}
          setPopupTask={setPopupTask}
          viewMode={viewMode}
          projects={projects}
        />
      )}
    </div>
  );
} 