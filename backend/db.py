from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models import Day, Item, Project, Settings, Habit, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from models.base import Base  # Use the shared Base

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL") or "sqlite:///./app.db"
import os
print(">>> WORKING DIR:", os.getcwd())
print(">>> DB FILE PATH:", os.path.abspath("app.db"))

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 