import React, { useState, useMemo, useEffect } from 'react';
import TaskPopup from './Popups/TaskPopup.jsx';
import EditTaskPopup from './Popups/EditTaskPopup.jsx';
import AddTaskPopup from './Popups/AddTaskPopup.jsx';
import TaskTimerPopup from './Popups/TaskTimerPopup.jsx';
import XPBreakdownPopup from './Popups/XPBreakdownPopup.jsx';
import { scheduleTasks, mergeSchedule } from '../../utils/schedule/index.js';
import { getLocalTimeBlocks } from 'src/pages/settings/first3/shared/localDb.js';
import './PlanFactColumns.css';
import { sortPlanItems, attachTimeBlocksToPlanItems, handleDuplicateTask } from 'src/pages/plan/components/PlanFact/utils/planUtils.js';
import { prepareFactCards } from 'src/pages/plan/components/PlanFact/utils/factUtils.js';
import TaskCard from './renderers/TaskCard.jsx';
import GapCard from './renderers/GapCard.jsx';
import { fetchXPForLast7Days } from 'src/pages/stat/api/xp.js';

export default function PlanFactColumns({ 
  items, 
  onAddTask, 
  onDeleteTask,
  onUpdateTask,
  onCompleteTask,
  selectedProjectId, 
  selectedProjectIds,
  selectedDay,
  viewMode,
  setViewMode,
  projects
}) {
  const [popupTask, setPopupTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [timerTask, setTimerTask] = useState(null);
  const [xpPopupTaskId, setXpPopupTaskId] = useState(null);
  const [xpStats, setXpStats] = useState({ today: 0, yesterday: 0, weekAvg: 0, weekBest: 0 });

  useEffect(() => {
    fetchXPForLast7Days().then(days => {
      const today = days[days.length - 1]?.xp || 0;
      const yesterday = days[days.length - 2]?.xp || 0;
      const weekAvg = days.length ? Math.round(days.reduce((sum, d) => sum + d.xp, 0) / days.length) : 0;
      const weekBest = days.length ? Math.max(...days.map(d => d.xp)) : 0;
      setXpStats({ today, yesterday, weekAvg, weekBest });
    });
  }, []);

  const minTarget = Math.min(xpStats.yesterday, xpStats.weekAvg, xpStats.weekBest);

  // Use utility for plan items
  const planItems = sortPlanItems(items);
  
  // Attach approximate_start and approximate_end to plan items before scheduling
  const timeBlocks = getLocalTimeBlocks();
  const planItemsWithBlocks = attachTimeBlocksToPlanItems(planItems, timeBlocks);

  // Use utility for fact cards
  const factCards = prepareFactCards(items);

  // Overview scheduling algorithm
  const scheduledOverview = useMemo(() => {
    if (viewMode !== 'overview' || !planItemsWithBlocks || planItemsWithBlocks.length === 0) {
      return { scheduledTasks: planItemsWithBlocks, errors: [] };
    }
    const isToday = selectedDay === (new Date()).toISOString().split('T')[0];
    const now = new Date();
    const startTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const result = isToday
      ? scheduleTasks(planItemsWithBlocks, startTimeMinutes)
      : scheduleTasks(planItemsWithBlocks);
    const mergedTimeline = mergeSchedule(result.scheduledTasks, result.gaps);
    const scheduledTasks = [...mergedTimeline, ...result.unscheduledTasks];
    return { ...result, scheduledTasks };
  }, [planItemsWithBlocks, viewMode, selectedDay]);
  
  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  // Use imported handleDuplicateTask

  // Render fact column in overview mode with unaccounted time as grey cards (>=15m) and as red text (<15m)
  const renderFactColumnOverview = () => {
    const cards = [];
    for (let i = factCards.length - 1; i >= 0; i--) {
      const item = factCards[i];
      if (item.unaccounted && item.unaccounted >= 15) {
        cards.push(
          <GapCard key={`fact-gap-${i}`} minutes={Math.round(item.unaccounted)} viewMode={viewMode} />
        );
      }
      const showUnaccountedInline = item.unaccounted && item.unaccounted > 0 && item.unaccounted < 15;
      cards.push(
        <TaskCard key={item.id} item={{ ...item, showUnaccountedInline }} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />
      );
    }
    return cards.reverse();
  };

  // Determine which label to show for minTarget, prioritizing best > week avg. > y'day
  let minLabel = '';
  if (minTarget === xpStats.weekBest) {
    minLabel = 'best';
  } else if (minTarget === xpStats.weekAvg) {
    minLabel = 'week avg.';
  } else if (minTarget === xpStats.yesterday) {
    minLabel = "y'day";
  }

  return (
    <div className={`columns-container ${viewMode === 'overview' ? 'overview-mode' : ''}`}>
      <TaskPopup 
        open={!!popupTask} 
        onClose={() => setPopupTask(null)} 
        task={popupTask} 
        onDelete={(task) => { onDeleteTask(task.id); setPopupTask(null); }}
        onEdit={(task) => { setEditTask(task); setPopupTask(null); }}
        onStart={(task) => { setTimerTask(task); setPopupTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task, onAddTask); setPopupTask(null); }}
        selectedDay={selectedDay}
      />
      <EditTaskPopup 
        open={!!editTask} 
        onClose={() => setEditTask(null)} 
        task={editTask} 
        onSave={(updatedTask) => { onUpdateTask(updatedTask); setEditTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task, onAddTask); setEditTask(null); }}
      />
      <AddTaskPopup 
        open={addOpen} 
        onClose={() => setAddOpen(false)} 
        onAdd={(item) => {
          if (viewMode === 'target') {
            item.day_id = null;
            item.type = 'not planned';
            item.priority = (parseInt(item.priority, 10) || 0) + 10;
          }
          onAddTask(item);
          setAddOpen(false);
        }} 
        projectId={selectedProjectId} 
        dayId={selectedDay}
        planItems={planItems}
        projects={projects}
        selectedProjectIds={selectedProjectIds}
      />
      <TaskTimerPopup 
        open={!!timerTask} 
        onClose={() => setTimerTask(null)} 
        task={timerTask} 
        onComplete={onCompleteTask}
      />
      <XPBreakdownPopup open={!!xpPopupTaskId} onClose={() => setXpPopupTaskId(null)} taskId={xpPopupTaskId} />
      
      <div className="column">
        <div className="column-header">
          <h3>Plan</h3>
          <div className="column-header-actions">
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
          <>
            {scheduledOverview.scheduledTasks.length === 0 ? (
              <div className="no-items-message">No planned tasks</div>
            ) : (
              (() => {
                const unscheduledTasks = scheduledOverview.scheduledTasks.filter(
                  item => item.isUnscheduled
                );
                const schedulableItems = scheduledOverview.scheduledTasks.filter(
                  item => !item.isUnscheduled
                );

                return <>
                  {schedulableItems.map((item, idx) =>
                    item.type === 'unaccounted'
                      ? <GapCard key={`gap-${item.startBlock}-${item.endBlock}`} minutes={item.minutes} viewMode={viewMode} />
                      : <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={false} isPastDate={isPastDate} onClick={() => !isPastDate && setPopupTask(item)} projects={projects} />
                  )}
                  {unscheduledTasks.length > 0 && <hr className="unscheduled-separator" />}
                  {unscheduledTasks.map((item, idx) =>
                    <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={true} isPastDate={isPastDate} onClick={() => !isPastDate && setPopupTask(item)} projects={projects} />
                  )}
                </>;
              })()
            )}
          </>
        ) : (
          <>
            {planItems.length === 0 && <div className="no-items-message">No planned tasks</div>}
            {planItems.map((item, idx) => <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isPastDate={isPastDate} onClick={() => !isPastDate && setPopupTask(item)} projects={projects} />)}
          </>
        )}
      </div>
      
      <div className="column">
        <div className="column-header">
          <h3>Fact</h3>
          <div className="column-header-actions">
            <span className="fact-xp-stats">
              {xpStats.today} XP / {minTarget} XP {minLabel && ` ${minLabel}`}
            </span>
          </div>
        </div>
        {factCards.length === 0 && <div className="no-items-message">No completed tasks</div>}
        {viewMode === 'overview' ? renderFactColumnOverview() : factCards.map((item) => <TaskCard key={item.id} item={item} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />)}
      </div>
    </div>
  );
}