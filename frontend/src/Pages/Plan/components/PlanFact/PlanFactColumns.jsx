import React, { useState, useMemo, useEffect } from 'react';
import TaskPopup from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/TaskPopup.jsx';
import EditTaskPopup from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/EditTaskPopup.jsx';
import AddTaskPopup from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/AddTaskPopup.jsx';
import TaskTimerPopup from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/TaskTimerPopup.jsx';
import XPBreakdownPopup from 'src/Pages/Plan/components/PlanFact/FactColumn/FactPopups/XPBreakdownPopup.jsx';
import { scheduleTasks } from 'src/Pages/Plan/components/PlanFact/utils/scheduler.js';
import { getLocalTimeBlocks } from 'src/Pages/settings/first3/timespan/localDb';
import 'src/Pages/Plan/components/PlanFact/PlanFactColumns.css';
import { formatMinutesToHours, getTodayDateString, formatCompletedTimeForDisplay, getLocalDateObjectFromCompletedTime } from 'src/shared/utils/time.js';
import { sortPlanItems } from 'src/Pages/Plan/components/PlanFact/utils/planUtils.js';
import { prepareFactCards } from 'src/Pages/Plan/components/PlanFact/utils/factUtils.js';
import TaskCard from 'src/Pages/Plan/components/PlanFact/renderers/TaskCard.jsx';
import GapCard from 'src/Pages/Plan/components/PlanFact/renderers/GapCard.jsx';
import { getLocalXP, fetchAndCacheLast7DaysXP } from 'src/shared/cache/localDb';
import { getComparisonXP } from 'src/Pages/Plan/components/PlanFact/utils/xpUtils.js';
import { attachTimeBlocks } from 'src/Pages/Plan/components/PlanFact/utils/xpUtils.js';
import PlanOverviewView from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/PlanOverviewView.jsx';
import PlanTargetView from 'src/Pages/Plan/components/PlanFact/PlanColumn/TargetView/PlanTargetView.jsx';
import PlanColumn from 'src/Pages/Plan/components/PlanFact/PlanColumn/PlanColumn.jsx';
import FactColumn from 'src/Pages/Plan/components/PlanFact/FactColumn/FactColumn.jsx';

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
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [xpPopupTaskId, setXpPopupTaskId] = useState(null);
  const [xpData, setXpData] = useState(null);

  // Use utility for plan items
  const planItems = sortPlanItems(items);
  const timeBlocks = getLocalTimeBlocks();
  const planItemsWithBlocks = attachTimeBlocks(planItems, timeBlocks);

  // Use utility for fact cards
  const factCards = prepareFactCards(items);

  // Calculate today's XP and get closest higher comparison
  const todayXP = items
    .filter(item => {
      return (item.day_id || '').slice(0, 10) === selectedDay && item.completed_time;
    })
    .reduce((sum, item) => sum + (item.xp_value || 0), 0);

  useEffect(() => {
    async function ensureXP() {
      let data = await getLocalXP();
      setXpData(data);
    }
    ensureXP();
  }, []);

  // Overview scheduling algorithm
  const scheduledOverview = useMemo(() => {
    const isToday = selectedDay === (new Date()).toISOString().split('T')[0];
    const now = new Date();
    const startTimeMinutes = now.getHours() * 60 + now.getMinutes();
    if (viewMode !== 'overview') {
      return { scheduledTasks: planItemsWithBlocks, errors: [] };
    }
    if (!planItemsWithBlocks || planItemsWithBlocks.length === 0) {
      // No plan items: still run scheduler to get a gap from now to end of day (for today)
      return isToday
        ? scheduleTasks([], startTimeMinutes)
        : scheduleTasks([], 0);
    }
    return isToday
      ? scheduleTasks(planItemsWithBlocks, startTimeMinutes)
      : scheduleTasks(planItemsWithBlocks);
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
        isPastDate={isPastDate}
        viewMode={viewMode}
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
        open={!!timerTask && !timerMinimized} 
        minimized={timerMinimized}
        onMinimize={() => setTimerMinimized(true)}
        onRestore={() => setTimerMinimized(false)}
        onClose={() => { setTimerTask(null); setTimerMinimized(false); }} 
        task={timerTask} 
        onComplete={onCompleteTask}
        onDeleteTask={onDeleteTask}
      />
      <XPBreakdownPopup open={!!xpPopupTaskId} onClose={() => setXpPopupTaskId(null)} taskId={xpPopupTaskId} />
      
      <PlanColumn
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPastDate={isPastDate}
        setAddOpen={setAddOpen}
        selectedProjectId={selectedProjectId}
        selectedProjectIds={selectedProjectIds}
        scheduledOverview={scheduledOverview}
        setPopupTask={setPopupTask}
        planItems={planItems}
        projects={projects}
        onAddTask={onAddTask}
        selectedDay={selectedDay} // Pass selectedDay here
      />
      <FactColumn
        todayXP={todayXP}
        xpData={xpData}
        viewMode={viewMode}
        factCards={factCards}
        setXpPopupTaskId={setXpPopupTaskId}
        projects={projects}
        selectedDay={selectedDay}
      />
    </div>
  );
}