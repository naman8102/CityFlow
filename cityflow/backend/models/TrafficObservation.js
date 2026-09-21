import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const trafficObservationSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, default: 'Unknown road segment' }
  },
  speedKmph: { type: Number, required: true },
  freeFlowSpeedKmph: { type: Number, default: null },
  congestionLevel: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'], required: true },
  source: { type: String, enum: ['TOMTOM', 'POLICE_FEED', 'SYSTEM_TELEMETRY'], required: true },
  providerObservationId: { type: String, default: null },
  observedAt: { type: Date, default: Date.now, index: true },
  raw: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

let TrafficObservationModel;
try { TrafficObservationModel = mongoose.model('TrafficObservation', trafficObservationSchema); } catch { TrafficObservationModel = mongoose.model('TrafficObservation'); }

const normalize = data => ({
  _id: `traffic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  observedAt: new Date().toISOString(),
  ...data
});

export const TrafficObservationDAO = {
  createMany: async observations => {
    if (!observations.length) return [];
    if (mongoose.connection.readyState === 1) return TrafficObservationModel.insertMany(observations);
    const normalized = observations.map(normalize);
    inMemoryStore.trafficObservations = [...normalized, ...(inMemoryStore.trafficObservations || [])].slice(0, 10000);
    persistStore();
    return normalized;
  },
  findRecent: async limit => {
    if (mongoose.connection.readyState === 1) return TrafficObservationModel.find().sort({ observedAt: -1 }).limit(limit);
    return (inMemoryStore.trafficObservations || []).slice(0, limit);
  },
  count: async () => {
    if (mongoose.connection.readyState === 1) return TrafficObservationModel.countDocuments();
    return (inMemoryStore.trafficObservations || []).length;
  }
};

export default TrafficObservationModel;
