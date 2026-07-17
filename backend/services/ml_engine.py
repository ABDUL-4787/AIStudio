import pandas as pd
import numpy as np
import time
import json
from typing import Dict, Any, List, Tuple

# Scikit-learn imports
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Regression Models
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb

# Classification Models
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

def detect_task_type(df: pd.DataFrame, target_col: str) -> str:
    series = df[target_col].dropna()
    unique_count = series.nunique()
    
    # If categorical / string / bool, definitely classification
    if not pd.api.types.is_numeric_dtype(series):
        return "classification"
    
    # If float and lots of values, regression
    if pd.api.types.is_float_dtype(series) and unique_count > 10:
        return "regression"
        
    # If integer and has > 10 values, regression. Else classification.
    if unique_count <= 10:
        return "classification"
    else:
        return "regression"

def preprocess_and_split(df: pd.DataFrame, target_col: str, task_type: str) -> Tuple[np.ndarray, np.ndarray, List[str], Any]:
    # Drop rows where target is missing
    df_clean = df.dropna(subset=[target_col]).copy()
    
    X = df_clean.drop(columns=[target_col])
    y_raw = df_clean[target_col]

    # Label encode target if classification and categorical
    if task_type == "classification":
        le = LabelEncoder()
        y = le.fit_transform(y_raw.astype(str))
    else:
        y = y_raw.values

    # Columns distinction
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = X.select_dtypes(exclude=[np.number]).columns.tolist()

    # Preprocessors
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ]
    )

    X_processed = preprocessor.fit_transform(X)

    # Get feature names after preprocessing
    feature_names = []
    if len(num_cols) > 0:
        feature_names.extend(num_cols)
    if len(cat_cols) > 0:
        try:
            onehot_features = preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(cat_cols)
            feature_names.extend(list(onehot_features))
        except Exception:
            feature_names.extend([f"cat_{c}" for c in cat_cols])

    return X_processed, y, feature_names, preprocessor

