from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models import Day, Item, Project, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from sqlalchemy.ext.declarative import declarative_base

# ***REMOVED***
***REMOVED***

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 