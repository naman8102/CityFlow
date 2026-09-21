import os
import warnings
import joblib
import pandas as pd
import numpy as np

# Suppress minor version inconsistency warnings when deserializing cross-patch models
warnings.filterwarnings("ignore", message=".*Trying to unpickle estimator.*")
warnings.filterwarnings("ignore", message=".*Please use save_model.*")
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load trained models & metadata
try:
    congestion_model = joblib.load(os.path.join(MODELS_DIR, 'congestion_model.joblib'))
    fuel_model = joblib.load(os.path.join(MODELS_DIR, 'fuel_model.joblib'))
    ml_metadata = joblib.load(os.path.join(MODELS_DIR, 'ml_metadata.joblib'))
    print("CityFlow AI ML models loaded successfully.")
except Exception as e:
    print(f"Error loading ML models: {e}")
    congestion_model = None
    fuel_model = None
    ml_metadata = {}

app = FastAPI(
    title="CityFlow AI - Machine Learning Engine API",
    description="Microservice for predicting urban traffic congestion, minimizing commercial vehicle fuel consumption, and evaluating freight transportation routes.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---
class CongestionPredictRequest(BaseModel):
    volume: float = Field(..., example=2250, description="Vehicles per hour")
    capacity: float = Field(..., example=1800, description="Nominal road capacity (vph)")
    hourOfDay: float = Field(9.0, example=9.0)
    weatherCondition: str = Field("CLEAR", example="CLEAR") # CLEAR, RAIN, FOG, STORM
    activeIncidents: int = Field(0, example=1)
    freeFlowMinutes: float = Field(8.0, example=8.0)

class FuelPredictRequest(BaseModel):
    routeDistanceKm: float = Field(..., example=14.2)
    freeFlowMinutes: float = Field(..., example=18.0)
    delayMinutes: float = Field(15.0, example=15.0)
    vehicleTonnage: float = Field(7.5, example=7.5) # Metric tons
    weatherCondition: str = Field("CLEAR", example="CLEAR")
    isPeakHour: bool = Field(True, example=True)

class CandidateRoute(BaseModel):
    id: str = Field(..., example="route-arterial")
    name: str = Field(..., example="Arterial Ring Road")
    distanceKm: float = Field(..., example=14.5)
    freeFlowMinutes: float = Field(..., example=16.0)
    currentVolumeVPH: float = Field(2100, example=2100)
    nominalCapacityVPH: float = Field(1800, example=1800)
    activeIncidents: int = Field(0, example=0)

class EvaluateRoutesRequest(BaseModel):
    cargoType: str = Field("Industrial Goods", example="Industrial Goods")
    vehicleTonnage: float = Field(7.5, example=7.5)
    requestedHour: float = Field(9.0, example=9.0)
    weatherCondition: str = Field("CLEAR", example="CLEAR")
    candidateRoutes: List[CandidateRoute]

# --- Helper Utilities ---
def get_weather_multiplier(cond: str) -> float:
    mapping = {'CLEAR': 1.0, 'RAIN': 1.35, 'FOG': 1.25, 'STORM': 1.6}
    return mapping.get(cond.upper(), 1.0)

def determine_los(vc_ratio: float) -> str:
    if vc_ratio > 1.15: return 'F (System Breakdown)'
    if vc_ratio > 0.95: return 'E (Unstable Flow)'
    if vc_ratio > 0.80: return 'D (Approaching Capacity)'
    if vc_ratio > 0.65: return 'C (Stable Flow)'
    if vc_ratio > 0.45: return 'B (Reasonably Free Flow)'
    return 'A (Free Flow)'

# --- Endpoints ---
@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "CityFlow AI ML Engine",
        "modelsLoaded": congestion_model is not None and fuel_model is not None,
        "metadata": ml_metadata
    }

