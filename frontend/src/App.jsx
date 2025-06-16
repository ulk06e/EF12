import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProjectColumns from './components/ProjectColumns'
import WeekSelector from './components/WeekSelector'
import PlanFactColumns from './components/PlanFactColumns'

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

  // Handler to remove an item from state when deleted
  function handleDeleteItem(id) {
    setItems(items => items.filter(item => item.id !== id));
  }

  return (
      <div>
 
      <h2>Create Day</h2>
      <form onSubmit={createDay}>
        <input placeholder="id" value={dayId} onChange={e => setDayId(e.target.value)} required />
        <input type="datetime-local" value={dayDate} onChange={e => setDayDate(e.target.value)} required />
        <button type="submit">Add Day</button>
      </form>
      <h2>Create Project</h2>
      <form onSubmit={createProject}>
        <input placeholder="id" value={projectId} onChange={e => setProjectId(e.target.value)} required />
        <input placeholder="name" value={projectName} onChange={e => setProjectName(e.target.value)} required />
        <input placeholder="parent_id (optional)" value={projectParentId} onChange={e => setProjectParentId(e.target.value)} />
        <button type="submit">Add Project</button>
      </form>
      <h2>Create Item</h2>
      <form onSubmit={createItem}>
        <input placeholder="id" value={itemId} onChange={e => setItemId(e.target.value)} required />
        <input placeholder="description" value={itemDesc} onChange={e => setItemDesc(e.target.value)} required />
        <input placeholder="day_id (YYYY-MM-DD)" type="date" value={itemDayId} onChange={e => setItemDayId(e.target.value)} required />
        <input placeholder="project_id" value={itemProjectId} onChange={e => setItemProjectId(e.target.value)} required />
        <select value={itemTimeType} onChange={e => setItemTimeType(e.target.value)}>
          <option value="">time_type</option>
          <option value="to-goal">to-goal</option>
          <option value="to-time">to-time</option>
        </select>
        <select value={itemTaskQuality} onChange={e => setItemTaskQuality(e.target.value)}>
          <option value="">task_quality</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <input placeholder="estimated_duration (min)" type="number" value={itemEstimatedDuration} onChange={e => setItemEstimatedDuration(e.target.value)} />
        <input placeholder="actual_duration (min)" type="number" value={itemActualDuration} onChange={e => setItemActualDuration(e.target.value)} />
        <input placeholder="priority (1-10)" type="number" value={itemPriority} onChange={e => setItemPriority(e.target.value)} />
        <select value={itemColumnLocation} onChange={e => setItemColumnLocation(e.target.value)}>
          <option value="">column_location</option>
          <option value="plan">plan</option>
          <option value="fact">fact</option>
        </select>
        <input placeholder="xp_value" type="number" value={itemXpValue} onChange={e => setItemXpValue(e.target.value)} />
        <select value={itemTimeQuality} onChange={e => setItemTimeQuality(e.target.value)}>
          <option value="">time_quality</option>
          <option value="pure">pure</option>
          <option value="not-pure">not-pure</option>
        </select>
        <button type="submit">Add Item</button>
      </form>
      <hr />
      <h2>Project Hierarchy</h2>
      <ProjectColumns projects={projects} selectedProjectIds={selectedProjectIds} onSelect={handleProjectSelect} />
      <h2>Projects List</h2>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>current_xp</th>
            <th>parent_id</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>{project.current_xp}</td>
              <td>{project.parent_id || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Week Selector</h2>
      <WeekSelector selectedDay={selectedDay} onSelect={setSelectedDay} />
      <h2>Selected Day: {selectedDay || 'None'}</h2>
      <h2>Plan / Fact Columns</h2>
      <PlanFactColumns items={filteredItems} onDeleteItem={handleDeleteItem} />
      <h2>Items List</h2>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>id</th>
            <th>description</th>
            <th>day_id</th>
            <th>project_id</th>
            <th>time_type</th>
            <th>task_quality</th>
            <th>estimated_duration</th>
            <th>actual_duration</th>
            <th>priority</th>
            <th>column_location</th>
            <th>xp_value</th>
            <th>time_quality</th>
            <th>completed</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.description}</td>
              <td>{item.day_id}</td>
              <td>{item.project_id}</td>
              <td>{item.time_type}</td>
              <td>{item.task_quality}</td>
              <td>{item.estimated_duration}</td>
              <td>{item.actual_duration}</td>
              <td>{item.priority}</td>
              <td>{item.column_location}</td>
              <td>{item.xp_value}</td>
              <td>{item.time_quality}</td>
              <td>{item.completed ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  )
}

export default App
