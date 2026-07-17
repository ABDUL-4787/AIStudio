from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset
from backend.services.profiling_engine import run_profiling

router = APIRouter(prefix="/profiling", tags=["profiling"])

@router.get("/{dataset_id}")
def get_profile_data(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        profile_res = run_profiling(dataset.file_path)
        return profile_res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate profile: {str(e)}"
        )