@app.post("/predict/congestion")
def predict_congestion(req: CongestionPredictRequest):
    if not congestion_model:
        raise HTTPException(status_code=500, detail="ML Congestion model is not initialized.")
    
    vc_ratio = req.volume / max(req.capacity, 1.0)
    weather_factor = get_weather_multiplier(req.weatherCondition)
    is_peak = 1.0 if ((req.hourOfDay >= 8 and req.hourOfDay <= 11) or (req.hourOfDay >= 17 and req.hourOfDay <= 21)) else 0.0
    
    input_data = pd.DataFrame([{
        'volume': req.volume,
        'capacity': req.capacity,
        'vc_ratio': vc_ratio,
        'hour_of_day': req.hourOfDay,
        'is_peak': is_peak,
        'weather_factor': weather_factor,
        'active_incidents': req.activeIncidents,
        'free_flow_min': req.freeFlowMinutes
    }])
    
    preds = congestion_model.predict(input_data)[0]
    predicted_delay = float(np.maximum(0.0, preds[0]))
    predicted_risk = float(np.clip(preds[1], 5.0, 99.0))
    
    risk_band = 'LOW'
    if predicted_risk >= 75: risk_band = 'CRITICAL'
    elif predicted_risk >= 55: risk_band = 'HIGH'
    elif predicted_risk >= 35: risk_band = 'MODERATE'
    
    return {
        "success": True,
        "modelUsed": ml_metadata.get('algorithm', 'Ensemble Regressor'),
        "volumeCapacityRatio": round(vc_ratio, 2),
        "levelOfService": determine_los(vc_ratio),
        "predictedDelayMinutes": round(predicted_delay, 1),
        "estimatedTravelTimeMinutes": round(req.freeFlowMinutes + predicted_delay, 1),
        "congestionRiskPercentage": round(predicted_risk, 1),
        "riskBand": risk_band,
        "isPeakHour": is_peak == 1.0,
        "featureImportances": ml_metadata.get('congestion_importances', {})
    }

@app.post("/predict/fuel")
def predict_fuel(req: FuelPredictRequest):
    if not fuel_model:
        raise HTTPException(status_code=500, detail="ML Fuel model is not initialized.")
    
    weather_factor = get_weather_multiplier(req.weatherCondition)
    is_peak_val = 1.0 if req.isPeakHour else 0.0
    stop_start = round(req.routeDistanceKm * 2.2 + req.delayMinutes * 0.7)
    
    input_data = pd.DataFrame([{
        'route_distance_km': req.routeDistanceKm,
        'free_flow_min': req.freeFlowMinutes,
        'total_delay': req.delayMinutes,
        'vehicle_tonnage': req.vehicleTonnage,
        'stop_start_count': stop_start,
        'weather_factor': weather_factor,
        'is_peak': is_peak_val
    }])
    
    preds = fuel_model.predict(input_data)[0]
    predicted_fuel = float(np.maximum(0.5, preds[0]))
    predicted_carbon = float(np.maximum(1.3, preds[1]))
    efficiency_score = float(np.clip(preds[2], 10.0, 99.0))
    
    fuel_cost_inr = round(predicted_fuel * 92.5) # ₹92.5 / Liter Diesel avg
    
    return {
        "success": True,
        "predictedFuelLiters": round(predicted_fuel, 2),
        "predictedCarbonKg": round(predicted_carbon, 2),
        "estimatedFuelCostINR": fuel_cost_inr,
        "routeEfficiencyScore": round(efficiency_score, 1),
        "efficiencyGrade": "A+" if efficiency_score >= 85 else ("A" if efficiency_score >= 70 else ("B" if efficiency_score >= 50 else "C")),
        "featureImportances": ml_metadata.get('fuel_importances', {})
    }

