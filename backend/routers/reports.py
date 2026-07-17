from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Dataset, ModelTraining, Report, AppSetting
from backend.services.report_engine import build_pdf_report
from backend.services.profiling_engine import run_profiling
import os
import json

router = APIRouter(prefix="/reports", tags=["reports"])

REPORTS_DIR = "reports_dir"
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.post("/generate")
def generate_report(
    dataset_id: int = Body(..., embed=True),
    model_id: int = Body(..., embed=True),
    insights_info: dict = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    model_run = db.query(ModelTraining).filter(ModelTraining.id == model_id).first()
    
    if not dataset or not model_run:
        raise HTTPException(status_code=404, detail="Dataset or model run not found")
        
    # Read company name and report title from settings
    comp_record = db.query(AppSetting).filter(AppSetting.key == "company_name").first()
    company_name = comp_record.value if comp_record else "PredictIQ Studio Customer"
    
    title_record = db.query(AppSetting).filter(AppSetting.key == "default_report_title").first()
    report_title = title_record.value if title_record else "Automated Machine Learning Summary"

    # Setup file paths
    pdf_filename = f"report_{os.urandom(8).hex()}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    try:
        # Load dataset profile
        profile = run_profiling(dataset.file_path)
        dataset_info = {
            "name": dataset.name,
            "row_count": dataset.row_count,
            "col_count": dataset.col_count,
            "size_bytes": dataset.size_bytes,
            "data_quality_score": profile["data_quality_score"]
        }
        
        # Load cleaning steps
        cleaning_steps = json.loads(dataset.cleaning_steps) if dataset.cleaning_steps else []
        
        # Load leaderboard
        leaderboard = json.loads(model_run.metrics)
        # Note: model_run.metrics stores the best model metrics, but `/automl/{dataset_id}/train` returns leaderboard.
        # Wait, does ModelTraining model save the whole leaderboard? Let's check `ModelTraining` definition.
        # Yes, `metrics` stores the JSON string of model metrics of the best model, but what about other models?
        # Oh, if we want to show the full leaderboard in the report, we can either re-generate it or pass it.
        # Wait! The endpoint receives insights_info, we can also pass the leaderboard list in the body! Or let's pass a list of models from frontend.
        # Let's make the API accept the leaderboard in the body to be completely flexible, or we can just mock a list from the best model metrics if not provided.
        # Let's check:
        # To be robust, let's accept `leaderboard` optionally in the request body, or default to a single row using best model metrics.
        # Let's parse the request body to see what we have.
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to gather info for report: {str(e)}")

    return {
        "dataset_info": dataset_info,
        "cleaning_steps": cleaning_steps,
        "pdf_path": pdf_path,
        "pdf_filename": pdf_filename
    }

@router.post("/build")
def build_report_pdf(
    dataset_id: int = Body(..., embed=True),
    model_id: int = Body(..., embed=True),
    insights_info: dict = Body(..., embed=True),
    leaderboard: list = Body([], embed=True),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    model_run = db.query(ModelTraining).filter(ModelTraining.id == model_id).first()
    
    if not dataset or not model_run:
        raise HTTPException(status_code=404, detail="Dataset or model run not found")
        
    comp_record = db.query(AppSetting).filter(AppSetting.key == "company_name").first()
    company_name = comp_record.value if (comp_record and comp_record.value) else "PredictIQ Enterprise User"
    
    title_record = db.query(AppSetting).filter(AppSetting.key == "default_report_title").first()
    report_title = title_record.value if (title_record and title_record.value) else f"AutoML Insights: {dataset.name}"

    pdf_filename = f"report_{os.urandom(8).hex()}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    try:
        profile = run_profiling(dataset.file_path)
        dataset_info = {
            "name": dataset.name,
            "row_count": dataset.row_count,
            "col_count": dataset.col_count,
            "size_bytes": dataset.size_bytes,
            "data_quality_score": profile["data_quality_score"]
        }
        
        cleaning_steps = json.loads(dataset.cleaning_steps) if dataset.cleaning_steps else []
        
        best_model_metrics = json.loads(model_run.metrics)
        best_model_info = {
            "best_model_name": model_run.best_model_name,
            "target_column": model_run.target_column,
            "task_type": model_run.task_type
        }
        
        # If leaderboard not passed, create a single item list from best model metrics
        if not leaderboard:
            leaderboard_list = [{
                "model_name": model_run.best_model_name,
                "training_time": best_model_metrics.get("training_time", 0.0),
                "cv_score": best_model_metrics.get("cv_score", 0.0),
                **best_model_metrics
            }]
        else:
            leaderboard_list = leaderboard

        build_pdf_report(
            output_path=pdf_path,
            company_name=company_name,
            report_title=report_title,
            dataset_info=dataset_info,
            cleaning_info=cleaning_steps,
            leaderboard=leaderboard_list,
            best_model_info=best_model_info,
            insights_info=insights_info
        )
        
        # Save to database
        new_report = Report(
            dataset_id=dataset_id,
            model_id=model_id,
            pdf_path=pdf_path
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        return {
            "report_id": new_report.id,
            "pdf_path": pdf_path,
            "pdf_filename": pdf_filename
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.get("/list")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    res = []
    for r in reports:
        res.append({
            "id": r.id,
            "dataset_name": r.dataset.name if r.dataset else "Deleted Dataset",
            "model_name": r.model.best_model_name if r.model else "Deleted Model",
            "target_column": r.model.target_column if r.model else "N/A",
            "created_at": r.created_at,
            "pdf_path": r.pdf_path
        })
    return res

@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
        
    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_path)
    )
