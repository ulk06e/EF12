import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProjectColumns from './components/Projects/ProjectColumns'
import WeekSelector from './components/Week/WeekSelector'
import PlanFactColumns from './components/PlanFact/PlanFactColumns'

function App() {
  const [health, setHealth] = useState(null)
  const [daysCount, setDaysCount] = useState(null)
  const [itemsCount, setItemsCount] = useState(null)
  const [projectsCount, setProjectsCount] = useState(null)

  // Form states
  const [dayId, setDayId] = useState("")
  const [dayDate, setDayDate] = useState("")
  const [projectId, setProjectId] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectParentId, setProjectParentId] = useState("")
  const [itemId, setItemId] = useState("")
  const [itemDesc, setItemDesc] = useState("")
  const [itemDayId, setItemDayId] = useState("")
  const [itemProjectId, setItemProjectId] = useState("")
  const [itemTimeType, setItemTimeType] = useState("")
  const [itemTaskQuality, setItemTaskQuality] = useState("")
  const [itemEstimatedDuration, setItemEstimatedDuration] = useState("")
  const [itemActualDuration, setItemActualDuration] = useState("")
  const [itemPriority, setItemPriority] = useState("")
  const [itemColumnLocation, setItemColumnLocation] = useState("")
  const [itemXpValue, setItemXpValue] = useState("")
  const [itemCreatedTime, setItemCreatedTime] = useState("")
  const [itemCompletedTime, setItemCompletedTime] = useState("")
  const [itemTimeQuality, setItemTimeQuality] = useState("")

  // List states
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectIds, setSelectedProjectIds] = useState([null, null, null])
  const [selectedDay, setSelectedDay] = useState(null)

  // Fetch all data on mount
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
    fetch('http://localhost:8000/days')
      .then(res => res.json())
      .then(data => {
        setDaysCount(data.length)
        setDays(data)
      })
    fetch('http://localhost:8000/items')
      .then(res => res.json())
      .then(data => {
        setItemsCount(data.length)
        setItems(data)
      })
    fetch('http://localhost:8000/projects')
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

  // Create handlers
  const createDay = (e) => {
    e.preventDefault()
    fetch('http://localhost:8000/days', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dayId, date: dayDate })
    }).then(() => {
      fetchDays()
      setDayId("")
      setDayDate("")
    })
  }

  const createProject = (e) => {
    e.preventDefault()
    fetch('http://localhost:8000/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: projectName, parent_id: projectParentId || null })
    }).then(() => {
      fetchProjects()
      setProjectId("")
      setProjectName("")
      setProjectParentId("")
    })
  }

  const createItem = (e) => {
    e.preventDefault()
    fetch('http://localhost:8000/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: itemId,
        description: itemDesc,
        time_type: itemTimeType || null,
        task_quality: itemTaskQuality || null,
        estimated_duration: itemEstimatedDuration ? parseInt(itemEstimatedDuration) : null,
        actual_duration: itemActualDuration ? parseInt(itemActualDuration) : null,
        priority: itemPriority ? parseInt(itemPriority) : null,
        completed: false,
        column_location: itemColumnLocation || null,
        xp_value: itemXpValue ? parseInt(itemXpValue) : null,
        time_quality: itemTimeQuality || null,
        project_id: itemProjectId,
        day_id: itemDayId
      })
    }).then(() => {
      fetchItems()
      setItemId("")
      setItemDesc("")
      setItemDayId("")
      setItemTimeType("")
      setItemTaskQuality("")
      setItemEstimatedDuration("")
      setItemActualDuration("")
      setItemPriority("")
      setItemColumnLocation("")
      setItemXpValue("")
      setItemTimeQuality("")
    })
  }

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
  if (lastSelected) {
    const descendantIds = [lastSelected, ...getDescendantProjectIds(projects, lastSelected)]
    filteredItems = filteredItems.filter(item => descendantIds.includes(item.project_id))
  }
  if (selectedDay) {
    filteredItems = filteredItems.filter(item => (item.day_id || '').slice(0, 10) === selectedDay)
  }

  // When selectedProjectIds changes, set itemProjectId to the deepest selected project
  useEffect(() => {
    const lastSelected = selectedProjectIds.slice().reverse().find(id => id)
    if (lastSelected) setItemProjectId(lastSelected)
  }, [selectedProjectIds])

  // When selectedDay changes, set itemDayId to selectedDay
  useEffect(() => {
    if (selectedDay) setItemDayId(selectedDay)
  }, [selectedDay])

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
        fetch('http://localhost:8000/projects')
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
      <ProjectColumns 
        projects={projects} 
        selectedProjectIds={selectedProjectIds} 
        onSelect={handleProjectSelect} 
        onAddProject={handleAddProject} 
        onDeleteProject={(id) => {
          setProjects(projects => projects.filter(p => p.id !== id));
        }} 
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
