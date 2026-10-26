from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import APP_TITLE, APP_VERSION
from .database import init_db
from .api.solver_routes import router as solver_router
from .api.error_routes import router as error_router
from .api.tutor_routes import router as tutor_router
from .api.practice_routes import router as practice_router
from .api.history_routes import router as history_router
from .api.ocr_routes import router as ocr_router

# Initialize SQLite database schema
init_db()

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Smart AI-powered Math Explainer, Step-by-Step Solver, and Multi-Step Error Checker."
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(solver_router)
app.include_router(error_router)
app.include_router(tutor_router)
app.include_router(practice_router)
app.include_router(history_router)
app.include_router(ocr_router)

@app.get("/")
def read_root():
    return {
        "app": APP_TITLE,
        "version": APP_VERSION,
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "/api/solve",
            "/api/check-errors",
            "/api/tutor/chat",
            "/api/practice/questions",
            "/api/dashboard/stats",
            "/api/history",
            "/api/ocr/clean"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "math_explainer_error_checker"}
