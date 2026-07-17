# ⚙️ PredictIQ Studio — Backend API Service

This directory contains the Python FastAPI backend for **PredictIQ Studio**. It manages file uploads, database state, automated machine learning (AutoML) training pipelines, AI insights integration via Gemini, and ReportLab PDF document building.

---

## 🚀 Key Technologies & Libraries

*   **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/) (high performance, asynchronous web framework)
*   **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (fast ASGI web server implementation)
*   **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (SQL toolkit and Object-Relational Mapper)
*   **Machine Learning**: [Scikit-learn](https://scikit-learn.org/) & [XGBoost](https://xgboost.readthedocs.io/)
*   **Data Manipulation**: [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/)
*   **AI Integration**: [Google GenAI SDK](https://github.com/googleapis/google-genai-python) (`google-genai`)
*   **Document Generation**: [ReportLab](https://www.reportlab.com/) (PDF generation library)

---

## 📂 Folder Structure

```text
backend/
├── database/
│   └── connection.py    # Database connection setups and session makers
├── models/
│   └── models.py        # SQLAlchemy database entities (AppSetting, Dataset, ModelTraining, Report)
├── routers/             # FastAPI router modules (routes)
│   ├── auth.py          # User authentication and authorization endpoints
│   ├── datasets.py      # Datasets upload, lists, and metadata retrieval
│   ├── profiling.py     # Data statistics, shapes, type maps, and quality profiling
│   ├── cleaning.py      # Triggering custom data-cleaning pipelines
│   ├── automl.py        # AutoML task detection, training, and leaderboards
│   ├── visualizations.py# Plot/chart configuration endpoints for Recharts
│   ├── insights.py      # Generates Gemini AI or rule-based recommendations
│   ├── reports.py       # Initiating PDF report compilation and downloads
│   ├── history.py       # Activity trails and audit logs
│   └── settings.py      # Configuration values (API keys, company brandings)
├── schemas/
│   └── schemas.py       # Pydantic schemas for data serialization and API requests
├── services/            # Specialized computational engine modules
│   ├── cleaning_engine.py  # Cleans, imputes, scales, and transforms raw DataFrames
│   ├── profiling_engine.py # Computes stats, data quality ratings, and summaries
│   ├── ml_engine.py        # AutoML trainer with classification and regression support
│   ├── insights_engine.py  # Communicates with Google Gemini API / handles fallbacks
│   └── report_engine.py    # Generates printable PDFs using ReportLab layout designs
└── main.py              # Application initialization and CORS configurations
```

---

## ⚡ Development Setup

### 📋 Prerequisites
*   [Python 3.10+](https://www.python.org/downloads/)
*   Virtual environment builder (e.g. `venv` or `virtualenv`)

### 🛠️ Environment Configuration

Create a `.env` file in the root project folder:
```env
# Default fallback is SQLite if omitted
DATABASE_URL=sqlite:///./mlstudio.db

# For PostgreSQL support:
# DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

### 🏃 Running Locally

1.  Create and activate a Python virtual environment:
    ```bash
    python -m venv .venv
    
    # Windows PowerShell
    .venv\Scripts\Activate.ps1
    
    # macOS/Linux
    source .venv/bin/activate
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Run the server:
    ```bash
    # Run from the root directory
    python -m backend.main
    ```

The service will start on **`http://127.0.0.1:8000`**.

---

## 📖 API Documentation

Once the server is running, you can access auto-generated API specifications and test endpoints directly:
*   **Swagger UI**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
*   **ReDoc**: [`http://127.0.0.1:8000/redoc`](http://127.0.0.1:8000/redoc)
