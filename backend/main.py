from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.projects import router as projects_router
from api.items import router as items_router
from api.days import router as days_router
from api.utils import router as utils_router
from api.settings import router as settings_router

app = FastAPI()

# Allow requests from your frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",         # для локальной разработки
        "https://ef-12.vercel.app"       # для прода
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(items_router)
app.include_router(days_router)
app.include_router(utils_router)
app.include_router(settings_router)
