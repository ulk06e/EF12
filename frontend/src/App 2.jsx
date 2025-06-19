import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
  const [itemId, setItemId] = useState("")
  const [itemDesc, setItemDesc] = useState("")
  const [itemDayId, setItemDayId] = useState("")
  const [itemProjectId, setItemProjectId] = useState("")

  // List states
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
  }, [])

  const fetchDays = () => {
    fetch('http://localhost:8000/days')
      .then(res => res.json())
      .then(data => {
        setDaysCount(data.length)
        setDays(data)
      })
  }

  const fetchItems = () => {
    fetch('http://localhost:8000/items')
      .then(res => res.json())
      .then(data => {
        setItemsCount(data.length)
        setItems(data)
      })
  }

  const fetchProjects = () => {
    fetch('http://localhost:8000/projects')
      .then(res => res.json())
      .then(data => {
        setProjectsCount(data.length)
        setProjects(data)
      })
  }

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
      body: JSON.stringify({ id: projectId, name: projectName })
    }).then(() => {
      fetchProjects()
      setProjectId("")
      setProjectName("")
    })
  }

  const createItem = (e) => {
    e.preventDefault()
    fetch('http://localhost:8000/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, description: itemDesc, day_id: itemDayId, project_id: itemProjectId })
    }).then(() => {
      fetchItems()
      setItemId("")
      setItemDesc("")
      setItemDayId("")
      setItemProjectId("")
    })
  }

  return (
    <div>
      <h1>EF12 Dashboard</h1>
      <p>Backend health: {health || "Checking..."}</p>
      <button onClick={fetchDays}>Fetch Days</button>
      <span> Days: {daysCount !== null ? daysCount : "-"}</span>
      <br />
      <button onClick={fetchItems}>Fetch Items</button>
      <span> Items: {itemsCount !== null ? itemsCount : "-"}</span>
      <br />
      <button onClick={fetchProjects}>Fetch Projects</button>
      <span> Projects: {projectsCount !== null ? projectsCount : "-"}</span>
      <hr />
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
        <button type="submit">Add Project</button>
      </form>
      <h2>Create Item</h2>
      <form onSubmit={createItem}>
        <input placeholder="id" value={itemId} onChange={e => setItemId(e.target.value)} required />
        <input placeholder="description" value={itemDesc} onChange={e => setItemDesc(e.target.value)} required />
        <input placeholder="day_id" value={itemDayId} onChange={e => setItemDayId(e.target.value)} required />
        <input placeholder="project_id" value={itemProjectId} onChange={e => setItemProjectId(e.target.value)} required />
        <button type="submit">Add Item</button>
      </form>
      <hr />
      <h2>Days List</h2>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>id</th>
            <th>date</th>
            <th>reflection</th>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day.id}>
              <td>{day.id}</td>
              <td>{day.date}</td>
              <td>{day.reflection}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Projects List</h2>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>current_xp</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>{project.current_xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Items List</h2>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>id</th>
            <th>description</th>
            <th>day_id</th>
            <th>project_id</th>
            <th>completed</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.description}</td>
              <td>{item.day_id}</td>
              <td>{item.project_id}</td>
              <td>{item.completed ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
