import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base
from backend.routers import (
    datasets,
    profiling,
    cleaning,
    automl,
    visualizations,
    insights,
    reports,
    history,
    settings
)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Create uploads and reports directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("reports_dir", exist_ok=True)

app = FastAPI(
    title="PredictIQ Studio API",
    description="Automated Machine Learning & Business Analytics Platform API",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for Vercel/Render deployments compatibility
    allow_credentials=False, # Must be False when allow_origins=["*"] to avoid FastAPI runtime errors
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(datasets.router)
app.include_router(profiling.router)
app.include_router(cleaning.router)
app.include_router(automl.router)
app.include_router(visualizations.router)
app.include_router(insights.router)
app.include_router(reports.router)
app.include_router(history.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "PredictIQ Studio API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
