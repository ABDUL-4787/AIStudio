import pandas as pd
import numpy as np
import os
from typing import Dict, Any, List, Tuple

def get_cleaning_recommendations(file_path: str) -> List[Dict[str, Any]]:
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    row_count = df.shape[0]
    recommendations = []

    # 1. Duplicates
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        recommendations.append({
            "type": "remove_duplicates",
            "title": "Remove Duplicate Rows",
            "description": f"Found {dup_count} duplicate rows in the dataset.",
            "impact": "Reduces redundancy and prevents overfitting.",
            "suggested": True,
            "params": {}
        })

    # 2. Columns with high missing values
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        null_pct = (null_count / row_count) * 100 if row_count > 0 else 0
        if null_pct > 50:
            recommendations.append({
                "type": "drop_high_missing_column",
                "title": f"Drop High Missing Column: {col}",
                "description": f"Column '{col}' has {round(null_pct, 1)}% missing values ({null_count} rows).",
                "impact": "Keeps dataset dense. Highly sparse columns degrade models.",
                "suggested": True,
                "params": {"column": col}
            })
        elif null_pct > 0:
            suggested_strategy = "mean"
            if pd.api.types.is_numeric_dtype(df[col]):
                # If skewed, suggest median
                skew = df[col].skew()
                if abs(skew) > 1.0 if not pd.isna(skew) else False:
                    suggested_strategy = "median"
            else:
                suggested_strategy = "mode"

            recommendations.append({
                "type": "fill_missing_value",
                "title": f"Impute Missing Values: {col}",
                "description": f"Column '{col}' has {null_count} missing values.",
                "impact": "Ensures no empty cells cause exceptions during training.",
                "suggested": True,
                "params": {"column": col, "strategy": suggested_strategy}
            })

    # 3. Categorical encoding
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    if len(categorical_cols) > 0:
        recommendations.append({
            "type": "encode_categorical",
            "title": "Encode Categorical Columns",
            "description": f"Encode {len(categorical_cols)} text columns: {', '.join(categorical_cols[:3])}{'...' if len(categorical_cols) > 3 else ''}.",
            "impact": "Converts labels/text to numeric features required by ML algorithms.",
            "suggested": True,
            "params": {"columns": categorical_cols, "strategy": "label"}
        })

    # 4. Outliers
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    total_outliers = 0
    for col in numeric_cols:
        q25 = df[col].quantile(0.25)
        q75 = df[col].quantile(0.75)
        iqr = q75 - q25
        lower = q25 - 1.5 * iqr
        upper = q75 + 1.5 * iqr
        outlier_count = int(((df[col] < lower) | (df[col] > upper)).sum())
        total_outliers += outlier_count

    if total_outliers > 0:
        recommendations.append({
            "type": "remove_outliers_iqr",
            "title": "Remove Outliers (IQR Method)",
            "description": f"Detected around {total_outliers} total outlier data points across numerical columns.",
            "impact": "Improves model robustness, especially for linear regressions and SVMs.",
            "suggested": False,
            "params": {"columns": numeric_cols}
        })

    # 5. Scaling
    if len(numeric_cols) > 0:
        recommendations.append({
            "type": "scale_features",
            "title": "Standardize Numeric Features",
            "description": "Scale all numeric values using standard scaling (mean=0, variance=1).",
            "impact": "Essential for distance-based models (KNN, SVM, Logistic Regression).",
            "suggested": False,
            "params": {"columns": numeric_cols, "strategy": "standardize"}
        })

    return recommendations

def apply_cleaning_steps(file_path: str, steps: List[Dict[str, Any]], save_dir: str) -> Tuple[str, Dict[str, Any]]:
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    initial_rows, initial_cols = df.shape
    logs = []

    # Apply steps sequentially
    for step in steps:
        step_type = step.get("type")
        params = step.get("params", {})

        if step_type == "remove_duplicates":
            before = df.shape[0]
            df = df.drop_duplicates()
            after = df.shape[0]
            logs.append(f"Removed {before - after} duplicate rows.")

        elif step_type == "drop_high_missing_column":
            col = params.get("column")
            if col in df.columns:
                df = df.drop(columns=[col])
                logs.append(f"Dropped column '{col}' due to high missing rate.")

        elif step_type == "fill_missing_value":
            col = params.get("column")
            strategy = params.get("strategy", "mean")
            if col in df.columns:
                if strategy == "mean":
                    val = df[col].mean()
                    df[col] = df[col].fillna(val)
                elif strategy == "median":
                    val = df[col].median()
                    df[col] = df[col].fillna(val)
                elif strategy == "mode":
                    val = df[col].mode()
                    val = val.iloc[0] if not val.empty else "Missing"
                    df[col] = df[col].fillna(val)
                elif strategy == "constant":
                    val = params.get("value", 0)
                    df[col] = df[col].fillna(val)
                logs.append(f"Imputed missing values in '{col}' using {strategy}.")

        elif step_type == "encode_categorical":
            cols = params.get("columns", [])
            strategy = params.get("strategy", "label")
            for col in cols:
                if col in df.columns:
                    if strategy == "label":
                        df[col] = df[col].astype('category').cat.codes
                        logs.append(f"Label encoded column '{col}'.")
                    elif strategy == "onehot":
                        df = pd.get_dummies(df, columns=[col], drop_first=True)
                        logs.append(f"One-hot encoded column '{col}'.")

        elif step_type == "remove_outliers_iqr":
            cols = params.get("columns", [])
            if not cols:
                cols = df.select_dtypes(include=[np.number]).columns.tolist()
            
            before = df.shape[0]
            mask = pd.Series(True, index=df.index)
            for col in cols:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    q25 = df[col].quantile(0.25)
                    q75 = df[col].quantile(0.75)
                    iqr = q75 - q25
                    lower = q25 - 1.5 * iqr
                    upper = q75 + 1.5 * iqr
                    mask = mask & (df[col] >= lower) & (df[col] <= upper)
            
            df = df[mask]
            after = df.shape[0]
            logs.append(f"Removed {before - after} rows with outliers using IQR method.")

        elif step_type == "scale_features":
            cols = params.get("columns", [])
            strategy = params.get("strategy", "standardize")
            for col in cols:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    col_min = df[col].min()
                    col_max = df[col].max()
                    col_mean = df[col].mean()
                    col_std = df[col].std()

                    if strategy == "normalize":
                        if col_max - col_min > 0:
                            df[col] = (df[col] - col_min) / (col_max - col_min)
                        logs.append(f"Normalized column '{col}' to range [0, 1].")
                    elif strategy == "standardize":
                        if col_std > 0:
                            df[col] = (df[col] - col_mean) / col_std
                        logs.append(f"Standardized column '{col}' (mean=0, std=1).")

    final_rows, final_cols = df.shape
    
    # Save the cleaned file
    base_name = os.path.basename(file_path)
    clean_name = f"cleaned_{base_name}"
    clean_path = os.path.join(save_dir, clean_name)
    df.to_csv(clean_path, index=False)

    summary = {
        "initial_shape": [initial_rows, initial_cols],
        "final_shape": [final_rows, final_cols],
        "rows_removed": initial_rows - final_rows,
        "cols_removed": initial_cols - final_cols,
        "applied_logs": logs
    }

    return clean_path, summary
