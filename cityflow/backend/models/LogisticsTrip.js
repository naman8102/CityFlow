import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const logisticsTripSchema = new mongoose.Schema({
  fleetCompany: { type: String, required: true },
  truckId: { type: String, required: true },
  cargoType: { type: String, default: 'General Freight' },
  tonnage: { type: Number, default: 5.0 },
  route: { type: String, required: true },
  requestedDeparture: { type: String, required: true },
  suggestedDeparture: { type: String, required: true },
  isShifted: { type: Boolean, default: false },
  originalDelayMinutes: { type: Number, default: 0 },
  optimizedDelayMinutes: { type: Number, default: 0 },
  delaySavedMinutes: { type: Number, default: 0 },
  carbonSavedKg: { type: Number, default: 0 },
  incentiveCreditsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

let LogisticsTripModel;
try {
  LogisticsTripModel = mongoose.model('LogisticsTrip', logisticsTripSchema);
} catch {
  LogisticsTripModel = mongoose.model('LogisticsTrip');
}

export const LogisticsDAO = {
  findAll: async () => {
    if (mongoose.connection.readyState === 1) {
      return await LogisticsTripModel.find().sort({ createdAt: -1 });
    }
    return inMemoryStore.logisticsTrips;
  },
  create: async (data) => {
    if (mongoose.connection.readyState === 1) {
      return await LogisticsTripModel.create(data);
    }
    const trip = {
      _id: 'log-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...data
    };
    inMemoryStore.logisticsTrips.unshift(trip);
    persistStore();
    return trip;
  },
  toggleShift: async (id) => {
    if (mongoose.connection.readyState === 1) {
      const doc = await LogisticsTripModel.findById(id);
      if (doc) {
        doc.isShifted = !doc.isShifted;
        await doc.save();
        return doc;
      }
    }
    const trip = inMemoryStore.logisticsTrips.find(t => t._id === id);
    if (trip) {
      trip.isShifted = !trip.isShifted;
      persistStore();
    }
    return trip;
  }
};

export default LogisticsTripModel;
