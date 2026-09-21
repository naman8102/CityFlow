import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const emergencyMissionSchema = new mongoose.Schema({
  missionCode: { type: String, required: true },
  vehicleType: { 
    type: String, 
    enum: ['AMBULANCE', 'FIRE_TRUCK', 'POLICE'], 
    default: 'AMBULANCE' 
  },
  vehicleNumber: { type: String, required: true },
  origin: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, default: 'Emergency Origin' }
  },
  destination: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, default: 'Trauma Hospital Destination' }
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'CANCELLED'], 
    default: 'DISPATCHED' 
  },
  priority: { 
    type: String, 
    enum: ['STANDARD', 'HIGH', 'CRITICAL'], 
    default: 'CRITICAL' 
  },
  preemptedSignals: [{ type: String }],
  timeSavedSeconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
  ,reportedBy: { type: String, default: null }
  ,dispatchSource: { type: String, enum: ['POLICE', 'SYSTEM'], default: 'POLICE' }
});

let EmergencyMissionModel;
try {
  EmergencyMissionModel = mongoose.model('EmergencyMission', emergencyMissionSchema);
} catch {
  EmergencyMissionModel = mongoose.model('EmergencyMission');
}

export const EmergencyDAO = {
  findActive: async () => {
    if (mongoose.connection.readyState === 1) {
      return await EmergencyMissionModel.find({ status: { $in: ['DISPATCHED', 'EN_ROUTE'] } }).sort({ createdAt: -1 });
    }
    return inMemoryStore.emergencyMissions.filter(m => m.status === 'DISPATCHED' || m.status === 'EN_ROUTE');
  },
  create: async (data) => {
    let mission;
    if (mongoose.connection.readyState === 1) {
      const doc = await EmergencyMissionModel.create(data);
      mission = doc.toObject ? doc.toObject() : { ...doc };
      mission._id = String(doc._id);
    } else {
      mission = {
        _id: 'emg-' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'EN_ROUTE',
        timeSavedSeconds: data.timeSavedSeconds || 436,
        ...data
      };
    }
    inMemoryStore.emergencyMissions = inMemoryStore.emergencyMissions || [];
    inMemoryStore.emergencyMissions.unshift(mission);
    persistStore();
    return mission;
  },
  updateLocation: async (id, loc) => {
    if (mongoose.connection.readyState === 1) {
      try {
        await EmergencyMissionModel.findByIdAndUpdate(id, { currentLocation: loc }, { new: true });
      } catch (e) {}
    }
    const mission = (inMemoryStore.emergencyMissions || []).find(m => String(m._id) === String(id));
    if (mission) {
      mission.currentLocation = loc;
      persistStore();
    }
    return mission;
  },
  complete: async (id) => {
    if (mongoose.connection.readyState === 1) {
      try {
        await EmergencyMissionModel.findByIdAndUpdate(id, { status: 'ARRIVED' }, { new: true });
      } catch (e) {}
    }
    const mission = (inMemoryStore.emergencyMissions || []).find(m => String(m._id) === String(id));
    if (mission) {
      mission.status = 'ARRIVED';
      mission.arrivedAt = new Date().toISOString();
      persistStore();
    }
    return mission;
  }
};

export default EmergencyMissionModel;