def train_automl(file_path: str, target_col: str) -> Dict[str, Any]:
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    task_type = detect_task_type(df, target_col)
    X_proc, y, feature_names, preprocessor = preprocess_and_split(df, target_col, task_type)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X_proc, y, test_size=0.2, random_state=42)

    leaderboard = []
    trained_models = {}

    if task_type == "regression":
        models_dict = {
            "Linear Regression": LinearRegression(),
            "Decision Tree": DecisionTreeRegressor(random_state=42),
            "Random Forest": RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1),
            "Gradient Boosting": GradientBoostingRegressor(random_state=42),
            "XGBoost": xgb.XGBRegressor(n_estimators=50, max_depth=5, random_state=42, n_jobs=-1)
        }

        from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

        for name, model in models_dict.items():
            start_time = time.time()
            try:
                model.fit(X_train, y_train)
                train_time = round(time.time() - start_time, 3)
                
                y_pred = model.predict(X_test)
                mae = float(mean_absolute_error(y_test, y_pred))
                rmse = float(root_mean_squared_error(y_test, y_pred))
                r2 = float(r2_score(y_test, y_pred))

                # CV score
                cv_scores = cross_val_score(model, X_proc, y, cv=5, scoring='r2')
                cv_mean = float(cv_scores.mean())

                leaderboard.append({
                    "model_name": name,
                    "r2": round(r2, 4),
                    "mae": round(mae, 4),
                    "rmse": round(rmse, 4),
                    "cv_score": round(cv_mean, 4),
                    "training_time": train_time,
                    # Primary metric for sorting is R2
                    "primary_metric": r2
                })
                trained_models[name] = model
            except Exception as e:
                print(f"Failed to train {name}: {e}")

        # Sort leaderboard by R2 descending
        leaderboard = sorted(leaderboard, key=lambda x: x["primary_metric"], reverse=True)
        best_model_name = leaderboard[0]["model_name"] if leaderboard else "N/A"
        best_model = trained_models.get(best_model_name)

    else:
        # Classification
        # Adjust hyperparams for fast run
        models_dict = {
            "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1),
            "Support Vector Machine": SVC(probability=True, random_state=42),
            "KNN": KNeighborsClassifier(),
            "Naive Bayes": GaussianNB(),
            "XGBoost": xgb.XGBClassifier(n_estimators=50, max_depth=5, random_state=42, n_jobs=-1)
        }

        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

        for name, model in models_dict.items():
            start_time = time.time()
            try:
                model.fit(X_train, y_train)
                train_time = round(time.time() - start_time, 3)

                y_pred = model.predict(X_test)
                accuracy = float(accuracy_score(y_test, y_pred))

                # Precision, recall, f1 (weighted to support multi-class)
                precision = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
                recall = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
                f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))

                # ROC AUC
                roc_auc = 0.0
                try:
                    if hasattr(model, "predict_proba"):
                        y_prob = model.predict_proba(X_test)
                        if len(np.unique(y)) == 2:
                            roc_auc = float(roc_auc_score(y_test, y_prob[:, 1]))
                        else:
                            roc_auc = float(roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted'))
                except Exception:
                    pass

                # CV score
                cv_scores = cross_val_score(model, X_proc, y, cv=5, scoring='accuracy')
                cv_mean = float(cv_scores.mean())

                leaderboard.append({
                    "model_name": name,
                    "accuracy": round(accuracy, 4),
                    "precision": round(precision, 4),
                    "recall": round(recall, 4),
                    "f1": round(f1, 4),
                    "roc_auc": round(roc_auc, 4),
                    "cv_score": round(cv_mean, 4),
                    "training_time": train_time,
                    # Primary metric for sorting is Accuracy
                    "primary_metric": accuracy
                })
                trained_models[name] = model
            except Exception as e:
                print(f"Failed to train {name}: {e}")

        # Sort leaderboard by Accuracy descending
        leaderboard = sorted(leaderboard, key=lambda x: x["primary_metric"], reverse=True)
        best_model_name = leaderboard[0]["model_name"] if leaderboard else "N/A"
        best_model = trained_models.get(best_model_name)

    # Feature Importance of best model
    feature_importance = {}
    if best_model is not None:
        try:
            if hasattr(best_model, "feature_importances_"):
                importances = best_model.feature_importances_
                for name, imp in zip(feature_names, importances):
                    feature_importance[name] = float(imp)
            elif hasattr(best_model, "coef_"):
                # Linear models
                importances = np.abs(best_model.coef_[0]) if len(best_model.coef_.shape) > 1 else np.abs(best_model.coef_)
                # Normalize coefs to sum to 1
                coef_sum = importances.sum()
                if coef_sum > 0:
                    importances = importances / coef_sum
                for name, imp in zip(feature_names, importances):
                    feature_importance[name] = float(imp)
        except Exception as e:
            print(f"Failed to compute feature importance: {e}")

    # Fallback if feature importances are empty or fail
    if not feature_importance and len(feature_names) > 0:
        # Equal importance fallback
        val = 1.0 / len(feature_names)
        feature_importance = {name: val for name in feature_names}

    # Sort feature importances
    feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:15])

    # Visualization artifacts for best model
    viz_data = {}
    if best_model is not None:
        try:
            y_pred = best_model.predict(X_test)
            if task_type == "regression":
                # Prediction plot
                viz_data["predictions"] = [
                    {"actual": float(act), "predicted": float(pred)}
                    for act, pred in zip(y_test[:100], y_pred[:100])
                ]
                # Residual plot
                viz_data["residuals"] = [
                    {"predicted": float(pred), "residual": float(act - pred)}
                    for act, pred in zip(y_test[:100], y_pred[:100])
                ]
            else:
                # Confusion matrix
                from sklearn.metrics import confusion_matrix
                cm = confusion_matrix(y_test, y_pred)
                unique_classes = [str(c) for c in np.unique(y_test)]
                cm_list = []
                for i, row in enumerate(cm):
                    for j, val in enumerate(row):
                        cm_list.append({
                            "actual": unique_classes[i],
                            "predicted": unique_classes[j],
                            "value": int(val)
                        })
                    viz_data["confusion_matrix"] = cm_list

                # ROC Curve for binary
                if len(np.unique(y_test)) == 2 and hasattr(best_model, "predict_proba"):
                    from sklearn.metrics import roc_curve
                    y_prob = best_model.predict_proba(X_test)[:, 1]
                    fpr, tpr, thresholds = roc_curve(y_test, y_prob)
                    # Downsample roc curve points for smooth visualization
                    step = max(1, len(fpr) // 30)
                    viz_data["roc_curve"] = [
                        {"fpr": float(f), "tpr": float(t)}
                        for f, t in zip(fpr[::step], tpr[::step])
                    ]
        except Exception as e:
            print(f"Failed to generate visualization data: {e}")

    # Return result dict
    best_model_metrics = leaderboard[0] if leaderboard else {}

    return {
        "task_type": task_type,
        "leaderboard": leaderboard,
        "best_model_name": best_model_name,
        "best_model_metrics": best_model_metrics,
        "feature_importance": feature_importance,
        "visualization_data": viz_data
    }
