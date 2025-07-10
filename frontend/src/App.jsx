import React from 'react'
import { useState, useEffect } from 'react'
import ProjectColumns from './Pages/Plan/components/Projects/ProjectColumns'
import WeekSelector from './Pages/Plan/components/Week/WeekSelector'
import PlanFactColumns from './Pages/Plan/components/PlanFact/PlanFactColumns'
import { API_URL } from 'src/shared/getApiUrl';
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
import { getTodayDateString } from './shared/utils/time'
import autoUpdateService from './services/autoUpdate'
import GoalsColumn from './Pages/Plan/components/Growth/Goals/GoalsColumn'
import ChallengesColumn from './Pages/Plan/components/Growth/Challenges/ChallengesColumn'
import { rescheduleDailyBasics } from './Pages/settings/first3/daily_basics/tapi';
import CongratsPopup from './shared/Bonuses/CongratsPopup.jsx';
import { getBonusById } from './shared/Bonuses/List.js';
import Menu from './Pages/Plan/components/menu/Menu';

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
  const [congratsBonus, setCongratsBonus] = useState(null);

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

  // Refactored showPopup: just set the bonus, don't add XP yet
  const showCongratsPopup = (bonus) => setCongratsBonus(bonus);

  return (
    <div className="main-container">
      {(!showStatistics && !showSettings) && (
        <Menu 
          onShowSettings={() => setShowSettings(true)}
          onShowStatistics={() => setShowStatistics(true)}
          items={items}
          selectedDay={selectedDay}
        />
      )}
      {showStatistics ? (
        <StatisticsPage onClose={() => setShowStatistics(false)} />
      ) : showSettings ? (
        <SettingsPage onClose={async () => {
          setShowSettings(false);
          setSelectedDay(getTodayDateString());
          try {
            // Remove and recreate daily basics for today and the rest of the week
            await rescheduleDailyBasics();
            // Refresh items from the backend to show any updates
            const res = await fetch(`${API_URL}/items`);
            const updatedItems = await res.json();
            setItems(updatedItems);
          } catch (error) {
            console.error('[App] Error refreshing items:', error);
          }
        }} />
      ) : (
        <>
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
            viewMode={viewMode}
          />
          
          <PlanFactColumns 
            items={filteredItems} 
            onAddTask={(item) => handleAddTask(item, setItems)}
            onDeleteTask={(taskId) => handleDeleteTask(taskId, setItems)}
            onUpdateTask={(updatedTask) => handleUpdateTask(updatedTask, setItems, (data) => updateItemsState(data, setItems), setProjects)}
            onCompleteTask={(updatedTask) => handleCompleteTask(
              updatedTask,
              (data) => updateItemsState(data, setItems),
              setProjects,
              items,
              (item) => handleAddTask(item, setItems),
              showCongratsPopup
            )}
            selectedProjectId={selectedProjectIds.slice().reverse().find(id => id)} 
            selectedProjectIds={selectedProjectIds}
            selectedDay={selectedDay}
            viewMode={viewMode}
            setViewMode={setViewMode}
            projects={projects}
          />
          <CongratsPopup open={!!congratsBonus} onClose={() => setCongratsBonus(null)} bonus={congratsBonus} setItems={setItems} />
          
        </>
      )}
    </div>
  )
}

export default App
