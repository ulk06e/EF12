import { useState } from 'react'
import ProjectColumns from './components/Projects/ProjectColumns'
import WeekSelector from './components/Week/WeekSelector'
import PlanFactColumns from './components/PlanFact/PlanFactColumns'
import Dashboard from './components/Dashboard/Dashboard'
import {
  handleAddProject,
  handleUpdateProject,
  handleDeleteProject,
  handleAddTask,
  handleDeleteTask,
  handleUpdateTask,
  handleCompleteTask,
  updateItemsState
} from './api'
import { useInitialData } from './hooks'
import { getDescendantProjectIds, useAutoSelectProjects } from './hooks/useProjects'
import { filterItemsByProjectAndDay } from './api/items'

function App() {
  // List states
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectIds, setSelectedProjectIds] = useState([null, null, null])
  const [selectedDay, setSelectedDay] = useState(null)

  useInitialData(setItems, setProjects, setSelectedDay)

  useAutoSelectProjects(projects, selectedProjectIds, setSelectedProjectIds)

  const filteredItems = filterItemsByProjectAndDay(items, projects, selectedProjectIds, selectedDay, getDescendantProjectIds)

  return (
    <div>
      <Dashboard items={items} /> 
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
      />
      <WeekSelector 
        selectedDay={selectedDay} 
        onSelect={setSelectedDay} 
        items={items} 
      />
    </div>
  )
}

export default App
