import axios from 'axios';
import { inMemoryStore } from '../config/db.js';
import { TrafficObservationDAO } from '../models/TrafficObservation.js';

const levelFromRatio = ratio => ratio >= 0.8 ? 'SEVERE' : ratio >= 0.6 ? 'HIGH' : ratio >= 0.35 ? 'MODERATE' : 'LOW';

export const TrafficIngestionService = {
  recordSystemSnapshot: async () => {
    const observations = inMemoryStore.signals.map(signal => {
      const freeFlow = 45;
      const speed = Math.max(5, freeFlow * (1 - Math.min(0.9, signal.phaseVolume.northSouth / 4000)));
      return {
        location: { ...signal.location, name: signal.name },
        speedKmph: Number(speed.toFixed(1)),
        freeFlowSpeedKmph: freeFlow,
        congestionLevel: levelFromRatio(1 - speed / freeFlow),
        source: 'SYSTEM_TELEMETRY'
      };
    });
    return TrafficObservationDAO.createMany(observations);
  },

  syncTomTom: async () => {
    const key = process.env.TOMTOM_API_KEY;
    if (!key) throw new Error('TOMTOM_API_KEY is not configured. Add a licensed TomTom key to backend/.env.');
    const observations = [];
    for (const signal of inMemoryStore.signals) {
      const point = `${signal.location.lat},${signal.location.lng}`;
      const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${point}&unit=KMPH&key=${encodeURIComponent(key)}`;
      const response = await axios.get(url, { timeout: 8000 });
      const flow = response.data?.flowSegmentData;
      if (!flow || !Number.isFinite(flow.currentSpeed)) continue;
      const freeFlow = Number(flow.freeFlowSpeed) || null;
      const ratio = freeFlow ? 1 - flow.currentSpeed / freeFlow : 0;
      observations.push({
        location: { ...signal.location, name: signal.name },
        speedKmph: flow.currentSpeed,
        freeFlowSpeedKmph: freeFlow,
        congestionLevel: levelFromRatio(ratio),
        source: 'TOMTOM',
        providerObservationId: flow.frc || null,
        raw: flow
      });
    }
    return TrafficObservationDAO.createMany(observations);
  }
};
