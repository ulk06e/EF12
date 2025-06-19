from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import enum
import datetime
import os


SQLALCHEMY_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Day(Base):
    __tablename__ = "days"
    id = Column(String, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)

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