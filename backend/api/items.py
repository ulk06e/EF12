from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from models import Item, Day, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from db import get_db
import datetime
from utils.xp import calculate_xp

router = APIRouter(prefix="/items")

@router.get("")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items

@router.post("")
async def create_item(item: dict, db: Session = Depends(get_db)):
    # Parse enums
    if "task_quality" in item and item["task_quality"]:
        item["task_quality"] = TaskQualityEnum(item["task_quality"])
    if "column_location" in item and item["column_location"]:
        item["column_location"] = ColumnLocationEnum(item["column_location"])
    if "time_quality" in item and item["time_quality"]:
        item["time_quality"] = TimeQualityEnum(item["time_quality"])
    
    # Remove created_time and completed_time if present
    item.pop("created_time", None)
    item.pop("completed_time", None)
    
    # Handle planned_time - convert time string to datetime if provided
    if "planned_time" in item and item["planned_time"]:
        try:
            # Parse time string like "14:30" to datetime
            time_str = item["planned_time"]
            hour, minute = map(int, time_str.split(':'))
            # Use today's date as base
            today = datetime.datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
            item["planned_time"] = today
        except Exception:
            item["planned_time"] = None
    else:
        item["planned_time"] = None
    
    # Handle approximate_planned_time - store as string
    if "approximate_planned_time" in item and item["approximate_planned_time"]:
        # Keep as string since it's just "morning", "afternoon", etc.
        pass
    else:
        item["approximate_planned_time"] = None
    
    # Ensure Day exists
    day_id = item.get("day_id")
    if day_id:
        day = db.query(Day).filter(Day.id == day_id).first()
        if not day:
            try:
                day_date = datetime.datetime.fromisoformat(day_id)
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

@router.delete("/{item_id}")
def delete_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return {"error": "Item not found"}, 404
    db.delete(item)
    db.commit()
    return {"ok": True}

@router.put("/{item_id}")
def update_item(item_id: str, item: dict = Body(...), db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        return {"error": "Item not found"}, 404
    
    # Parse completed_time if present
    if "completed_time" in item and item["completed_time"]:
        try:
            db_item.completed_time = datetime.datetime.fromisoformat(item["completed_time"].replace('Z', '+00:00'))
        except Exception as e:
            db_item.completed_time = None
    
    # Handle planned_time - convert time string to datetime if provided
    if "planned_time" in item:
        if item["planned_time"]:
            try:
                # Parse time string like "14:30" to datetime
                time_str = item["planned_time"]
                hour, minute = map(int, time_str.split(':'))
                # Use today's date as base
                today = datetime.datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
                db_item.planned_time = today
            except Exception:
                db_item.planned_time = None
        else:
            db_item.planned_time = None
    
    # Handle approximate_planned_time - store as string
    if "approximate_planned_time" in item:
        db_item.approximate_planned_time = item["approximate_planned_time"]
    
    # Parse enums if present
    if "task_quality" in item and item["task_quality"]:
        db_item.task_quality = TaskQualityEnum(item["task_quality"])
    if "column_location" in item and item["column_location"]:
        db_item.column_location = ColumnLocationEnum(item["column_location"])
    if "time_quality" in item and item["time_quality"]:
        db_item.time_quality = TimeQualityEnum(item["time_quality"])
    
    # Update other fields
    for key, value in item.items():
        if key not in ["task_quality", "column_location", "time_quality", "completed_time", "planned_time", "approximate_planned_time"]:
            setattr(db_item, key, value)
    
    if db_item.completed:
        xp = calculate_xp(
            actual_duration=db_item.actual_duration,
            estimated_duration=db_item.estimated_duration,
            task_quality=db_item.task_quality.value,
            time_quality=db_item.time_quality.value,
            priority=db_item.priority
        )
        db_item.xp_value = xp
        
        # Update project XP and levels
        if db_item.project_id:
            from utils.xp import update_project_xp
            update_project_xp(db_item.project_id, xp, db_item.actual_duration, db)

    db.commit()
    db.refresh(db_item)
    return db_item
