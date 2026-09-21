import { MlPredictorService } from '../services/mlPredictorService.js';

export const MlController = {
  getStatus: async (req, res) => {
    try {
      const status = await MlPredictorService.getMlStatus();
      return res.status(200).json({ success: true, ...status });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  predictCongestion: async (req, res) => {
    try {
      const result = await MlPredictorService.predictCongestion(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  predictFuel: async (req, res) => {
    try {
      const result = await MlPredictorService.predictFuel(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  evaluateRoutes: async (req, res) => {
    try {
      const {
        cargoType = 'Industrial Goods',
        vehicleTonnage = 7.5,
        requestedHour = 9.0,
        weatherCondition = 'CLEAR',
        candidateRoutes
      } = req.body;

      const routesToEvaluate = candidateRoutes || [
        {
          id: 'route-arterial',
          name: 'Primary Commercial Arterial (Ring Road)',
          distanceKm: 14.5,
          freeFlowMinutes: 16.0,
          currentVolumeVPH: 2350,
          nominalCapacityVPH: 1800,
          activeIncidents: 1
        },
        {
          id: 'route-expressway',
          name: 'Outer Perimeter Freight Bypass Expressway',
          distanceKm: 18.2,
          freeFlowMinutes: 14.0,
          currentVolumeVPH: 1100,
          nominalCapacityVPH: 2500,
          activeIncidents: 0
        },
        {
          id: 'route-urban-corridor',
          name: 'Central Urban Avenue',
          distanceKm: 12.8,
          freeFlowMinutes: 20.0,
          currentVolumeVPH: 2100,
          nominalCapacityVPH: 1500,
          activeIncidents: 0
        }
      ];

      const evaluation = await MlPredictorService.evaluateRoutes({
        cargoType,
        vehicleTonnage,
        requestedHour,
        weatherCondition,
        candidateRoutes: routesToEvaluate
      });

      return res.status(200).json(evaluation);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};
