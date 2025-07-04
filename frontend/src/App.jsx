import React from 'react'
import { useState, useEffect } from 'react'
import ProjectColumns from 'src/pages/plan/components/Projects/ProjectColumns'
import WeekSelector from 'src/pages/plan/components/Week/WeekSelector'
import PlanFactColumns from 'src/pages/plan/components/PlanFact/PlanFactColumns'
import { API_URL } from 'src/config/api';
import {
  handleAddProject,
  handleUpdateProject,
  handleDeleteProject,
  handleAddTask,
  handleDeleteTask,
  handleUpdateTask,
  handleCompleteTask,
  updateItemsState
} 
from 'src/pages/plan/api'
import useInitialData from 'src/pages/plan/hooks/useInitialData'
import { getDescendantProjectIds } from 'src/pages/plan/hooks/useProjects'
import StatisticsPage from 'src/pages/stat'
import SettingsPage from 'src/pages/settings'
import { getTodayDateString } from 'src/pages/plan/utils/time'
import autoUpdateService from 'src/services/autoUpdate'
import GoalsColumn from 'src/pages/plan/components/Growth/Goals/GoalsColumn'
import ChallengesColumn from 'src/pages/plan/components/Growth/Challenges/ChallengesColumn'

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

  // Initialize auto-update service on app start
  useEffect(() => {
    autoUpdateService.init();
    
    // Cleanup on unmount
    return () => {
      autoUpdateService.stop();
    };
  }, []);

  const getFilteredItems = () => {
    const itemsForDay = items.filter(item => (item.day_id || '').slice(0, 10) === selectedDay);

    if (viewMode === 'target') {
      const lastSelected = selectedProjectIds.slice().reverse().find(id => id);
      if (lastSelected) {
        const descendantIds = [
          lastSelected,
          ...getDescendantProjectIds(projects, lastSelected)
        ];
        // ← use `items` here instead of `itemsForDay`
        return items.filter(item => descendantIds.includes(item.project_id));
      }
      return []; // no project selected → nothing
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
          // Refresh items from the backend to show any updates
          try {
            const res = await fetch(`${API_URL}/items`);
            const updatedItems = await res.json();
            setItems(updatedItems);
          } catch (error) {
            console.error('[App] Error refreshing items:', error);
          }
        }} />
      ) : (
        <>
          <div className="columns-container">
            <div className="column sticky-column">
              <div className="header-actions">
                <div style={{ flex: 1 }}></div>
                <div className="header-buttons">
                  <button className="settings-button" onClick={() => setShowSettings(true)}>Settings</button>
                  <button className="add-button" onClick={() => setShowStatistics(true)}>Details</button>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="columns-container">
            <GoalsColumn />
            <ChallengesColumn />
          </div> */}
          {viewMode !== 'target' && (
            <WeekSelector 
              selectedDay={selectedDay} 
              onSelect={setSelectedDay} 
              items={items} 
              setItems={setItems}
            />
          )}
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
          
        </>
      )}
    </div>
  )
}

export default App
