from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routers import auth, preferences, meals, groceries, admin

# Buat semua tabel (Idealnya gunakan Alembic untuk production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Food Over Fuss API")

# Konfigurasi CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Penting untuk HttpOnly Cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["preferences"])
app.include_router(meals.router, prefix="/api/meals", tags=["meals"])
app.include_router(groceries.router, prefix="/api/groceries", tags=["groceries"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Food Over Fuss API"}
