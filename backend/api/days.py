from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import Day, get_db
import datetime

router = APIRouter(prefix="/days")

@router.get("")
def get_days(db: Session = Depends(get_db)):
    return db.query(Day).all()

@router.post("")
async def create_day(day: dict, db: Session = Depends(get_db)):
    # Parse date string to datetime object if needed
    if isinstance(day.get("date"), str):
        try:
            day["date"] = datetime.datetime.fromisoformat(day["date"])
        except Exception:
            day["date"] = datetime.datetime.utcnow()
    new_day = Day(**day)
    db.add(new_day)
    db.commit()
    db.refresh(new_day)
    return new_day
