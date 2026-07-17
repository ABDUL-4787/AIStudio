import pandas as pd
import numpy as np
import json
from typing import Dict, Any, List

def run_profiling(file_path: str) -> Dict[str, Any]:
    # Check if excel or csv
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    # Basic stats
    row_count = int(df.shape[0])
    col_count = int(df.shape[1])
    memory_usage = int(df.memory_usage(deep=True).sum())
    duplicate_rows = int(df.duplicated().sum())

    # Column info
    columns_info = []
    missing_value_data = {}
    for col in df.columns:
        col_series = df[col]
        missing_count = int(col_series.isnull().sum())
        missing_pct = float(missing_count / row_count) if row_count > 0 else 0.0
        missing_value_data[col] = {
            "count": missing_count,
            "percentage": round(missing_pct * 100, 2)
        }

        unique_count = int(col_series.nunique())
        dtype = str(col_series.dtype)

        # Detect high level category
        if pd.api.types.is_numeric_dtype(col_series):
            general_type = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(col_series):
            general_type = "datetime"
        elif pd.api.types.is_bool_dtype(col_series):
            general_type = "boolean"
        else:
            general_type = "categorical"

        columns_info.append({
            "name": col,
            "data_type": dtype,
            "general_type": general_type,
            "missing_count": missing_count,
            "missing_percentage": round(missing_pct * 100, 2),
            "unique_count": unique_count
        })

    # Descriptive stats
    desc_stats = {}
    numeric_df = df.select_dtypes(include=[np.number])
    categorical_df = df.select_dtypes(exclude=[np.number])

    if not numeric_df.empty:
        stats_desc = numeric_df.describe().to_dict()
        for col, col_stats in stats_desc.items():
            desc_stats[col] = {
                "type": "numeric",
                "mean": float(col_stats["mean"]) if not np.isnan(col_stats["mean"]) else 0,
                "std": float(col_stats["std"]) if not np.isnan(col_stats["std"]) else 0,
                "min": float(col_stats["min"]) if not np.isnan(col_stats["min"]) else 0,
                "q25": float(col_stats["25%"]) if not np.isnan(col_stats["25%"]) else 0,
                "median": float(col_stats["50%"]) if not np.isnan(col_stats["50%"]) else 0,
                "q75": float(col_stats["75%"]) if not np.isnan(col_stats["75%"]) else 0,
                "max": float(col_stats["max"]) if not np.isnan(col_stats["max"]) else 0,
            }

    for col in categorical_df.columns:
        mode_val = df[col].mode()
        top_val = str(mode_val.iloc[0]) if not mode_val.empty else "N/A"
        desc_stats[col] = {
            "type": "categorical",
            "unique": int(df[col].nunique()),
            "top": top_val,
            "freq": int(df[col].value_counts().iloc[0]) if df[col].nunique() > 0 else 0
        }

    # Correlation Matrix
    correlation_matrix = []
    if numeric_df.shape[1] > 1:
        corr_df = numeric_df.corr().fillna(0)
        columns_list = list(corr_df.columns)
        for i, col1 in enumerate(columns_list):
            for col2 in columns_list:
                correlation_matrix.append({
                    "x": col1,
                    "y": col2,
                    "value": round(float(corr_df.loc[col1, col2]), 3)
                })
    else:
        correlation_matrix = []

    # Outlier Detection (using IQR on numeric columns)
    outlier_summary = {}
    total_outliers = 0
    for col in numeric_df.columns:
        q25 = df[col].quantile(0.25)
        q75 = df[col].quantile(0.75)
        iqr = q75 - q25
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        outlier_count = int(((df[col] < lower_bound) | (df[col] > upper_bound)).sum())
        total_outliers += outlier_count
        outlier_summary[col] = {
            "outlier_count": outlier_count,
            "outlier_percentage": round((outlier_count / row_count) * 100, 2) if row_count > 0 else 0.0
        }

    # Data Quality Score
    # Simple formula out of 100:
    # - Deduct based on percentage of missing values: up to 30 points
    # - Deduct based on percentage of duplicate rows: up to 20 points
    # - Deduct based on percentage of outliers: up to 10 points
    # - Deduct if there are columns with 100% missing values: up to 10 points
    # - Deduct if there is no numeric feature: 10 points
    # Max score is 100, min is 0
    missing_pct_sum = sum(v["percentage"] for v in missing_value_data.values()) / col_count if col_count > 0 else 0
    dup_pct = (duplicate_rows / row_count) * 100 if row_count > 0 else 0
    outlier_pct = (total_outliers / (row_count * len(numeric_df.columns))) * 100 if row_count > 0 and len(numeric_df.columns) > 0 else 0

    score = 100
    score -= min(30, missing_pct_sum * 1.5)
    score -= min(20, dup_pct * 2.0)
    score -= min(10, outlier_pct * 1.0)

    # Check for empty columns
    empty_cols = sum(1 for v in missing_value_data.values() if v["percentage"] == 100)
    score -= min(10, empty_cols * 5)

    if numeric_df.empty:
        score -= 10

    data_quality_score = max(0, min(100, int(round(score))))

    # Feature Distributions
    # For every numeric column, return 10 bins. For categorical columns, return top 10 frequencies.
    distributions = {}
    for col in df.columns:
        col_clean = df[col].dropna()
        if col_clean.empty:
            distributions[col] = []
            continue

        if pd.api.types.is_numeric_dtype(df[col]):
            # Get 10 bins
            hist, bin_edges = np.histogram(col_clean, bins=10)
            dist_data = []
            for j in range(len(hist)):
                label = f"{round(bin_edges[j], 2)} - {round(bin_edges[j+1], 2)}"
                dist_data.append({
                    "name": label,
                    "count": int(hist[j])
                })
            distributions[col] = dist_data
        else:
            # Top 10 frequencies
            value_counts = col_clean.value_counts().head(10)
            dist_data = []
            for val, count in value_counts.items():
                dist_data.append({
                    "name": str(val),
                    "count": int(count)
                })
            distributions[col] = dist_data

    return {
        "row_count": row_count,
        "col_count": col_count,
        "memory_usage_bytes": memory_usage,
        "duplicate_rows": duplicate_rows,
        "columns_info": columns_info,
        "descriptive_statistics": desc_stats,
        "correlation_matrix": correlation_matrix,
        "outlier_summary": outlier_summary,
        "data_quality_score": data_quality_score,
        "distributions": distributions,
        "missing_values": missing_value_data
    }
