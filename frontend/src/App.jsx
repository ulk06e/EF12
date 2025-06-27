import React from 'react'
import { useState } from 'react'
import ProjectColumns from './Pages/Plan/components/Projects/ProjectColumns'
import WeekSelector from './Pages/Plan/components/Week/WeekSelector'
import PlanFactColumns from './Pages/Plan/components/PlanFact/PlanFactColumns'
import Dashboard from './Pages/Plan/components/Dashboard/Dashboard'
import {
  handleAddProject,
  handleUpdateProject,
  handleDeleteProject,
  handleAddTask,
  handleDeleteTask,
  handleUpdateTask,
  handleCompleteTask,
  updateItemsState
} from './Pages/Plan/api'
import useInitialData from './Pages/Plan/hooks/useInitialData'
import { getDescendantProjectIds } from './Pages/Plan/hooks/useProjects'
import { filterItemsByProjectAndDay } from './Pages/Plan/api/items'
import StatisticsPage from './Pages/stat'
import SettingsPage from './Pages/settings'
import { getTodayDateString, toLocalDateString } from './Pages/Plan/utils/time'
import { rescheduleFutureDailyBasics } from './Pages/settings/first3/daily_basics/tapi'

function App() {
  const {
    items,
    setItems,
    projects,
    setProjects,
    selectedProjectIds,
    setSelectedProjectIds,
    loading,
    selectedDay,
    setSelectedDay,
  } = useInitialData();
  const [viewMode, setViewMode] = useState('overview');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getFilteredItems = () => {
    const itemsForDay = items.filter(item => (item.day_id || '').slice(0, 10) === selectedDay);

    if (viewMode === 'target') {
      const lastSelected = selectedProjectIds.slice().reverse().find(id => id);
      if (lastSelected) {
        const descendantIds = [lastSelected, ...getDescendantProjectIds(projects, lastSelected)];
        return itemsForDay.filter(item => descendantIds.includes(item.project_id));
      }
      return []; // In target mode with no project, show nothing
    }
    
    // Overview mode shows all tasks for the day
    return itemsForDay;
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="main-container">
      {showStatistics ? (
        <StatisticsPage onClose={() => setShowStatistics(false)} />
      ) : showSettings ? (
        <SettingsPage onClose={async () => {
          setShowSettings(false);
          setSelectedDay(getTodayDateString());
          await rescheduleFutureDailyBasics();
          window.location.reload();
        }} />
      ) : (
        <>
          <div className="columns-container">
            <div className="column sticky-column">
              <div className="header-actions">
                <button className="menu-button">Menu</button>
                <span></span>
              </div>
            </div>
          </div>
          <Dashboard items={items} selectedDay={selectedDay} onDetailsClick={() => setShowStatistics(true)} onSettingsClick={() => setShowSettings(true)} />
          <ProjectColumns 
            projects={projects} 
            setProjects={setProjects}
            selectedProjectIds={selectedProjectIds} 
            onSelect={setSelectedProjectIds} 
            onAddProject={(project) => handleAddProject(project, setProjects, selectedProjectIds, setSelectedProjectIds)} 
            onDeleteProject={(projectId) => handleDeleteProject(projectId, projects, setProjects, setSelectedProjectIds, getDescendantProjectIds)}
            onUpdateProject={(updatedProject) => handleUpdateProject(updatedProject, setProjects)}
            items={items}
            selectedDay={selectedDay}
          />
          <PlanFactColumns 
            items={filteredItems} 
            onAddTask={(item) => handleAddTask(item, setItems)}
            onDeleteTask={(taskId) => handleDeleteTask(taskId, setItems)}
            onUpdateTask={(updatedTask) => handleUpdateTask(updatedTask, setItems, (data) => updateItemsState(data, setItems), setProjects)}
            onCompleteTask={(updatedTask) => handleCompleteTask(updatedTask, (data) => updateItemsState(data, setItems), setProjects)}
            selectedProjectId={selectedProjectIds.slice().reverse().find(id => id)} 
            selectedProjectIds={selectedProjectIds}
            selectedDay={selectedDay}
            viewMode={viewMode}
            setViewMode={setViewMode}
            projects={projects}
          />
          <WeekSelector 
            selectedDay={selectedDay} 
            onSelect={setSelectedDay} 
            items={items} 
          />
        </>
      )}
    </div>
  )
}

export default App
