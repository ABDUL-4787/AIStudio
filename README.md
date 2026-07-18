<h1 align="center">📊 PredictIQ Studio</h1>
<p align="center">
  <strong>An AI-powered AutoML & Business Analytics Platform that automates the end-to-end Machine Learning lifecycle.</strong>
</p>

<p align="center">
  <a href="https://github.com/username/PredictIQStudio/stargazers"><img src="https://img.shields.io/github/stars/username/PredictIQStudio?style=for-the-badge&color=yellow" alt="GitHub Stars" /></a>
  <a href="https://github.com/username/PredictIQStudio/network/members"><img src="https://img.shields.io/github/forks/username/PredictIQStudio?style=for-the-badge&color=blue" alt="GitHub Forks" /></a>
  <a href="https://github.com/username/PredictIQStudio/blob/main/LICENSE"><img src="https://img.shields.io/github/license/username/PredictIQStudio?style=for-the-badge&color=green" alt="MIT License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=flat-square&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📖 1. Project Overview

**PredictIQ Studio** is a professional, enterprise-grade, full-stack application designed to make Machine Learning and Advanced Business Analytics accessible to everyone. By providing a clean, responsive, and code-free web interface, users can upload datasets, automatically perform profiling, apply data-cleaning operations, train high-performing ML models through an automated machine learning (AutoML) pipeline, visualize insights, receive AI-driven business recommendations via Google Gemini, and export publication-ready PDF reports.

This is the ultimate workspace for data analysts, business intelligence specialists, and product managers looking to transition raw datasets into model deployment and business intelligence in minutes.

---

## 🌐 2. Live Demo

Experience the platform live on the web:

