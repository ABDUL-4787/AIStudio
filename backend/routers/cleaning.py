from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database.connection import get_db
from backend.models.models import Dataset
from backend.services.cleaning_engine import get_cleaning_recommendations, apply_cleaning_steps
from backend.schemas.schemas import DatasetResponse
import os
import json

router = APIRouter(prefix="/cleaning", tags=["cleaning"])

@router.get("/{dataset_id}/recommendations")
def get_recommendations(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        recs = get_cleaning_recommendations(dataset.file_path)
        return recs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cleaning recommendations: {str(e)}"
        )

@router.post("/{dataset_id}/apply", response_model=DatasetResponse)
def apply_cleaning(
    dataset_id: int, 
    steps: List[Dict[str, Any]] = Body(...), 
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        save_dir = "uploads"
        clean_path, summary = apply_cleaning_steps(dataset.file_path, steps, save_dir)
        
        # Parse existing cleaning steps and append new logs
        existing_steps = json.loads(dataset.cleaning_steps) if dataset.cleaning_steps else []
        for step in steps:
            existing_steps.append(step.get("title", "Custom Step"))
            
        # Update database dataset record
        dataset.file_path = clean_path
        dataset.row_count = summary["final_shape"][0]
        dataset.col_count = summary["final_shape"][1]
        dataset.size_bytes = int(os.path.getsize(clean_path))
        dataset.cleaning_steps = json.dumps(existing_steps)
        
        db.commit()
        db.refresh(dataset)
        return dataset
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply cleaning steps: {str(e)}"
        )
