from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from models import Day, Item, Project, TaskQualityEnum, ColumnLocationEnum, TimeQualityEnum
from models.base import Base  # <-- ИСПОЛЬЗУЙ ОБЩИЙ Base

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL") or "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {},
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Теперь это точно создаст все таблицы
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
