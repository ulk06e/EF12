from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import enum
import datetime

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

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    current_xp = Column(Integer, default=0)
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
    return db.query(Item).all()

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
