from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset, ModelTraining
from backend.services.profiling_engine import run_profiling
import json

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

@router.get("/{dataset_id}/distribution")
def get_distribution_data(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        profile_res = run_profiling(dataset.file_path)
        return profile_res["distributions"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{dataset_id}/correlation")
def get_correlation_data(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        profile_res = run_profiling(dataset.file_path)
        return profile_res["correlation_matrix"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{dataset_id}/missing")
def get_missing_data(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        profile_res = run_profiling(dataset.file_path)
        # Convert missing values dictionary into a list for recharts
        missing_list = []
        for col, info in profile_res["missing_values"].items():
            missing_list.append({
                "column": col,
                "missing_count": info["count"],
                "missing_percentage": info["percentage"]
            })
        return missing_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/{model_id}/results")
def get_model_results_data(model_id: int, db: Session = Depends(get_db)):
    model_run = db.query(ModelTraining).filter(ModelTraining.id == model_id).first()
    if not model_run:
        raise HTTPException(status_code=404, detail="Model run not found")
    
    try:
        feature_importance = json.loads(model_run.feature_importance)
        feature_importance_list = [
            {"name": k, "value": round(v, 4)}
            for k, v in feature_importance.items()
        ]
        
        # Sort descending
        feature_importance_list = sorted(feature_importance_list, key=lambda x: x["value"], reverse=True)
        
        viz_data = json.loads(model_run.visualization_data) if model_run.visualization_data else {}
        
        return {
            "task_type": model_run.task_type,
            "best_model_name": model_run.best_model_name,
            "feature_importance": feature_importance_list,
            "visualization_data": viz_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
