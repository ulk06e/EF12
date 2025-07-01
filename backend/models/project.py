from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from models.base import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    current_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=0)
    next_level_xp = Column(Integer, default=100)
    parent_id = Column(String, ForeignKey("projects.id"), nullable=True)
    completed = Column(Boolean, default=False) 