from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import AppSetting
from backend.schemas.schemas import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])

def get_setting_val(key: str, default: str, db: Session) -> str:
    item = db.query(AppSetting).filter(AppSetting.key == key).first()
    if item is not None and item.value is not None:
        return item.value
    return default

def set_setting_val(key: str, val: str, db: Session):
    item = db.query(AppSetting).filter(AppSetting.key == key).first()
    if item is None:
        item = AppSetting(key=key, value=val)
        db.add(item)
    else:
        item.value = val
    db.commit()

@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    gemini_key = get_setting_val("gemini_api_key", "", db)
    comp_name = get_setting_val("company_name", "PredictIQ Enterprise User", db)
    report_title = get_setting_val("default_report_title", "Automated Machine Learning Summary", db)
    
    return {
        "gemini_api_key": gemini_key,
        "company_name": comp_name,
        "default_report_title": report_title
    }

@router.put("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    if payload.gemini_api_key is not None:
        set_setting_val("gemini_api_key", payload.gemini_api_key, db)
    if payload.company_name is not None:
        set_setting_val("company_name", payload.company_name, db)
    if payload.default_report_title is not None:
        set_setting_val("default_report_title", payload.default_report_title, db)
        
    return get_settings(db)
