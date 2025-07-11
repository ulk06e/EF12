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
  onAddTask,
  selectedDay, // <-- add selectedDay as a prop
  runningTaskId
}) {
  // Fill button handler
  const handleFill = async (maxTasks = Infinity) => {
    try {
      // 1. Fetch all items from backend
      const res = await fetch(`${API_URL}/items`);
      const allItems = await res.json();
      console.log('[MagicButton] All items fetched:', allItems);
      // 2. Filter for not planned tasks and sort by priority (1 is highest)
      const notPlanned = allItems
        .filter(item =>
          item.type === 'not planned' &&
          !item.parent_id &&
          !item.day_id
        )
        .sort((a, b) => (a.priority || 99) - (b.priority || 99));
      if (notPlanned.length === 0) {
        alert('No tasks to plan');
        return;
      }
      // 3. Get selected day's planned items and schedule to extract gaps
      const targetDay = selectedDay; // Use selectedDay instead of today
      const plannedToday = allItems.filter(item => (item.day_id || '').slice(0, 10) === targetDay && item.column_location === 'plan');
      console.log('[MagicButton] Planned for selected day:', plannedToday);
      const now = new Date();
      const startTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const schedule = scheduleTasks(plannedToday, startTimeMinutes);
      const gaps = schedule.scheduledTasks.filter(item => item.type === 'gap' && item.minutes > 0);
      // 4. Try to fit as many duplicates of each not planned task as possible into the gaps
      const newTasks = [];
      let tempGaps = gaps.map(gap => ({ ...gap })); // Copy for mutation
      let added = 0;
      outer: for (let task of notPlanned) {
        for (let gap of tempGaps) {
          let gapLeft = gap.minutes;
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
                day_id: targetDay, // Use selectedDay
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
              added++;
              gapLeft -= dur;
              if (added >= maxTasks) break outer;
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
      console.log('[MagicButton] New tasks to be created:', newTasks);
    } catch (error) {
      console.error('[MagicButton] Error in handleFill:', error);
    }
  };

  // Magic button click handler to distinguish single vs double click
  let clickTimeout = null;
  const handleMagicButtonClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      handleFill(); // Double click: add as many as possible
    } else {
      clickTimeout = setTimeout(() => {
        handleFill(1); // Single click: add only one
        clickTimeout = null;
      }, 250); // 250ms window for double click
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>Plan</h3>
        <div className="column-header-actions">
          {viewMode === 'overview' && !isPastDate && (
            <>
              <button
                className="view-toggle-button"
                onClick={handleMagicButtonClick}
                onDoubleClick={e => e.preventDefault()} // Prevent default double click behavior
                title="Auto-fill plan"
              >
                🪄
              </button>
              {/* Vertical separator only in overview mode */}
              <div className="vertical-separator" />
            </>
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
          runningTaskId={runningTaskId}
        />
      ) : (
        <PlanTargetView
          planItems={planItems}
          isPastDate={isPastDate}
          setPopupTask={setPopupTask}
          viewMode={viewMode}
          projects={projects}
          runningTaskId={runningTaskId}
        />
      )}
    </div>
  );
} 