@app.post("/evaluate/routes")
def evaluate_routes(req: EvaluateRoutesRequest):
    if not congestion_model or not fuel_model:
        raise HTTPException(status_code=500, detail="ML Models not fully initialized.")
    
    evaluated_routes = []
    
    for route in req.candidateRoutes:
        # 1. Congestion Inference
        vc_ratio = route.currentVolumeVPH / max(route.nominalCapacityVPH, 1.0)
        weather_factor = get_weather_multiplier(req.weatherCondition)
        is_peak = 1.0 if ((req.requestedHour >= 8 and req.requestedHour <= 11) or (req.requestedHour >= 17 and req.requestedHour <= 21)) else 0.0
        
        c_input = pd.DataFrame([{
            'volume': route.currentVolumeVPH,
            'capacity': route.nominalCapacityVPH,
            'vc_ratio': vc_ratio,
            'hour_of_day': req.requestedHour,
            'is_peak': is_peak,
            'weather_factor': weather_factor,
            'active_incidents': route.activeIncidents,
            'free_flow_min': route.freeFlowMinutes
        }])
        
        c_preds = congestion_model.predict(c_input)[0]
        delay_min = float(np.maximum(0.0, c_preds[0]))
        risk_pct = float(np.clip(c_preds[1], 5.0, 99.0))
        
        # 2. Fuel & Carbon Inference
        stop_start = round(route.distanceKm * 2.2 + delay_min * 0.7)
        f_input = pd.DataFrame([{
            'route_distance_km': route.distanceKm,
            'free_flow_min': route.freeFlowMinutes,
            'total_delay': delay_min,
            'vehicle_tonnage': req.vehicleTonnage,
            'stop_start_count': stop_start,
            'weather_factor': weather_factor,
            'is_peak': is_peak
        }])
        
        f_preds = fuel_model.predict(f_input)[0]
        fuel_liters = float(np.maximum(0.5, f_preds[0]))
        carbon_kg = float(np.maximum(1.3, f_preds[1]))
        efficiency_score = float(np.clip(f_preds[2], 10.0, 99.0))
        
        # OFF-PEAK OPTIMIZATION SIMULATION (Off-Peak departure e.g. 11:30 AM)
        off_peak_c_input = c_input.copy()
        off_peak_c_input['hour_of_day'] = 11.5
        off_peak_c_input['is_peak'] = 0.0
        off_peak_c_preds = congestion_model.predict(off_peak_c_input)[0]
        off_peak_delay = float(np.maximum(0.0, off_peak_c_preds[0]))
        
        off_peak_f_input = f_input.copy()
        off_peak_f_input['total_delay'] = off_peak_delay
        off_peak_f_input['is_peak'] = 0.0
        off_peak_f_preds = fuel_model.predict(off_peak_f_input)[0]
        off_peak_fuel = float(np.maximum(0.5, off_peak_f_preds[0]))
        off_peak_carbon = float(np.maximum(1.3, off_peak_f_preds[1]))
        off_peak_efficiency = float(np.clip(off_peak_f_preds[2], 10.0, 99.0))
        
        evaluated_routes.append({
            "routeId": route.id,
            "routeName": route.name,
            "distanceKm": route.distanceKm,
            "freeFlowMinutes": route.freeFlowMinutes,
            "peakEvaluation": {
                "predictedDelayMinutes": round(delay_min, 1),
                "totalTravelTimeMinutes": round(route.freeFlowMinutes + delay_min, 1),
                "congestionRiskPct": round(risk_pct, 1),
                "fuelLiters": round(fuel_liters, 2),
                "carbonKg": round(carbon_kg, 2),
                "efficiencyScore": round(efficiency_score, 1),
                "levelOfService": determine_los(vc_ratio)
            },
            "offPeakRecommendedEvaluation": {
                "recommendedDepartureTime": "11:30 AM (CityFlow Optimal Off-Peak Window)",
                "predictedDelayMinutes": round(off_peak_delay, 1),
                "totalTravelTimeMinutes": round(route.freeFlowMinutes + off_peak_delay, 1),
                "fuelLiters": round(off_peak_fuel, 2),
                "carbonKg": round(off_peak_carbon, 2),
                "efficiencyScore": round(off_peak_efficiency, 1),
                "fuelSavedLiters": round(fuel_liters - off_peak_fuel, 2),
                "carbonSavedKg": round(carbon_kg - off_peak_carbon, 2),
                "delaySavedMinutes": round(delay_min - off_peak_delay, 1)
            }
        })
    
    # Sort routes by offPeak efficiency score
    evaluated_routes.sort(key=lambda r: r['offPeakRecommendedEvaluation']['efficiencyScore'], reverse=True)
    
    best_route = evaluated_routes[0]
    
    return {
        "success": True,
        "timestamp": pd.Timestamp.now().isoformat(),
        "cargoType": req.cargoType,
        "vehicleTonnage": req.vehicleTonnage,
        "bestRecommendedRoute": best_route,
        "allEvaluatedRoutes": evaluated_routes,
        "optimizationSummary": {
            "topRouteName": best_route['routeName'],
            "potentialFuelSavedLiters": best_route['offPeakRecommendedEvaluation']['fuelSavedLiters'],
            "potentialCarbonSavedKg": best_route['offPeakRecommendedEvaluation']['carbonSavedKg'],
            "potentialTimeSavedMinutes": best_route['offPeakRecommendedEvaluation']['delaySavedMinutes'],
            "costSavedINR": round(best_route['offPeakRecommendedEvaluation']['fuelSavedLiters'] * 92.5),
            "recommendationNote": f"By selecting '{best_route['routeName']}' and shifting departure to 11:30 AM, fleet operations gain +{best_route['offPeakRecommendedEvaluation']['efficiencyScore'] - best_route['peakEvaluation']['efficiencyScore']:.1f} pts in Route Efficiency Score."
        }
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)
