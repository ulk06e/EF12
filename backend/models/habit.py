from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Habit(Base):
    __tablename__ = 'habits'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, default='default')
    description = Column(String, nullable=False)
    daily_basic = Column(String, nullable=True)  # legacy or other use
    daily_basic_location = Column(String, nullable=True)  # 'before' or 'after'
    approximate_planned_time = Column(String, nullable=True)  # e.g. '08:00 - 09:00' or 'morning'
    duration = Column(Integer, nullable=True)         # in minutes
    parent_project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)

    parent_project = relationship('Project', backref='habits') 