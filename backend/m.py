# init_db.py
from db import Base, engine
from models import *  # обязательно

Base.metadata.create_all(bind=engine)
print("✅ DB created at:", engine.url.database)