from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.orm import Session
from models import Item, Day, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from db import get_db
import datetime
from utils.xp import calculate_xp, get_xp_breakdown

router = APIRouter(prefix="/items")

@router.get("")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items

@router.get("/breaks")
def get_breaks(db: Session = Depends(get_db)):
    breaks = db.query(Item).filter(Item.type == "break").all()
    return breaks

@router.post("")
async def create_item(item: dict, db: Session = Depends(get_db)):
    # Handle bonus type: minimal fields, skip XP calculation and project update
    if item.get("type") == "bonus":
        # Ensure required fields
        from uuid import uuid4
        item.setdefault("id", str(uuid4()))
        item["completed"] = True
        item["column_location"] = "fact"
        item.setdefault("completed_time", datetime.datetime.utcnow())
        # Parse completed_time if present and is a string
        if "completed_time" in item and item["completed_time"]:
            if not isinstance(item["completed_time"], datetime.datetime):
                try:
                    item["completed_time"] = datetime.datetime.fromisoformat(str(item["completed_time"]).replace('Z', '+00:00'))
                except Exception:
                    item["completed_time"] = datetime.datetime.utcnow()
        # No project_id, no XP calculation, just store xp_value
        new_item = Item(**item)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
    # Parse enums
    if "task_quality" in item and item["task_quality"]:
        item["task_quality"] = TaskQualityEnum(item["task_quality"])
    if "column_location" in item and item["column_location"]:
        item["column_location"] = ColumnLocationEnum(item["column_location"])
    if "time_quality" in item and item["time_quality"]:
        item["time_quality"] = TimeQualityEnum(item["time_quality"])
    
    # Parse created_time if present and is a string
    if "created_time" in item and item["created_time"]:
        if not isinstance(item["created_time"], datetime.datetime):
            try:
                item["created_time"] = datetime.datetime.fromisoformat(str(item["created_time"]).replace('Z', '+00:00'))
            except Exception:
                item["created_time"] = datetime.datetime.utcnow()
    else:
        item["created_time"] = datetime.datetime.utcnow()
    
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
    
    # If type is daily_basic, force xp_value to 0
    if item.get("type") == "daily_basic":
        item["xp_value"] = 0

    # Handle parent_id
    if "parent_id" not in item:
        item["parent_id"] = None

    new_item = Item(**item)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/bulk")
async def create_items_bulk(items: list = Body(...), db: Session = Depends(get_db)):
    created_items = []
    for item in items:
        # Copy logic from create_item
        if item.get("type") == "bonus":
            from uuid import uuid4
            item.setdefault("id", str(uuid4()))
            item["completed"] = True
            item["column_location"] = "fact"
            item.setdefault("completed_time", datetime.datetime.utcnow())
            if "completed_time" in item and item["completed_time"]:
                if not isinstance(item["completed_time"], datetime.datetime):
                    try:
                        item["completed_time"] = datetime.datetime.fromisoformat(str(item["completed_time"]).replace('Z', '+00:00'))
                    except Exception:
                        item["completed_time"] = datetime.datetime.utcnow()
            new_item = Item(**item)
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            created_items.append(new_item)
            continue
        if "task_quality" in item and item["task_quality"]:
            item["task_quality"] = TaskQualityEnum(item["task_quality"])
        if "column_location" in item and item["column_location"]:
            item["column_location"] = ColumnLocationEnum(item["column_location"])
        if "time_quality" in item and item["time_quality"]:
            item["time_quality"] = TimeQualityEnum(item["time_quality"])
        if "created_time" in item and item["created_time"]:
            if not isinstance(item["created_time"], datetime.datetime):
                try:
                    item["created_time"] = datetime.datetime.fromisoformat(str(item["created_time"]).replace('Z', '+00:00'))
                except Exception:
                    item["created_time"] = datetime.datetime.utcnow()
        else:
            item["created_time"] = datetime.datetime.utcnow()
        if "planned_time" in item and item["planned_time"]:
            try:
                time_str = item["planned_time"]
                hour, minute = map(int, time_str.split(':'))
                today = datetime.datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
                item["planned_time"] = today
            except Exception:
                item["planned_time"] = None
        else:
            item["planned_time"] = None
        if "approximate_planned_time" in item and item["approximate_planned_time"]:
            pass
        else:
            item["approximate_planned_time"] = None
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
        if item.get("type") == "daily_basic":
            item["xp_value"] = 0
        if "parent_id" not in item:
            item["parent_id"] = None
        new_item = Item(**item)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        created_items.append(new_item)
    return created_items

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
    
    # Parse created_time if present and is a string
    if "created_time" in item and item["created_time"]:
        if not isinstance(item["created_time"], datetime.datetime):
            try:
                db_item.created_time = datetime.datetime.fromisoformat(str(item["created_time"]).replace('Z', '+00:00'))
            except Exception:
                db_item.created_time = datetime.datetime.utcnow()
        else:
            db_item.created_time = item["created_time"]
    
    # Parse completed_time if present and is a string
    if "completed_time" in item and item["completed_time"]:
        if not isinstance(item["completed_time"], datetime.datetime):
            try:
                db_item.completed_time = datetime.datetime.fromisoformat(str(item["completed_time"]).replace('Z', '+00:00'))
            except Exception:
                db_item.completed_time = None
        else:
            db_item.completed_time = item["completed_time"]
    
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
    
    # Handle parent_id
    if "parent_id" in item:
        db_item.parent_id = item["parent_id"]
    
    # Update other fields
    for key, value in item.items():
        if key not in ["task_quality", "column_location", "time_quality", "completed_time", "planned_time", "approximate_planned_time"]:
            setattr(db_item, key, value)
    
    # Always ensure db_item.created_time is a datetime object
    if isinstance(db_item.created_time, str):
        try:
            db_item.created_time = datetime.datetime.fromisoformat(db_item.created_time.replace('Z', '+00:00'))
        except Exception:
            db_item.created_time = datetime.datetime.utcnow()
    elif db_item.created_time is None:
        db_item.created_time = datetime.datetime.utcnow()
    
    if db_item.completed:
        if getattr(db_item, "type", None) == "daily_basic":
            db_item.xp_value = 0
        else:
            xp = calculate_xp(
                actual_duration=db_item.actual_duration,
                estimated_duration=db_item.estimated_duration,
                task_quality=db_item.task_quality.value,
                time_quality=db_item.time_quality.value,
                priority=db_item.priority,
                created_time=getattr(db_item, 'created_time', None),
                completed_time=getattr(db_item, 'completed_time', None)
            )
            db_item.xp_value = xp
            # Update project XP and levels
            if db_item.project_id:
                from utils.xp import update_project_xp
                update_project_xp(db_item.project_id, xp, db_item.actual_duration, db)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}/xp_breakdown")
def get_item_xp_breakdown(item_id: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return {"error": "Item not found"}, 404
    breakdown = get_xp_breakdown(item)
    return breakdown

@router.delete("/bulk/daily_basics/future")
def delete_future_daily_basics(db: Session = Depends(get_db)):
    today = datetime.date.today().isoformat()
    deleted = db.query(Item).filter(
        Item.type == 'daily_basic',
        Item.day_id >= today
    ).delete(synchronize_session=False)
    db.commit()
    return {"deleted": deleted}
