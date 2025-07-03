from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models.habit import Habit

router = APIRouter(prefix="/habits")

@router.get("")
def get_habits(db: Session = Depends(get_db)):
    habits = db.query(Habit).filter_by(user_id='default').all()
    return [
        {
            "id": h.id,
            "description": h.description,
            "daily_basic": h.daily_basic,
            "approximate_planned_time": h.approximate_planned_time,
            "duration": h.duration,
            "parent_project_id": h.parent_project_id
        }
        for h in habits
    ]

@router.post("")
def create_habit(habit: dict, db: Session = Depends(get_db)):
    new_habit = Habit(
        user_id='default',
        description=habit.get('description'),
        daily_basic=habit.get('daily_basic'),
        approximate_planned_time=habit.get('approximate_planned_time'),
        duration=habit.get('duration'),
        parent_project_id=habit.get('parent_project_id')
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return {
        "id": new_habit.id,
        "description": new_habit.description,
        "daily_basic": new_habit.daily_basic,
        "approximate_planned_time": new_habit.approximate_planned_time,
        "duration": new_habit.duration,
        "parent_project_id": new_habit.parent_project_id
    }

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == 'default').first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"ok": True} 