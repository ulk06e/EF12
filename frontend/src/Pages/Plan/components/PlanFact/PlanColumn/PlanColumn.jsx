import React from 'react';
import PlanOverviewView from 'src/Pages/Plan/components/PlanFact/PlanColumn/OverView/PlanOverviewView.jsx';
import PlanTargetView from 'src/Pages/Plan/components/PlanFact/PlanColumn/TargetView/PlanTargetView.jsx';

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
  projects
}) {
  return (
    <div className="column">
      <div className="column-header">
        <h3>Plan</h3>
        <div className="column-header-actions">
          {viewMode === 'overview' && (
            <button
              className="add-button fill-button"
              onClick={() => {/* TODO: Fill action */}}
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