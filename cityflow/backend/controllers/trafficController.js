import { TrafficIngestionService } from '../services/trafficIngestionService.js';
import { TrafficObservationDAO } from '../models/TrafficObservation.js';

export const TrafficController = {
  recent: async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
    const [observations, total] = await Promise.all([
      TrafficObservationDAO.findRecent(limit),
      TrafficObservationDAO.count()
    ]);
    return res.json({ success: true, total, observations });
  },
  snapshot: async (req, res) => {
    const observations = await TrafficIngestionService.recordSystemSnapshot();
    return res.status(201).json({ success: true, source: 'SYSTEM_TELEMETRY', savedCount: observations.length, observations });
  },
  syncTomTom: async (req, res) => {
    try {
      const observations = await TrafficIngestionService.syncTomTom();
      return res.status(201).json({ success: true, source: 'TOMTOM', savedCount: observations.length, observations });
    } catch (error) {
      return res.status(502).json({ success: false, error: error.message });
    }
  }
};
