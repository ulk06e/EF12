from db import engine
from models.settings import Settings, Base
Base.metadata.create_all(bind=engine)