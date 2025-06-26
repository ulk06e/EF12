from sqlalchemy import Column, String
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSONB
from models.base import Base
import os

# Use JSONB for Postgres, JSON for SQLite
if os.environ.get("DATABASE_URL", "").startswith("postgresql"):
    JSONType = JSONB
else:
    JSONType = SQLiteJSON

class Settings(Base):
    __tablename__ = "settings"
    user_id = Column(String, primary_key=True, default="default")
    time_blocks = Column(JSONType, default=[])
    last_synced = Column(String, nullable=True)  # or DateTime if you prefer
