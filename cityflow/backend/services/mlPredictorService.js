import http from 'http';
import { TrafficPredictor } from './trafficPredictor.js';

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://127.0.0.1:5001';

/**
 * Helper function for HTTP POST/GET requests to Python ML FastAPI server
 */
function makeMlRequest(path, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, ML_ENGINE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000 // 3 sec timeout for fallback
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`ML Server returned HTTP status ${res.statusCode}: ${body}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('ML Server request timed out'));
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

export class MlPredictorService {
  /**
   * Get ML Server Status & Model Feature Importances
   */
  static async getMlStatus() {
    try {
      const data = await makeMlRequest('/health', 'GET');
      return data;
    } catch (error) {
      return {
        status: 'FALLBACK_MODE',
        service: 'CityFlow AI Heuristic Engine (Python ML Offline)',
        modelsLoaded: false,
        fallbackNote: error.message
      };
    }
  }

  /**
   * Predict Traffic Congestion & Delay via ML Model with heuristic fallback
   */
  static async predictCongestion(params) {
    try {
      const mlData = await makeMlRequest('/predict/congestion', 'POST', params);
      return {
        ...mlData,
        source: 'ML_ENSEMBLE_XGBOOST'
      };
    } catch (error) {
      console.warn(`[MlPredictorService] Python ML Service unavailable (${error.message}). Falling back to BPR heuristics.`);
      const bpr = TrafficPredictor.calculateBPRDelay(
        params.freeFlowMinutes || 8.0,
        params.volume || 2000,
        params.capacity || 1800
      );
      const risk = TrafficPredictor.predictCongestionRisk(params);

      return {
        success: true,
        source: 'HEURISTIC_BPR_FALLBACK',
        modelUsed: 'BPR Equation + Congestion Regressor',
        volumeCapacityRatio: bpr.volumeCapacityRatio,
        levelOfService: bpr.levelOfService,
        predictedDelayMinutes: bpr.delayMinutes,
        estimatedTravelTimeMinutes: bpr.travelTimeMinutes,
        congestionRiskPercentage: risk.riskPercentage,
        riskBand: risk.riskBand,
        isPeakHour: risk.isPeakHour,
        featureImportances: { volume: 0.45, capacity: 0.35, weather: 0.20 }
      };
    }
  }

  /**
   * Predict Commercial Truck Fuel & Carbon Footprint via ML Model
   */
  static async predictFuel(params) {
    try {
      const mlData = await makeMlRequest('/predict/fuel', 'POST', params);
      return {
        ...mlData,
        source: 'ML_RANDOM_FOREST'
      };
    } catch (error) {
      console.warn(`[MlPredictorService] Python ML Service unavailable (${error.message}). Falling back to heuristic fuel engine.`);
      const savings = TrafficPredictor.calculateLogisticsSavings(
        params.vehicleTonnage || 7.5,
        params.delayMinutes || 15.0
      );
      return {
        success: true,
        source: 'HEURISTIC_FUEL_FALLBACK',
        predictedFuelLiters: savings.fuelSavedLiters,
        predictedCarbonKg: savings.carbonSavedKg,
        estimatedFuelCostINR: savings.costSavedINR,
        routeEfficiencyScore: 78.5,
        efficiencyGrade: 'A',
        featureImportances: { delay: 0.65, tonnage: 0.25, distance: 0.10 }
      };
    }
  }

  /**
   * Evaluate multiple candidate routes & recommend optimal logistics plan
   */
  static async evaluateRoutes(params) {
    try {
      const mlData = await makeMlRequest('/evaluate/routes', 'POST', params);
      return {
        ...mlData,
        source: 'ML_MULTI_OBJECTIVE_OPTIMIZER'
      };
    } catch (error) {
      console.warn(`[MlPredictorService] Python ML Service unavailable (${error.message}). Falling back to heuristic route evaluation.`);
      return {
        success: true,
        source: 'HEURISTIC_ROUTE_FALLBACK',
        cargoType: params.cargoType || 'Industrial Goods',
        vehicleTonnage: params.vehicleTonnage || 7.5,
        optimizationSummary: {
          topRouteName: params.candidateRoutes[0]?.name || 'Standard Arterial',
          potentialFuelSavedLiters: 4.8,
          potentialCarbonSavedKg: 12.8,
          potentialTimeSavedMinutes: 24.5,
          costSavedINR: 444,
          recommendationNote: 'Fallback heuristic calculation applied.'
        }
      };
    }
  }
}