*   🌐 **Frontend Client**: [ai-studio-beta-ten.vercel.app](ai-studio-beta-ten.vercel.app) 
*   ⚙️ **Backend Service API**: [https://aistudio-1-j3px.onrender.com](https://aistudio-1-j3px.onrender.com) 
*   📄 **Swagger API Documentation**: [https://aistudio-1-j3px.onrender.com/docs](https://aistudio-1-j3px.onrender.com/docs) 

---

## 🌟 3. Features

### 📁 Dataset Management
*   **Multi-Format Ingestion**: Upload `.csv`, `.xlsx`, and `.xls` files seamlessly.
*   **Storage & Metadata**: Automatically extracts dimensions (row/column count), file size, and stores them in a relational database for instant accessibility.

### 🔍 Automated Data Profiling
*   **Data Health Score**: A comprehensive health indicator calculated based on null values, duplicates, and column completeness.
*   **Descriptive Statistics**: Instant generation of means, medians, standard deviations, and range values for all numerical features.
*   **Type Parsing**: Automatically maps and showcases categorical vs. numerical features.

### 🧹 Intelligent Data Cleaning
*   **Feature Dropping**: Select and eliminate irrelevant features or columns from the UI.
*   **Missing Value Imputation**: Impute missing variables dynamically using strategies like Mean, Median, or Custom Constants.
*   **Variable Standardization**: Automatically normalizes numerical variables (Standard Scaling) and encodes categorical factors.
*   **Duplicate Cleanup**: Remove duplicate records to prevent training leakage.

### 🤖 AutoML Pipeline
*   **Auto-Task Detection**: Smart inference determines if your target variable is categorical (Classification) or continuous (Regression).
*   **Dual Engine Evaluation**:
    *   **Regression**: Linear Regression, Decision Trees, Random Forests, Gradient Boosting, XGBoost.
    *   **Classification**: Logistic Regression, Decision Trees, Random Forests, Support Vector Machines (SVM), K-Nearest Neighbors (KNN), Naive Bayes, XGBoost.
*   **Dynamic Leaderboard**: Displays model comparison tables sorted by primary evaluation metrics ($R^2$ or Accuracy) alongside cross-validation scores.

### 📊 Interactive Visualizations
*   **Distribution & Correlation**: Beautiful distribution analysis, correlation matrices, and missing values layouts powered by React Recharts.
*   **Model Performance Curves**: Displays actual vs. predicted curves, residual scatter charts, confusion matrices, and ROC curves dynamically based on the trained model.

### 💡 AI Business Insights (Google Gemini)
*   **GenAI Interpretation**: Translates complex machine learning parameters and metrics into easy-to-understand executive summaries.
*   **Actionable Advice**: Gemini-driven recommendations offering data optimization guidance and business strategies.
*   **Deterministic Fallback**: Automatically activates a local rule-based analytics engine if no API Key is provided.

### 📄 PDF Report Generation
*   **Enterprise Document Layouts**: Generate print-ready PDF reports compiling dataset summary metrics, data-cleaning logs, model leaderboard stats, and AI business recommendations.
*   **Branded Headers**: Configure custom company headers and titles.

### 📜 Experiment History
*   **Audit Trail Logs**: Logs and timestamps all previous model runs and cleaning workflows.
*   **Download Center**: Review and download previously compiled PDF reports directly from the central log.

### ⚙️ Settings Management
*   **Key Storage**: Securely manage your Google Gemini API keys.
*   **Report Brand Customizer**: Edit report titles, header text, and company labels.


---

## 🛠️ 4. Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [React](https://react.dev/) | Component-based modern UI library (v19) |
| | [Vite](https://vite.dev/) | Ultra-fast build tool and local dev server |
| | [Tailwind CSS](https://tailwindcss.com/) | Modern utility-first CSS styling (v4) |
| | [Axios](https://axios-http.com/) | Promise-based HTTP client for API integration |
| | [Recharts](https://recharts.org/) | Declarative React charting framework |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python REST API |
| | [SQLAlchemy](https://www.sqlalchemy.org/) | SQL Toolkit & Object-Relational Mapper (ORM) |
| | [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/) | Data profiling, scaling, and manipulation libraries |
| | [Scikit-learn](https://scikit-learn.org/) | Standard Machine Learning models and evaluations |
| | [XGBoost](https://xgboost.readthedocs.io/) | Advanced Extreme Gradient Boosting framework |
| | [Uvicorn](https://www.uvicorn.org/) | Lightning-fast ASGI server implementation |
| | [ReportLab](https://www.reportlab.com/) | Standard Python PDF layout compilation library |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Cloud-native Serverless PostgreSQL engine |
| **AI Layer** | [Google Gemini API](https://ai.google.dev/) | GenAI SDK for automated analytics summaries |
| **DevOps** | [Docker](https://www.docker.com/) | Platform-agnostic containerization |
| | [Vercel](https://vercel.com/) | Frontend hosting with automated CI/CD |
| | [Render](https://render.com/) | Cloud backend deployment platform |

---

## 🏗️ 5. System Architecture

```mermaid
graph TD
    User([🌐 User Browser]) <--> |React Router / Tailwind| FE[🎨 React Frontend - Vercel]
    FE <--> |JSON API / Axios| BE[⚙️ FastAPI Backend - Render]
    BE <--> |SQLAlchemy ORM| DB[(💾 Neon Serverless PostgreSQL)]
    
    subgraph Compute Engines
        BE --> |Data Processing| Pandas[📊 Pandas / NumPy Engine]
        BE --> |AutoML Pipelines| SKL[🤖 ML Model Engine]
        BE --> |Gemini SDK| Gemini[💡 Google Gemini AI]
        BE --> |ReportLab Generator| PDF[📄 PDF Document Engine]
    end

    SKL --> |Scikit-Learn & XGBoost| Models[LogisticRegression / XGBoost / RF / etc.]
    Gemini --> |AI Recommendations| BE
    PDF --> |Branded Summaries| BE
```

---

## 📂 6. Folder Structure

The application codebase follows a clean separation of concerns between client (frontend) and server (backend):

```text
MLStudio/
├── assets/                 # Global assets & documentation graphics
│   └── banner.png          # Dashboard header banner
├── backend/                # FastAPI backend source files
│   ├── database/
│   │   └── connection.py   # DB configuration, engine creation & session getters
│   ├── models/
│   │   └── models.py       # SQL schemas (AppSetting, Dataset, ModelTraining, Report)
│   ├── routers/            # Endpoint modular controllers
│   │   ├── auth.py         # Login and profile auth management
│   │   ├── automl.py       # Model training triggers & columns retrieval
│   │   ├── cleaning.py     # Custom dataframe cleaning pipelines
│   │   ├── datasets.py     # File ingest and dataset lists
│   │   ├── history.py      # Task lists and auditing routes
│   │   ├── insights.py     # Gemini and rule-based insights
│   │   ├── profiling.py    # Numerical/categorical summary stats
│   │   ├── reports.py      # PDF building and download endpoints
│   │   └── settings.py     # Brand and keys settings updater
│   ├── schemas/
│   │   └── schemas.py      # Pydantic validation validation rules
│   ├── services/           # Platform engines & core computational tasks
│   │   ├── cleaning_engine.py  # Impute, scale, encode, drop logic
│   │   ├── insights_engine.py  # Gemini prompt templates & API connectors
│   │   ├── ml_engine.py        # Algorithm suite training & leaderboards
│   │   ├── profiling_engine.py # Metrics profiling calculations
│   │   └── report_engine.py    # ReportLab layout & styling definitions
│   └── main.py             # FastAPI entrypoint, CORS setup & router mounts
├── frontend/               # React client application code
│   ├── public/             # Static file server directory
│   ├── src/
│   │   ├── components/     # Layout structures and UI building blocks
│   │   │   ├── Layout.jsx  # Page shells and navigation elements
│   │   │   └── UI/         # Reusable inputs, cards, and data loaders
│   │   ├── context/
│   │   │   └── AppContext.jsx # Global states (API URL, active dataset)
│   │   ├── pages/          # Individual page router views
│   │   ├── services/
│   │   │   └── api.js      # Axios client configuration & endpoints map
│   │   ├── App.css         # Custom stylesheet adjustments
│   │   ├── App.jsx         # Routes declarations
│   │   ├── index.css       # Tailwind directives & theme configuration
│   │   └── main.jsx        # App component mounter
│   ├── package.json        # Frontend commands & npm requirements
│   └── vite.config.js      # Vite build configurations
├── Dockerfile              # Docker image multi-stage builder instructions
├── requirements.txt        # Backend python libraries list
├── mlstudio.db             # Local SQLite database (SQLite fallback)
└── README.md               # Repository documentation (this file)
```

---

## ⚡ 7. Installation Guide

<details>
  <summary>💻 Click to expand step-by-step local installation instructions</summary>
  <br>

  ### 1️⃣ Clone the Repository
  ```bash
  git clone https://github.com/ABDUL-4787/PredictIQStudio.git
  cd PredictIQStudio
  ```

  ### 2️⃣ Backend Server Installation
  1. Navigate to the backend directory and create a virtual environment:
     ```bash
     cd backend
     python -m venv .venv
     ```
  2. Activate the virtual environment:
     *   **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
     *   **macOS / Linux**: `source .venv/bin/activate`
  3. Install backend dependencies:
     ```bash
     pip install -r ../requirements.txt
     ```
  4. Create a `.env` file in the root directory (see **Environment Variables** section).
  5. Run the FastAPI development server:
     ```bash
     # From root directory
     python -m backend.main
     ```
     The server starts at `http://127.0.0.1:8000`.

  ### 3️⃣ Frontend Client Installation
  1. Open a new terminal session and navigate to the frontend directory:
     ```bash
     cd frontend
     ```
  2. Install node packages:
     ```bash
     npm install
     ```
  3. Run the Vite development server:
     ```bash
     npm run dev
     ```
     The frontend client starts at `http://localhost:5173`.
</details>

---

## 🔑 8. Environment Variables

Create a `.env` file in the project's root folder to configure database links and AI capabilities:

```env
# Database Connection URI (Defaults to SQLite file in root if omitted)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Google Gemini API Credentials (Unlocks AI Insights)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Frontend Environment Variable (Place in frontend/.env or pass to build shell)
VITE_API_URL=http://localhost:8000
```

---

## 📄 9. API Documentation

PredictIQ Studio's API is fully documented and interactive out-of-the-box thanks to OpenAPI standard specifications:

*   **Swagger Interactive Docs**: Available at [`http://localhost:8000/docs`](http://localhost:8000/docs) (Allows you to directly query endpoints from your browser).
*   **ReDoc Static Layout**: Available at [`http://localhost:8000/redoc`](http://localhost:8000/redoc).

---

## 🔄 10. Machine Learning Workflow

```text
  [1. Upload Dataset]
           │
           ▼
  [2. Data Profiling]   ──► (Evaluates Nulls, Data Types & Stats)
           │
           ▼
  [3. Data Cleaning]    ──► (Applies custom imputation, drops columns, removes duplicates)
           │
           ▼
  [4. Feature Selection]──► (Identifies continuous vs. categorical fields)
           │
           ▼
  [5. AutoML Training]  ──► (Trains Scikit-Learn & XGBoost models concurrently)
           │
           ▼
  [6. Model Evaluation] ──► (Generates Leaderboards, confusion matrices & ROC curves)
           │
           ▼
  [7. AI Insights]      ──► (Google Gemini processes metrics and summarizes findings)
           │
           ▼
  [8. Report Generation]──► (Compiles results into a downloadable PDF report)
```

---

## 🐳 11. Deployment

*   **Frontend**: Hosted on **Vercel** configured for automated pipeline builds directly connected to the React project directory.
*   **Backend**: Deployed on **Render** utilizing the multi-stage [Dockerfile](file:///c:/Users/Lenovo/Projects/MLStudio/Dockerfile) targeting port `8000`.
*   **Database**: Cloud-native **Neon PostgreSQL** serverless database cluster.

---

## 🏆 12. Project Highlights

*   **Full-Stack AI Orchestration**: Seamless integration of FastAPI, React, and Google GenAI SDK to make data science code-free.
*   **AutoML Execution Engine**: Features cross-validated training workflows running Scikit-Learn and XGBoost dynamically.
*   **Production REST API**: Secure, structured, and performant backend handling file parsing, model caching, and multi-relational SQL configurations.
*   **Responsive Dashboard**: Implements clean user dashboard interfaces using React, Tailwind, and Recharts metrics panels.
*   **Document Generation Pipeline**: Dynamically creates custom, print-ready PDF summaries of user analytics on the fly.

---

## 🚀 13. Future Enhancements

*   🔒 **User Authentication**: Implement JWT-based authentication for user logins.
*   💾 **Model Exports**: Allow users to download trained models in ONNX or Joblib format.
*   🎯 **Hyperparameter Tuning**: Introduce Bayesian Optimization and grid search parameters inside the AutoML UI.
*   📈 **Time-Series Forecasting**: Support automated ARIMA/Prophet models for forecasting datasets.
*   🧠 **Deep Learning Models**: Add PyTorch/TensorFlow integrations for neural network classifiers.
*   👥 **Team Workspaces**: Collaborate on data cleaning and shared model runs.
*   ☁️ **Cloud Storage Integration**: Connect directly to Google Cloud Storage (GCS) or Amazon S3 buckets.
*   ⏱️ **Scheduled Re-training**: Schedule pipeline training on recurring cron tasks.

---

## 🤝 14. Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---


