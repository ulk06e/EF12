import React from 'react';
import TaskCard from 'src/Pages/Plan/components/PlanFact/renderers/TaskCard.jsx';

export default function PlanTargetView({
  planItems,
  isPastDate,
  setPopupTask,
  viewMode,
  projects
}) {
  return (
    <>
      {planItems.length === 0 && <div className="no-items-message">No planned tasks</div>}
      {planItems.map((item, idx) => (
        <TaskCard
          key={item.id}
          item={item}
          isPlan={true}
          index={idx}
          viewMode={viewMode}
          isPastDate={isPastDate}
          onClick={() => !isPastDate && setPopupTask(item)}
          projects={projects}
        />
      ))}
    </>
  );
} 