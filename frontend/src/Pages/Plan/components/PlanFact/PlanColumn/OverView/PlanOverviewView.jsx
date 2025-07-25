import React from 'react';
import TaskCard from 'src/Pages/Plan/components/PlanFact/renderers/TaskCard.jsx';
import GapCard from 'src/Pages/Plan/components/PlanFact/renderers/GapCard.jsx';

export default function PlanOverviewView({
  scheduledOverview,
  isPastDate,
  setPopupTask,
  viewMode,
  projects,
  runningTaskId
}) {
  const schedulableItems = scheduledOverview.scheduledTasks.filter(item => !item.isUnscheduled);
  const unscheduledTasks = scheduledOverview.scheduledTasks.filter(item => item.isUnscheduled);

  return (
    <>
      {scheduledOverview.scheduledTasks.length === 0 ||
       scheduledOverview.scheduledTasks.every(item => item.type === 'gap') ? (
        scheduledOverview.scheduledTasks.filter(item => item.type === 'gap').length > 0 ? (
          scheduledOverview.scheduledTasks.filter(item => item.type === 'gap').map((item, idx) => (
            <GapCard
              key={idx}
              minutes={item.minutes}
              viewMode={viewMode}
              startMinutes={item.startMinutes}
              endMinutes={item.endMinutes}
            />
          ))
        ) : (
          <div className="no-items-message">No planned tasks</div>
        )
      ) : (
        <>
          {schedulableItems.map((item, idx) =>
            isPastDate && item.type === 'gap'
              ? null
              : item.type === 'gap'
                ? <GapCard key={idx} minutes={item.minutes} viewMode={viewMode} startMinutes={item.startMinutes} endMinutes={item.endMinutes} />
                : <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={isPastDate} isPastDate={isPastDate} onClick={() => setPopupTask(item)} projects={projects} runningTaskId={runningTaskId} />
          )}
          {unscheduledTasks.length > 0 && <hr className="unscheduled-separator" />}
          {unscheduledTasks.map((item, idx) =>
            <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={true} isPastDate={isPastDate} onClick={() => !isPastDate && setPopupTask(item)} projects={projects} runningTaskId={runningTaskId} />
          )}
        </>
      )}
    </>
  );
} 