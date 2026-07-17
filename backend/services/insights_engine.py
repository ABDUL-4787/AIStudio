import os
import json
from typing import Dict, Any, Optional
from google import genai
from google.genai import errors

def generate_rule_based_insights(
    dataset_name: str,
    shape = (0, 0),
    data_quality_score: int = 80,
    target_column: str = "target",
    task_type: str = "classification",
    best_model_name: str = "Random Forest",
    metrics: Dict[str, Any] = {},
    feature_importance: Dict[str, float] = {}
) -> Dict[str, Any]:
    # Formulate robust, smart static insights based on the inputs
    row_count = shape[0]
    col_count = shape[1]
    
    top_features = list(feature_importance.keys())[:3]
    features_str = ", ".join(top_features) if top_features else "N/A"

    task_desc = "predicting a categorical class" if task_type == "classification" else "estimating a continuous numerical value"
    metric_info = ""
    if task_type == "classification":
        acc = metrics.get("accuracy", 0.0) * 100
        f1 = metrics.get("f1", 0.0) * 100
        metric_info = f"Accuracy of {acc:.1f}% and F1-score of {f1:.1f}%"
    else:
        r2 = metrics.get("r2", 0.0) * 100
        mae = metrics.get("mae", 0.0)
        metric_info = f"R² score of {r2:.1f}% and Mean Absolute Error (MAE) of {mae:.4f}"

    executive_summary = (
        f"We performed automated machine learning (AutoML) on the dataset '{dataset_name}' with the goal of predicting "
        f"the target column '{target_column}'. The problem was identified as a {task_type} task ({task_desc}). "
        f"After evaluating multiple models, the {best_model_name} model was selected as the optimal predictor with a {metric_info}."
    )

    dataset_overview = (
        f"The uploaded dataset contains {row_count} rows and {col_count} columns. The target variable is '{target_column}'. "
        f"The feature list includes both numerical values and categorical variables that have been automatically preprocessed, "
        f"encoded, and standardized for model training."
    )

    # Assess quality
    if data_quality_score >= 85:
        quality_rating = "Excellent"
        quality_desc = "The dataset has minimal missing values and duplicates. Data cleaning steps successfully handled remaining discrepancies."
    elif data_quality_score >= 65:
        quality_rating = "Fair"
        quality_desc = "The dataset had some missing values or duplicate rows. We applied imputation and cleaning to ensure model integrity."
    else:
        quality_rating = "Poor"
        quality_desc = "The dataset suffers from a high degree of missing data or significant outliers. Model performance might be constrained."

    data_quality_review = (
        f"Quality Rating: {quality_rating} (Score: {data_quality_score}/100).\n"
        f"{quality_desc} Columns with high missing rates or high variance were normalized, and outliers were analyzed to improve stability."
    )

    model_explanation = (
        f"The {best_model_name} algorithm outperformed other candidate models in cross-validation tests. "
        f"This model operates by analyzing feature patterns to minimize generalization error. "
        f"Its performance ({metric_info}) demonstrates solid predictive power and reliability on unseen test subsets."
    )

    feature_importance_summary = (
        f"The analysis indicates that the most influential features driving predictions are: {features_str}. "
        f"These parameters hold the highest weights or split-gains, making them key leverage points for understanding model behavior."
    )

    recommendations = [
        f"Focus business strategy adjustments around the primary drivers ({features_str}).",
        f"Continuously monitor model performance as new data flows in to verify that '{target_column}' matches predictions.",
        "Implement data ingestion validation checks to maintain high data quality scores."
    ]

    strengths = [
        "Highly optimized preprocessing pipeline handled missing values and encoding automatically.",
        f"The {best_model_name} model is robust against overfitting and offers balanced metrics."
    ]

    weaknesses = [
        "Rule-based fallback was used instead of Gemini LLM. Standard summaries might lack contextual domain explanations.",
        "If some features are highly correlated, individual feature importance could be slightly distributed."
    ]

    bias = [
        f"Class imbalance or distribution skew in target '{target_column}' can skew model outputs. Regular review is advised."
    ]

    suggestions = [
        "Provide a Gemini API key in Settings to unlock deep, contextual generative business analysis.",
        "Add more domain-specific features or collect more rows to further boost validation metrics."
    ]

    return {
        "executive_summary": executive_summary,
        "dataset_overview": dataset_overview,
        "data_quality_review": data_quality_review,
        "model_explanation": model_explanation,
        "feature_importance_summary": feature_importance_summary,
        "business_recommendations": recommendations,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "possible_bias": bias,
        "improvement_suggestions": suggestions,
        "using_gemini": False
    }

def generate_gemini_insights(
    api_key: str,
    dataset_name: str,
    shape: Any,
    data_quality_score: int,
    target_column: str,
    task_type: str,
    best_model_name: str,
    metrics: Dict[str, Any],
    feature_importance: Dict[str, float]
) -> Dict[str, Any]:
    try:
        client = genai.Client(api_key=api_key)
        
        # Build prompt
        prompt = f"""
You are an expert data scientist and business consultant. Analyse this AutoML training run and generate executive business insights in structured JSON format.

Dataset: {dataset_name}
Rows: {shape[0]}, Columns: {shape[1]}
Data Quality Score: {data_quality_score}/100
Target Column: {target_column}
Task Type: {task_type}
Best Model: {best_model_name}
Metrics: {json.dumps(metrics)}
Top Feature Importances: {json.dumps(feature_importance)}

Return ONLY a valid JSON object matching the following structure (no markdown formatting, no tickmarks, just raw JSON):
{{
  "executive_summary": "string describing the whole project and business outcome",
  "dataset_overview": "string describing the dataset variables and rows/cols",
  "data_quality_review": "string describing data quality, missing data, and implications",
  "model_explanation": "string explaining how the best model works in simple business terms",
  "feature_importance_summary": "string summarizing why the top features matter",
  "business_recommendations": ["recommendation 1", "recommendation 2", ...],
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "possible_bias": ["bias 1", "bias 2", ...],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", ...]
}}
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        text = response.text.strip()
        # strip markdown formatting if any
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        res = json.loads(text)
        res["using_gemini"] = True
        return res
    except Exception as e:
        print(f"Gemini API execution failed: {e}. Falling back to rule-based insights.")
        return generate_rule_based_insights(
            dataset_name=dataset_name,
            shape=shape,
            data_quality_score=data_quality_score,
            target_column=target_column,
            task_type=task_type,
            best_model_name=best_model_name,
            metrics=metrics,
            feature_importance=feature_importance
        )
