import enum
import uuid
from sqlalchemy import Column, String, Integer, Boolean, Enum, ForeignKey, DateTime
from models.base import Base
import datetime

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
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    description = Column(String)
    full_description = Column(String, nullable=True)
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
    parent_id = Column(String, ForeignKey("items.id"), nullable=True)
    completed_time = Column(DateTime, nullable=True)
    created_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False) 
    planned_time = Column(DateTime, nullable=True, default=None)
    approximate_planned_time = Column(String, nullable=True, default=None)
    type = Column(String, nullable=True)
    
    
  