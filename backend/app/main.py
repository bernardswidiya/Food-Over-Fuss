from fastapi import FastAPI

app = FastAPI(
    title="Food Over Fuss API",
    description="Backend API untuk AI Menu Planner",
    version="1.0.0",
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "status": "success",
        "message": "Welcome to Food Over Fuss Backend API!",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy", "ai_model": "Not loaded yet"}