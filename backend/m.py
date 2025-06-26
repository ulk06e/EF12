from db import SessionLocal
from models.settings import Settings

session = SessionLocal()

# Insert a settings row if it doesn't exist
settings = session.query(Settings).filter_by(user_id="default").first()
if not settings:
    settings = Settings(
        user_id="default",
        time_blocks=[
            {"name": "Main Work", "start": "10:00", "end": "19:00"},
            {"name": "Other Work", "start": "19:00", "end": "24:00"}
        ],
        last_synced=None
    )
    session.add(settings)
    session.commit()
    print("Inserted default settings row.")

# Fetch and print the settings row
settings = session.query(Settings).filter_by(user_id="default").first()
print("Fetched settings row:")
print("user_id:", settings.user_id)
print("time_blocks:", settings.time_blocks)
print("last_synced:", settings.last_synced)

session.close()