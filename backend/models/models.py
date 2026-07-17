from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    row_count = Column(Integer, nullable=False)
    col_count = Column(Integer, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    cleaning_steps = Column(Text, default="[]")  # JSON string of list of cleaning operations applied
    created_at = Column(DateTime, default=datetime.utcnow)

    models = relationship("ModelTraining", back_populates="dataset", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="dataset", cascade="all, delete-orphan")

class ModelTraining(Base):
    __tablename__ = "model_trainings"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"))
    target_column = Column(String, nullable=False)
    task_type = Column(String, nullable=False)  # "classification" or "regression"
    best_model_name = Column(String, nullable=False)
    metrics = Column(Text, nullable=False)  # JSON string of model metrics
    feature_importance = Column(Text, nullable=False)  # JSON string of feature importance dict
    visualization_data = Column(Text, nullable=True)  # JSON string of confusion matrix, roc, predictions, residuals
    trained_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="models")
    reports = relationship("Report", back_populates="model", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"))
    model_id = Column(Integer, ForeignKey("model_trainings.id", ondelete="CASCADE"))
    pdf_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="reports")
    model = relationship("ModelTraining", back_populates="reports")
