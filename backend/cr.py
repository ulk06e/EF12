# create_tables.py

from db import Base, engine  # импорт Base и engine из твоего файла с конфигом БД


def main():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    main()
