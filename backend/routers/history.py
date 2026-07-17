from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import ModelTraining, Report
from backend.schemas.schemas import HistoryItemResponse
import json

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/list")
def list_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * size
    total_count = db.query(ModelTraining).count()
    runs = db.query(ModelTraining).order_by(ModelTraining.trained_at.desc()).offset(offset).limit(size).all()
    
    items = []
    for run in runs:
        # Load accuracy/R2
        try:
            metrics_dict = json.loads(run.metrics)
            if run.task_type == "classification":
                score = float(metrics_dict.get("accuracy", 0.0))
            else:
                score = float(metrics_dict.get("r2", 0.0))
        except Exception:
            score = 0.0
            
        # Get associated report if any
        report = db.query(Report).filter(Report.model_id == run.id).first()
        report_id = report.id if report else None

        items.append({
            "id": run.id,
            "dataset_name": run.dataset.name if run.dataset else "Deleted Dataset",
            "target_column": run.target_column,
            "task_type": run.task_type,
            "best_model_name": run.best_model_name,
            "accuracy": score,
            "trained_at": run.trained_at,
            "report_id": report_id
        })
        
    return {
        "items": items,
        "total": total_count,
        "page": page,
        "size": size
    }

@router.delete("/{run_id}")
def delete_history_entry(run_id: int, db: Session = Depends(get_db)):
    run = db.query(ModelTraining).filter(ModelTraining.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Training run not found")
        
    db.delete(run)
    db.commit()
    return {"message": "Training run deleted successfully"}
