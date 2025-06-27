from db import engine
from models.settings import Settings
Settings.__table__.drop(engine)
Settings.__table__.create(engine)