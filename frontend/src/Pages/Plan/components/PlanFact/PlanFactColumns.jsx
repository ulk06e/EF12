import React, { useState, useMemo } from 'react';
import TaskPopup from './Popups/TaskPopup.jsx';
import EditTaskPopup from './Popups/EditTaskPopup.jsx';
import AddTaskPopup from './Popups/AddTaskPopup.jsx';
import TaskTimerPopup from './Popups/TaskTimerPopup.jsx';
import XPBreakdownPopup from './Popups/XPBreakdownPopup.jsx';
import { scheduleTasks } from '../../utils/scheduler.js';
import { getLocalTimeBlocks } from '../../../settings/first3/timespan/localDb';
import './PlanFactColumns.css';
import { formatMinutesToHours, getTodayDateString, formatCompletedTimeForDisplay, getLocalDateObjectFromCompletedTime } from '../../utils/time.js';
import { sortPlanItems } from './utils/planUtils.js';
import { prepareFactCards } from './utils/factUtils.js';
import { getClosestHigherXP } from './utils/xpUtils.js';
import TaskCard from './renderers/TaskCard.jsx';
import GapCard from './renderers/GapCard.jsx';

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

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

  // Use utility for plan items
  const planItems = sortPlanItems(items);
  
  // Attach approximate_start and approximate_end to plan items before scheduling
  const timeBlocks = getLocalTimeBlocks();
  const planItemsWithBlocks = planItems.map(item => {
    if (item.approximate_planned_time && timeBlocks.length > 0) {
      // Handle daily basics - they have time ranges like "13:00 - 16:00"
      if (item.type === 'daily_basic') {
        const timeRange = item.approximate_planned_time;
        const match = timeRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (match) {
          return {
            ...item,
            approximate_start: match[1],
            approximate_end: match[2]
          };
        }
      }
      
      // Handle regular approximate time tasks that use time blocks
      const block = timeBlocks.find(
        b => b.name.trim().toLowerCase() === item.approximate_planned_time.trim().toLowerCase()
      );
      if (block) {
        return {
          ...item,
          approximate_start: block.start,
          approximate_end: block.end
        };
      }
    }
    return item;
  });

  // Use utility for fact cards
  const factCards = prepareFactCards(items);

  // Calculate today's XP and get closest higher comparison
  const todayXP = items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === selectedDay && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);
  
  const closestHigher = getClosestHigherXP(items, selectedDay);

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
    const gapItems = result.scheduledTasks.filter(item => item.type === 'gap');
    const totalGapMinutes = gapItems.reduce((sum, g) => sum + (g.minutes || 0), 0);
    return result;
  }, [planItemsWithBlocks, viewMode, selectedDay]);
  
  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  const handleDuplicateTask = (task) => {
    const { id, completed_time, actual_duration, time_quality, project, ...rest } = task;
    const today = getTodayDateString();
    const taskDate = new Date(task.day_id);
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    
    const newTask = {
      ...rest,
      day_id: taskDate < startOfToday ? today : task.day_id,
    };
    onAddTask(newTask);
  };

  // Render fact column in overview mode with unaccounted time as grey cards (>=15m) and as red text (<15m)
  const renderFactColumnOverview = () => {
    const cards = [];
    for (let i = factCards.length - 1; i >= 0; i--) {
      const item = factCards[i];

      if (item.unaccounted != null && item.unaccounted >= 15) {
        cards.push(
          <GapCard key={`fact-gap-${i}`} minutes={Math.round(item.unaccounted)} viewMode={viewMode} />
        );
      }
      const showUnaccountedInline = item.unaccounted != null && item.unaccounted > 0 && item.unaccounted < 15;
      cards.push(
        <TaskCard key={item.id} item={{ ...item, showUnaccountedInline }} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />
      );
    }
    return cards.reverse();
  };

  return (
    <div className={`columns-container ${viewMode === 'overview' ? 'overview-mode' : ''}`}>
      <TaskPopup 
        open={!!popupTask} 
        onClose={() => setPopupTask(null)} 
        task={popupTask} 
        onDelete={(task) => { onDeleteTask(task.id); setPopupTask(null); }}
        onEdit={(task) => { setEditTask(task); setPopupTask(null); }}
        onStart={(task) => { setTimerTask(task); setPopupTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task); setPopupTask(null); }}
        selectedDay={selectedDay}
      />
      <EditTaskPopup 
        open={!!editTask} 
        onClose={() => setEditTask(null)} 
        task={editTask} 
        onSave={(updatedTask) => { onUpdateTask(updatedTask); setEditTask(null); }}
        onDuplicate={(task) => { handleDuplicateTask(task); setEditTask(null); }}
        projects={projects}
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
                    item.type === 'gap'
                      ? <GapCard key={idx} minutes={item.minutes} viewMode={viewMode} />
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
            <button className="add-button" style={{ cursor: 'default' }}>
              {todayXP} XP{closestHigher ? ` / ${closestHigher.value} XP ${closestHigher.label}` : ''}
            </button>
          </div>
        </div>
        {factCards.length === 0 && <div className="no-items-message">No completed tasks</div>}
        {viewMode === 'overview' ? renderFactColumnOverview() : factCards.map((item) => <TaskCard key={item.id} item={item} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />)}
      </div>
    </div>
  );
}