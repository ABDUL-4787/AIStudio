from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

# Settings Schemas
class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    company_name: Optional[str] = None
    default_report_title: Optional[str] = None

class SettingsResponse(BaseModel):
    gemini_api_key: Optional[str] = None
    company_name: Optional[str] = None
    default_report_title: Optional[str] = None

    class Config:
        from_attributes = True

# Dataset Schemas
class DatasetResponse(BaseModel):
    id: int
    name: str
    row_count: int
    col_count: int
    size_bytes: int
    cleaning_steps: str
    created_at: datetime

    class Config:
        from_attributes = True

# Model Training Schemas
class ModelTrainingResponse(BaseModel):
    id: int
    dataset_id: int
    target_column: str
    task_type: str
    best_model_name: str
    metrics: str  # JSON string
    feature_importance: str  # JSON string
    trained_at: datetime

    class Config:
        from_attributes = True

# History Item Schema
class HistoryItemResponse(BaseModel):
    id: int
    dataset_name: str
    target_column: str
    task_type: str
    best_model_name: str
    accuracy: float  # derived accuracy or R2
    trained_at: datetime
    report_id: Optional[int] = None

    class Config:
        from_attributes = True

# Report Schema
class ReportResponse(BaseModel):
    id: int
    dataset_id: int
    model_id: int
    pdf_path: str
    created_at: datetime

    class Config:
        from_attributes = True
