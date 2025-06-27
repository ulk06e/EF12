from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import get_db
from models.settings import Settings

router = APIRouter(prefix="/settings")

@router.get("/{user_id}")
def get_settings(user_id: str, db: Session = Depends(get_db)):
    settings = db.query(Settings).filter_by(user_id=user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return {
        "user_id": settings.user_id,
        "time_blocks": settings.time_blocks,
        "routine_tasks": settings.routine_tasks,
        "last_synced": settings.last_synced
    }

@router.post("/{user_id}")
def update_settings(user_id: str, data: dict, db: Session = Depends(get_db)):
    settings = db.query(Settings).filter_by(user_id=user_id).first()
    if not settings:
        settings = Settings(user_id=user_id)
        db.add(settings)
    # Update fields
    if "time_blocks" in data:
        settings.time_blocks = data["time_blocks"]
    if "routine_tasks" in data:
        settings.routine_tasks = data["routine_tasks"]
    if "last_synced" in data:
        settings.last_synced = data["last_synced"]
    db.commit()
    db.refresh(settings)
    return {
        "user_id": settings.user_id,
        "time_blocks": settings.time_blocks,
        "routine_tasks": settings.routine_tasks,
        "last_synced": settings.last_synced
    }