from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset, ModelTraining, AppSetting
from backend.services.insights_engine import generate_gemini_insights, generate_rule_based_insights
from backend.services.profiling_engine import run_profiling
import json

router = APIRouter(prefix="/insights", tags=["insights"])

@router.post("/generate")
def generate_insights(
    dataset_id: int = Body(..., embed=True),
    model_id: int = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    model_run = db.query(ModelTraining).filter(ModelTraining.id == model_id).first()
    
    if not dataset or not model_run:
        raise HTTPException(status_code=404, detail="Dataset or model run not found")
        
    # Read Gemini key from settings table
    setting_record = db.query(AppSetting).filter(AppSetting.key == "gemini_api_key").first()
    api_key = setting_record.value if setting_record else None
    
    try:
        # Load profiling info for quality score and shape
        profile_res = run_profiling(dataset.file_path)
        shape = (dataset.row_count, dataset.col_count)
        
        metrics = json.loads(model_run.metrics)
        feature_importance = json.loads(model_run.feature_importance)
        
        if api_key and api_key.strip():
            insights = generate_gemini_insights(
                api_key=api_key,
                dataset_name=dataset.name,
                shape=shape,
                data_quality_score=profile_res["data_quality_score"],
                target_column=model_run.target_column,
                task_type=model_run.task_type,
                best_model_name=model_run.best_model_name,
                metrics=metrics,
                feature_importance=feature_importance
            )
        else:
            insights = generate_rule_based_insights(
                dataset_name=dataset.name,
                shape=shape,
                data_quality_score=profile_res["data_quality_score"],
                target_column=model_run.target_column,
                task_type=model_run.task_type,
                best_model_name=model_run.best_model_name,
                metrics=metrics,
                feature_importance=feature_importance
            )
            
        return insights
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )
