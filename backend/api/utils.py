from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models.base import Base
from models import Day, Item, Project, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from db import engine


router = APIRouter(prefix="/utils")

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/cleanup")
def cleanup_database(db: Session = Depends(get_db)):
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    return {"status": "ok", "message": "Database cleaned up"}
