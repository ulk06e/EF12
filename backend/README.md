# Days Pace - Task Management Application

A productivity application that helps you manage tasks with XP-based gamification, project hierarchies, and time tracking.

## Features

- **Project Management**: Hierarchical project structure (Areas → Projects → Sub-projects)
- **Task Planning**: Plan tasks with priorities, quality levels, and time estimates
- **Time Tracking**: Built-in timer with pause/resume functionality
- **XP System**: Gamified experience points based on task completion
- **Dashboard**: Real-time statistics and progress tracking
- **Week View**: Calendar-style week selector for date-based task management

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **Uvicorn**: ASGI server

### Frontend
- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **CSS**: Custom styling with modern design

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install Python dependencies:
```bash
pip install -r ../requirements.txt
```

5. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── utils/
│   │   └── xp.py           # XP calculation logic
│   └── test.db             # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard/  # Dashboard component
│   │   │   ├── PlanFact/   # Plan/Fact columns
│   │   │   ├── Projects/   # Project management
│   │   │   └── Week/       # Week selector
│   │   ├── App.jsx         # Main application
│   │   └── main.jsx        # Entry point
│   └── package.json        # Frontend dependencies
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Days
- `GET /days` - Get all days
- `POST /days` - Create a new day

### Items (Tasks)
- `GET /items` - Get all tasks
- `POST /items` - Create a new task
- `PUT /items/{id}` - Update a task
- `DELETE /items/{id}` - Delete a task

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create a new project
- `PUT /projects/{id}` - Update a project
- `DELETE /projects/{id}` - Delete a project

### Statistics
- `GET /statistics` - Get current statistics
- `PUT /statistics` - Update statistics

## Usage

1. **Create Projects**: Use the project columns to create Areas, Projects, and Sub-projects
2. **Plan Tasks**: Select a project and date, then add tasks to the plan column
3. **Track Time**: Click "Start" on a task to begin time tracking
4. **Complete Tasks**: Use the timer to track actual time and complete tasks
5. **Monitor Progress**: View XP gains and statistics in the dashboard

## Development

### Backend Development
- The backend uses FastAPI with automatic API documentation
- Database models are defined in `main.py`
- XP calculation logic is in `utils/xp.py`

### Frontend Development
- React components are organized by feature
- CSS files are co-located with components
- State management uses React hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 