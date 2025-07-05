from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models import Day, Item, Project, Settings, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from models.base import Base  # Use the shared Base

DATABASE_URL = os.environ.get("DATABASE_URL") or "sqlite:///./app.db"

# Append ?sslmode=require if using PostgreSQL (important for Timeweb)
if DATABASE_URL.startswith("postgresql://") and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # <--- ВАЖНО: перепроверка соединения
    pool_size=5,         # разумное ограничение для Timeweb
    max_overflow=10      # сколько дополнительных соединений разрешено
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
