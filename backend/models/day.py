from sqlalchemy import Column, String, DateTime
import datetime
from models.base import Base

class Day(Base):
    __tablename__ = "days"
    id = Column(String, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow) 