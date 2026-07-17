from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset, ModelTraining
from backend.services.ml_engine import train_automl
from backend.schemas.schemas import ModelTrainingResponse
import json

router = APIRouter(prefix="/automl", tags=["automl"])

@router.get("/{dataset_id}/columns")
def get_columns(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        import pandas as pd
        if dataset.file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(dataset.file_path, nrows=2)
        else:
            df = pd.read_csv(dataset.file_path, nrows=2)
        return list(df.columns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read dataset columns: {str(e)}")

@router.post("/{dataset_id}/train")
def train_model(
    dataset_id: int,
    target_column: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        res = train_automl(dataset.file_path, target_column)
        
        # Save training to history database
        best_model_metrics = res["best_model_metrics"]
        
        new_training = ModelTraining(
            dataset_id=dataset_id,
            target_column=target_column,
            task_type=res["task_type"],
            best_model_name=res["best_model_name"],
            metrics=json.dumps(best_model_metrics),
            feature_importance=json.dumps(res["feature_importance"]),
            visualization_data=json.dumps(res["visualization_data"])
        )
        
        db.add(new_training)
        db.commit()
        db.refresh(new_training)
        
        # Return response including ID, leaderboard, visualization data, and metrics
        return {
            "training_id": new_training.id,
            "task_type": res["task_type"],
            "best_model_name": res["best_model_name"],
            "metrics": best_model_metrics,
            "feature_importance": res["feature_importance"],
            "leaderboard": res["leaderboard"],
            "visualization_data": res["visualization_data"]
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AutoML training failed: {str(e)}"
        )
