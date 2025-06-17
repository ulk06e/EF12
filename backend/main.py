from fastapi import FastAPI, Depends, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import enum
import datetime
from utils.xp import calculate_xp

app = FastAPI()

# Allow requests from your frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Day(Base):
    __tablename__ = "days"
    id = Column(String, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    reflection = Column(String, nullable=True)

class TimeTypeEnum(enum.Enum):
    to_goal = "to-goal"
    to_time = "to-time"

class TaskQualityEnum(enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class ColumnLocationEnum(enum.Enum):
    plan = "plan"
    fact = "fact"

class TimeQualityEnum(enum.Enum):
    pure = "pure"
    not_pure = "not-pure"

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    description = Column(String)
    time_type = Column(Enum(TimeTypeEnum), nullable=True)
    task_quality = Column(Enum(TaskQualityEnum), nullable=True)
    estimated_duration = Column(Integer, nullable=True)
    actual_duration = Column(Integer, nullable=True)
    priority = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)
    column_location = Column(Enum(ColumnLocationEnum), nullable=True)
    xp_value = Column(Integer, nullable=True)
    time_quality = Column(Enum(TimeQualityEnum), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"))
    day_id = Column(String, ForeignKey("days.id"))
    completed_time = Column(DateTime, nullable=True)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    current_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=0)
    next_level_xp = Column(Integer, default=100)
    parent_id = Column(String, ForeignKey("projects.id"), nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

# Days endpoints
@app.get("/days")
def get_days(db: Session = Depends(get_db)):
    return db.query(Day).all()

@app.post("/days")
async def create_day(day: dict, db: Session = Depends(get_db)):
    # Parse date string to datetime object if needed
    if isinstance(day.get("date"), str):
        try:
            day["date"] = datetime.datetime.fromisoformat(day["date"])
        except Exception:
            day["date"] = datetime.datetime.utcnow()
    new_day = Day(**day)
    db.add(new_day)
    db.commit()
    db.refresh(new_day)
    return new_day

# Items endpoints
@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    print("DEBUG: Retrieved items from database:", [{"id": item.id, "column_location": item.column_location, "completed": item.completed} for item in items])
    return items

@app.post("/items")
async def create_item(item: dict, db: Session = Depends(get_db)):
    # Parse enums
    if "time_type" in item and item["time_type"]:
        item["time_type"] = TimeTypeEnum(item["time_type"])
    if "task_quality" in item and item["task_quality"]:
        item["task_quality"] = TaskQualityEnum(item["task_quality"])
    if "column_location" in item and item["column_location"]:
        item["column_location"] = ColumnLocationEnum(item["column_location"])
    if "time_quality" in item and item["time_quality"]:
        item["time_quality"] = TimeQualityEnum(item["time_quality"])
    # Remove created_time and completed_time if present
    item.pop("created_time", None)
    item.pop("completed_time", None)
    # Ensure Day exists
    day_id = item.get("day_id")
    if day_id:
        day = db.query(Day).filter(Day.id == day_id).first()
        if not day:
            # Create new Day with id=day_id and date=day_id
            try:
                from datetime import datetime
                day_date = datetime.fromisoformat(day_id)
            except Exception:
                day_date = None
            new_day = Day(id=day_id, date=day_date)
            db.add(new_day)
            db.commit()
    new_item = Item(**item)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.delete("/items/{item_id}")
def delete_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return {"error": "Item not found"}, 404
    db.delete(item)
    db.commit()
    return {"ok": True}

@app.put("/items/{item_id}")
def update_item(item_id: str, item: dict = Body(...), db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        return {"error": "Item not found"}, 404
    
    # Parse completed_time if present
    if "completed_time" in item and item["completed_time"]:
        try:
            db_item.completed_time = datetime.datetime.fromisoformat(item["completed_time"].replace('Z', '+00:00'))
        except Exception as e:
            print("DEBUG: Error parsing completed_time:", e)
            db_item.completed_time = None
    
    # Parse enums if present
    if "time_type" in item and item["time_type"]:
        db_item.time_type = TimeTypeEnum(item["time_type"])
    if "task_quality" in item and item["task_quality"]:
        db_item.task_quality = TaskQualityEnum(item["task_quality"])
    if "column_location" in item and item["column_location"]:
        db_item.column_location = ColumnLocationEnum(item["column_location"])
    if "time_quality" in item and item["time_quality"]:
        db_item.time_quality = TimeQualityEnum(item["time_quality"])
    
    # Update other fields
    for key, value in item.items():
        if key not in ["time_type", "task_quality", "column_location", "time_quality", "completed_time"]:
            setattr(db_item, key, value)
    
    if db_item.completed:
        xp = calculate_xp(
            actual_duration=db_item.actual_duration,
            estimated_duration=db_item.estimated_duration,
            task_quality=db_item.task_quality.value,
            time_quality=db_item.time_quality.value,
            priority=db_item.priority
        )
        db_item.xp_value = xp
        
        # Update project XP and levels
        if db_item.project_id:
            from utils.xp import update_project_xp
            update_project_xp(db_item.project_id, xp, db_item.actual_duration, db)

    db.commit()
    db.refresh(db_item)
    return db_item

# Projects endpoints
@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@app.post("/projects")
def create_project(project: dict, db: Session = Depends(get_db)):
    new_project = Project(**project)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.put("/projects/{project_id}")
def update_project(project_id: str, project: dict = Body(...), db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        return {"error": "Project not found"}, 404
    
    # Update project fields
    for key, value in project.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.post("/cleanup")
def cleanup_database(db: Session = Depends(get_db)):
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    return {"status": "ok", "message": "Database cleaned up"}
