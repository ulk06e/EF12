from fastapi import APIRouter, Depends
from db import Base, engine, get_db
from sqlalchemy.orm import Session

router = APIRouter()

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
