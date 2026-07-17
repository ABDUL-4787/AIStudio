🚀 PredictIQ Studio – AI-Powered AutoML Business Analytics Platform

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)
![Docker](https://img.shields.io/badge/Docker-Deployed-2496ED)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

An end-to-end AI-powered Machine Learning platform that enables users to upload datasets, automatically analyze data, train ML models, generate business insights using Google Gemini AI, visualize results, and export professional PDF reports.

🌐 Live Demo

Frontend: https://YOUR-VERCEL-URL.vercel.app

Backend API: https://aistudio-1-j3px.onrender.com

API Documentation: https://aistudio-1-j3px.onrender.com/docs

📌 Overview

PredictIQ Studio is a full-stack AutoML platform built to simplify machine learning workflows for analysts, students, and businesses.

Instead of writing Python code manually, users can:

Upload datasets
Analyze data quality
Clean missing values
Automatically train ML models
Compare model performance
Generate AI-powered business insights
Download professional PDF reports

The application provides a complete machine learning workflow through an intuitive web interface.

✨ Features
📂 Dataset Management
Upload CSV datasets
Dataset preview
Dataset download
Dataset history
📊 Data Profiling
Missing value analysis
Data type detection
Statistical summaries
Correlation analysis
🧹 Automated Data Cleaning
Missing value recommendations
Duplicate detection
Automatic preprocessing
Data transformation
🤖 AutoML Engine
Automatic target selection
Classification detection
Regression detection
Multiple model comparison
Model evaluation
📈 Interactive Visualizations
Distribution charts
Correlation heatmaps
Missing value visualization
Model performance charts
💡 AI Business Insights

Powered by Google Gemini AI

Business recommendations
Dataset interpretation
Performance explanation
Decision support
📄 PDF Report Generation

Generate downloadable reports containing:

Dataset summary
Visualizations
Model performance
AI-generated insights
🏗️ System Architecture

                React + Vite
                     │
                     ▼
          FastAPI REST API
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
 PostgreSQL      Gemini AI      ML Engine
 (Neon DB)        API       Scikit-Learn

 
🛠️ Tech Stack
Frontend
React
Vite
Tailwind CSS
Axios
Recharts
Backend
FastAPI
SQLAlchemy
Pandas
NumPy
Scikit-learn
XGBoost
ReportLab
Uvicorn
AI
Google Gemini API
Database
PostgreSQL (Neon)
Deployment
Vercel
Render
Docker
📁 Project Structure
AIStudio/
│
├── backend/
│   ├── routers/
│   ├── models/
│   ├── database/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── uploads/
├── reports_dir/
├── Dockerfile
├── requirements.txt
└── README.md

🚀 Installation

Clone the repository

git clone https://github.com/ABDUL-4787/AIStudio.git
cd AIStudio

Install backend dependencies

pip install -r requirements.txt

Run FastAPI

uvicorn backend.main:app --reload

Install frontend dependencies

cd frontend
npm install
npm run dev
⚙️ Environment Variables

Create a .env file in the project root.

DATABASE_URL=YOUR_POSTGRES_DATABASE_URL
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
VITE_API_URL=YOUR_BACKEND_URL
📖 API Documentation

Swagger UI

https://aistudio-1-j3px.onrender.com/docs

OpenAPI

https://aistudio-1-j3px.onrender.com/openapi.json
📷 Screenshots

Add screenshots of:

Dashboard
Dataset Upload
Data Profiling
AutoML Results
Charts
AI Insights
Report Generation

(GitHub README looks much better with screenshots.)

🔮 Future Enhancements
User Authentication
Model Download
Hyperparameter Optimization
Time Series Forecasting
Deep Learning Support
Cloud Storage Integration
Team Collaboration
Scheduled AutoML Pipelines
🤝 Contributing

Contributions are welcome!

Fork the repository.
Create a feature branch.
Commit your changes.
Open a Pull Request.
