import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProjectColumns from './components/Projects/ProjectColumns'
import WeekSelector from './components/Week/WeekSelector'
import PlanFactColumns from './components/PlanFact/PlanFactColumns'
import Dashboard from './components/Dashboard/Dashboard'

function App() {
  const [health, setHealth] = useState(null)
  const [daysCount, setDaysCount] = useState(null)
  const [itemsCount, setItemsCount] = useState(null)
  const [projectsCount, setProjectsCount] = useState(null)

  // List states
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectIds, setSelectedProjectIds] = useState([null, null, null])
  const [selectedDay, setSelectedDay] = useState(null)

  const API_URL_LOCAL = 'http://localhost:8000'; 
   const API_URL_OUT = 'https://ef12.onrender.com';

  // Fetch all data on mount
  useEffect(() => {
    fetch(`${API_URL_OUT}/health`)
      .then(res => res.json())
      .then(data => setHealth(data.status))
    fetch(`${API_URL_OUT}/days`)
      .then(res => res.json())
      .then(data => {
        setDaysCount(data.length)
        setDays(data)
      })
    fetch(`${API_URL_OUT}/items`)
      .then(res => res.json())
      .then(data => {
        setItemsCount(data.length)
        setItems(data)
      })
    fetch(`${API_URL_OUT}/projects`)
      .then(res => res.json())
      .then(data => {
        setProjectsCount(data.length)
        setProjects(data)
      })
    // Auto-select today's date
    const today = new Date()
    const isoToday = today.toISOString().slice(0, 10)
    setSelectedDay(isoToday)
  }, [])

  // Auto-select top project in first column (and its top children) when projects change
  useEffect(() => {
    if (projects.length > 0) {
      const top1 = projects.find(p => !p.parent_id);
      if (top1) {
        const col2 = projects.filter(p => p.parent_id === top1.id);
        const top2 = col2.length > 0 ? col2[0] : null;
        const col3 = top2 ? projects.filter(p => p.parent_id === top2.id) : [];
        const top3 = col3.length > 0 ? col3[0] : null;
        setSelectedProjectIds([
          top1.id,
          top2 ? top2.id : null,
          top3 ? top3.id : null
        ]);
      }
    }
  }, [projects])

  // Helper: get all descendant project ids for a given project id
  function getDescendantProjectIds(projects, parentId) {
    const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id)
    let all = [...direct]
    for (const id of direct) {
      all = all.concat(getDescendantProjectIds(projects, id))
    }
    return all
  }

  // Auto-selection logic for project columns
  function handleProjectSelect(newSelected) {
    let [sel1, sel2, sel3] = newSelected
    // If selecting in col 1, auto-select top child in col 2 and col 3
    if (sel1 && newSelected[1] === null) {
      const col2 = projects.filter(p => p.parent_id === sel1)
      sel2 = col2.length > 0 ? col2[0].id : null
    }
    if (sel2 && newSelected[2] === null) {
      const col3 = projects.filter(p => p.parent_id === sel2)
      sel3 = col3.length > 0 ? col3[0].id : null
    }
    setSelectedProjectIds([sel1, sel2, sel3])
  }

  // Filter items by selected project (deepest selection) and selected day
  let filteredItems = items
  const lastSelected = selectedProjectIds.slice().reverse().find(id => id)
  
  // Check if selected day is in the past
  const isPastDate = selectedDay ? new Date(selectedDay) < new Date(new Date().setHours(0, 0, 0, 0)) : false
  
  if (lastSelected && !isPastDate) {
    const descendantIds = [lastSelected, ...getDescendantProjectIds(projects, lastSelected)]
    filteredItems = filteredItems.filter(item => descendantIds.includes(item.project_id))
  }
  if (selectedDay) {
    filteredItems = filteredItems.filter(item => (item.day_id || '').slice(0, 10) === selectedDay)
  }

  // Handler to remove or update an item in state
  function handleDeleteItem(id, updatedItem) {
    if (id && !updatedItem) {
      setItems(items => items.filter(item => item.id !== id));
    } else if (updatedItem) {
      setItems(items => {
        const idx = items.findIndex(item => item.id === updatedItem.id);
        if (idx !== -1) {
          const newItems = [...items];
          newItems[idx] = updatedItem;
          return newItems;
        } else {
          return [...items, updatedItem];
        }
      });

      // If the item has a project_id, update the project's XP
      if (updatedItem.project_id) {
        fetch(`${API_URL_OUT}/projects`)
          .then(res => res.json())
          .then(updatedProjects => {
            setProjects(updatedProjects);
          });
      }
    }
  }

  // Handler to add a project to state
  function handleAddProject(project) {
    setProjects(projects => [...projects, project]);
  }

  // Handler to add a task to state
  function handleAddTask(item) {
    setItems(items => [...items, item]);
  }

  return (
    <div>
      <Dashboard items = {items} /> 
      <ProjectColumns 
        projects={projects} 
        setProjects={setProjects}
        selectedProjectIds={selectedProjectIds} 
        onSelect={handleProjectSelect} 
        onAddProject={handleAddProject} 
        onDeleteProject={(id) => {
          setProjects(projects => projects.filter(p => p.id !== id));
        }} 
        items={items}
      />
      <PlanFactColumns 
        items={filteredItems} 
        onDeleteItem={handleDeleteItem} 
        onAddTask={handleAddTask} 
        selectedProjectId={selectedProjectIds.slice().reverse().find(id => id)} 
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
