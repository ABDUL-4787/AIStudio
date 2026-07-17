import os
import shutil
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset
from backend.schemas.schemas import DatasetResponse

router = APIRouter(prefix="/datasets", tags=["datasets"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV or Excel file."
        )

    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{os.urandom(8).hex()}_{filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Load file and calculate dimensions
        if ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)

        row_count = int(df.shape[0])
        col_count = int(df.shape[1])
        size_bytes = int(os.path.getsize(file_path))

        new_dataset = Dataset(
            name=filename,
            file_path=file_path,
            row_count=row_count,
            col_count=col_count,
            size_bytes=size_bytes,
            cleaning_steps="[]"
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)
        return new_dataset
    except Exception as e:
        # Cleanup file if parsing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse dataset file: {str(e)}"
        )

@router.get("/list", response_model=list[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Remove file from disk
    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass
            
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}

@router.get("/{dataset_id}/preview")
def get_dataset_preview(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        if dataset.file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(dataset.file_path)
        else:
            df = pd.read_csv(dataset.file_path)
        
        # Replace NaN/inf with None for JSON serialization compatibility
        df_preview = df.head(50).replace({float('nan'): None, float('inf'): None, float('-inf'): None})
        
        return {
            "columns": list(df.columns),
            "dtypes": {col: str(df[col].dtype) for col in df.columns},
            "rows": df_preview.to_dict(orient="records"),
            "total_rows": int(df.shape[0])
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to preview dataset: {str(e)}"
        )

@router.get("/{dataset_id}/download")
def download_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    if not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found on disk")
        
    ext = os.path.splitext(dataset.name)[1].lower()
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if ext == ".xlsx" else "text/csv"
    
    return FileResponse(
        dataset.file_path,
        media_type=media_type,
        filename=dataset.name
    )
