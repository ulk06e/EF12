import React from 'react';
import TaskCard from 'src/Pages/Plan/components/PlanFact/renderers/TaskCard.jsx';
import GapCard from 'src/Pages/Plan/components/PlanFact/renderers/GapCard.jsx';

export default function PlanOverviewView({
  scheduledOverview,
  isPastDate,
  setPopupTask,
  viewMode,
  projects
}) {
  const schedulableItems = scheduledOverview.scheduledTasks.filter(item => !item.isUnscheduled);
  const unscheduledTasks = scheduledOverview.scheduledTasks.filter(item => item.isUnscheduled);

  return (
    <>
      {scheduledOverview.scheduledTasks.length === 0 ? (
        <div className="no-items-message">No planned tasks</div>
      ) : (
        <>
          {schedulableItems.map((item, idx) =>
            isPastDate && item.type === 'gap'
              ? null
              : item.type === 'gap'
                ? <GapCard key={idx} minutes={item.minutes} viewMode={viewMode} startMinutes={item.startMinutes} endMinutes={item.endMinutes} />
                : <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={isPastDate} isPastDate={isPastDate} onClick={() => setPopupTask(item)} projects={projects} />
          )}
          {unscheduledTasks.length > 0 && <hr className="unscheduled-separator" />}
          {unscheduledTasks.map((item, idx) =>
            <TaskCard key={item.id} item={item} isPlan={true} index={idx} viewMode={viewMode} isUnscheduled={true} isPastDate={isPastDate} onClick={() => !isPastDate && setPopupTask(item)} projects={projects} />
          )}
        </>
      )}
    </>
  );
} 