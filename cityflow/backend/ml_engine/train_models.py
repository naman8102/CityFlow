import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_synthetic_dataset(num_samples=8000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Traffic Congestion Inputs
    volumes = np.random.uniform(300, 2800, num_samples) # vph
    capacities = np.random.choice([1200, 1600, 1800, 2200, 2500], num_samples) # vph
    vc_ratios = volumes / capacities
    
    hours_of_day = np.random.randint(0, 24, num_samples)
    is_peak = np.where(((hours_of_day >= 8) & (hours_of_day <= 11)) | ((hours_of_day >= 17) & (hours_of_day <= 21)), 1.0, 0.0)
    
    weather_factors = np.random.choice([1.0, 1.25, 1.35, 1.6], num_samples, p=[0.6, 0.2, 0.1, 0.1])
    active_incidents = np.random.choice([0, 1, 2, 3], num_samples, p=[0.7, 0.2, 0.07, 0.03])
    signal_densities = np.random.uniform(1.0, 5.0, num_samples) # signals per km
    
    free_flow_min = np.random.uniform(5.0, 30.0, num_samples)
    
    # Physics-informed BPR + Noise target generation
    # t = t0 * [1 + 0.15 * (V/C)^4]
    bpr_delay = free_flow_min * 0.15 * np.power(vc_ratios, 4.0)
    weather_delay = bpr_delay * (weather_factors - 1.0) * 0.5
    incident_delay = active_incidents * np.random.uniform(4.0, 9.0, num_samples)
    
    total_delay = bpr_delay + weather_delay + incident_delay + np.random.normal(0, 0.5, num_samples)
    total_delay = np.maximum(0.0, total_delay)
    
    raw_risk = (vc_ratios * 0.45 + is_peak * 0.35 + active_incidents * 0.12) * weather_factors
    congestion_risk_pct = np.clip(raw_risk * 100 + np.random.normal(0, 2, num_samples), 5, 99)
    
    # 2. Logistics Fuel & Carbon Inputs
    route_distance_km = free_flow_min * np.random.uniform(0.6, 0.9, num_samples) # approx speed ~ 40-50 km/h freeflow
    vehicle_tonnage = np.random.uniform(1.5, 25.0, num_samples) # Light commercial to heavy freight
    stop_start_count = np.round(signal_densities * route_distance_km + (total_delay * 0.8)).astype(float)
    
    avg_speed_kmh = np.maximum(5.0, (route_distance_km / np.maximum(0.05, (free_flow_min + total_delay) / 60.0)))
    
    # Fuel Model Targets:
    # Base diesel consumption = 0.12 L/km baseline + tonnage scaling + idling burn + stop-start friction
    rolling_fuel = route_distance_km * (0.12 + vehicle_tonnage * 0.012)
    idle_fuel = (total_delay / 60.0) * (2.4 + vehicle_tonnage * 0.08)
    stop_start_fuel = stop_start_count * (0.04 + vehicle_tonnage * 0.005)
    
    total_fuel_liters = rolling_fuel + idle_fuel + stop_start_fuel + np.random.normal(0, 0.1, num_samples)
    total_fuel_liters = np.maximum(0.5, total_fuel_liters)
    
    carbon_kg = total_fuel_liters * 2.68 # 2.68 kg CO2 / L diesel
    
    # Route Efficiency Index (0 to 100): High speed, low delay, low fuel burn relative to tonnage = high score
    efficiency_raw = 100 - (total_delay * 1.5 + (total_fuel_liters / np.maximum(1.0, route_distance_km)) * 15.0 + (1.0 - np.minimum(1.0, avg_speed_kmh / 50.0)) * 25.0)
    route_efficiency_score = np.clip(efficiency_raw, 10, 98)
    
    df = pd.DataFrame({
        'volume': volumes,
        'capacity': capacities,
        'vc_ratio': vc_ratios,
        'hour_of_day': hours_of_day,
        'is_peak': is_peak,
        'weather_factor': weather_factors,
        'active_incidents': active_incidents,
        'signal_density': signal_densities,
        'free_flow_min': free_flow_min,
        'route_distance_km': route_distance_km,
        'vehicle_tonnage': vehicle_tonnage,
        'stop_start_count': stop_start_count,
        # Targets
        'total_delay': total_delay,
        'congestion_risk_pct': congestion_risk_pct,
        'total_fuel_liters': total_fuel_liters,
        'carbon_kg': carbon_kg,
        'route_efficiency_score': route_efficiency_score
    })
    
    return df

def train_and_save_models(dataset_path=None):
    if dataset_path and os.path.exists(dataset_path):
        print(f"Loading observed mobility dataset from {dataset_path}...")
        observed = pd.read_csv(dataset_path)
        required = {'volume', 'capacity', 'hour_of_day', 'active_incidents', 'free_flow_min',
                    'route_distance_km', 'vehicle_tonnage', 'stop_start_count', 'total_delay',
                    'congestion_risk_pct', 'total_fuel_liters', 'carbon_kg', 'route_efficiency_score'}
        missing = required - set(observed.columns)
        if missing:
            raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")
        observed['vc_ratio'] = observed['volume'] / observed['capacity'].clip(lower=1)
        observed['is_peak'] = (((observed['hour_of_day'] >= 8) & (observed['hour_of_day'] <= 11)) |
                               ((observed['hour_of_day'] >= 17) & (observed['hour_of_day'] <= 21))).astype(float)
        observed['weather_factor'] = observed.get('weather_factor', 1.0)
        observed['signal_density'] = observed.get('signal_density', 2.0)
        df = observed
        dataset_source = 'observed_csv'
    else:
        print("No observed dataset supplied; generating reproducible physics-informed training data...")
        df = generate_synthetic_dataset()
        dataset_source = 'synthetic_physics_informed'
    
    # 1. Congestion Predictor Model
    X_cong = df[['volume', 'capacity', 'vc_ratio', 'hour_of_day', 'is_peak', 'weather_factor', 'active_incidents', 'free_flow_min']]
    y_cong = df[['total_delay', 'congestion_risk_pct']]
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_cong, y_cong, random_state=42, test_size=0.2)
    
    print("Training Congestion Ensemble Regressor (Random Forest / XGBoost)...")
    if HAS_XGBOOST:
        cong_model = MultiOutputRegressor(xgb.XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42))
    else:
        cong_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
        
    cong_model.fit(X_train_c, y_train_c)
    preds_c = cong_model.predict(X_test_c)
    r2_c = r2_score(y_test_c, preds_c, multioutput='variance_weighted')
    print(f"Congestion Model Trained successfully! R^2 Score: {r2_c:.4f}")
    
    # 2. Logistics Fuel & Carbon Model
    X_fuel = df[['route_distance_km', 'free_flow_min', 'total_delay', 'vehicle_tonnage', 'stop_start_count', 'weather_factor', 'is_peak']]
    y_fuel = df[['total_fuel_liters', 'carbon_kg', 'route_efficiency_score']]
    
    X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X_fuel, y_fuel, test_size=0.2, random_state=42)
    
    print("Training Logistics Fuel & Carbon Regressor...")
    fuel_model = RandomForestRegressor(n_estimators=120, max_depth=10, random_state=42)
    fuel_model.fit(X_train_f, y_train_f)
    preds_f = fuel_model.predict(X_test_f)
    r2_f = r2_score(y_test_f, preds_f, multioutput='variance_weighted')
    print(f"Logistics Fuel Model Trained successfully! R^2 Score: {r2_f:.4f}")
    
    # Feature Importances extraction
    feature_names_c = list(X_cong.columns)
    if hasattr(cong_model, 'feature_importances_'):
        importances_c = cong_model.feature_importances_.tolist()
    else:
        # MultiOutputRegressor wrapper
        importances_c = np.mean([est.feature_importances_ for est in cong_model.estimators_], axis=0).tolist()
        
    feature_names_f = list(X_fuel.columns)
    importances_f = fuel_model.feature_importances_.tolist()
    
    metadata = {
        'congestion_features': feature_names_c,
        'congestion_importances': dict(zip(feature_names_c, [round(val, 4) for val in importances_c])),
        'fuel_features': feature_names_f,
        'fuel_importances': dict(zip(feature_names_f, [round(val, 4) for val in importances_f])),
        'r2_score_congestion': round(float(r2_c), 4),
        'r2_score_fuel': round(float(r2_f), 4),
        'algorithm': 'XGBoost MultiOutput + RandomForest Ensembles' if HAS_XGBOOST else 'RandomForest MultiOutput Regressors',
        'dataset_source': dataset_source,
        'training_rows': len(df),
        'training_environment': {
            'scikit_learn': getattr(sklearn, '__version__', '1.8.0'),
            'joblib': getattr(joblib, '__version__', '1.4.2'),
            'numpy': getattr(np, '__version__', '2.2.1'),
            'pandas': getattr(pd, '__version__', '2.2.3')
        }
    }
    
    # Save artifacts
    joblib.dump(cong_model, os.path.join(MODELS_DIR, 'congestion_model.joblib'))
    joblib.dump(fuel_model, os.path.join(MODELS_DIR, 'fuel_model.joblib'))
    joblib.dump(metadata, os.path.join(MODELS_DIR, 'ml_metadata.joblib'))
    
    print(f"Artifacts successfully saved to {MODELS_DIR}")

if __name__ == '__main__':
    train_and_save_models(os.environ.get('CITYFLOW_DATASET'))
