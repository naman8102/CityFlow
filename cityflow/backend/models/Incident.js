import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['CONGESTION', 'ACCIDENT', 'CONSTRUCTION', 'HAZARD'], 
    default: 'CONGESTION' 
  },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM' 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Central Arterial Node' }
  },
  reportedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'RESOLVED'], 
    default: 'ACTIVE' 
  },
  affectedRadiusMeters: { type: Number, default: 500 },
  impactFactor: { type: Number, default: 1.3 },
  source: { type: String, enum: ['CITIZEN', 'POLICE', 'EXTERNAL_FEED', 'SYSTEM'], default: 'CITIZEN' },
  reportedBy: { type: String, default: null },
  resolvedAt: { type: Date, default: null }
});

let IncidentModel;
try {
  IncidentModel = mongoose.model('Incident', incidentSchema);
} catch {
  IncidentModel = mongoose.model('Incident');
}

// Unified DAO interface that seamlessly operates on MongoDB or In-Memory Store
export const IncidentDAO = {
  findActive: async () => {
    if (mongoose.connection.readyState === 1) {
      return await IncidentModel.find({ status: 'ACTIVE' }).sort({ reportedAt: -1 });
    }
    return inMemoryStore.incidents.filter(i => i.status === 'ACTIVE');
  },
  findHistory: async limit => {
    if (mongoose.connection.readyState === 1) return IncidentModel.find().sort({ reportedAt: -1 }).limit(limit);
    return [...inMemoryStore.incidents].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)).slice(0, limit);
  },
  recurringHotspots: async () => {
    const incidents = await IncidentDAO.findHistory(1000);
    const groups = new Map();
    incidents.forEach(item => {
      const key = `${Number(item.location.lat).toFixed(3)},${Number(item.location.lng).toFixed(3)}`;
      const existing = groups.get(key) || { key, location: item.location, incidentCount: 0, criticalCount: 0, lastReportedAt: item.reportedAt };
      existing.incidentCount += 1;
      if (item.severity === 'CRITICAL' || item.type === 'ACCIDENT') existing.criticalCount += 1;
      groups.set(key, existing);
    });
    return [...groups.values()].sort((a, b) => b.incidentCount - a.incidentCount);
  },
  create: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Incident validation failed: data payload must be an object.');
    }

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title || title.length < 3 || title.length > 200) {
      throw new Error('Incident validation failed: title must be between 3 and 200 characters.');
    }

    const VALID_TYPES = ['CONGESTION', 'ACCIDENT', 'CONSTRUCTION', 'HAZARD'];
    const type = (data.type || 'CONGESTION').toUpperCase();
    if (!VALID_TYPES.includes(type)) {
      throw new Error(`Incident validation failed: invalid type "${data.type}". Allowed types: ${VALID_TYPES.join(', ')}.`);
    }

    const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const severity = (data.severity || 'MEDIUM').toUpperCase();
    if (!VALID_SEVERITIES.includes(severity)) {
      throw new Error(`Incident validation failed: invalid severity "${data.severity}". Allowed severities: ${VALID_SEVERITIES.join(', ')}.`);
    }

    if (!data.location || typeof data.location !== 'object') {
      throw new Error('Incident validation failed: location object with numeric lat and lng is required.');
    }

    const lat = Number(data.location.lat);
    const lng = Number(data.location.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new Error('Incident validation failed: latitude must be a valid number between -90 and 90.');
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      throw new Error('Incident validation failed: longitude must be a valid number between -180 and 180.');
    }

    const VALID_SOURCES = ['CITIZEN', 'POLICE', 'EXTERNAL_FEED', 'SYSTEM'];
    const source = (data.source || 'CITIZEN').toUpperCase();
    if (!VALID_SOURCES.includes(source)) {
      throw new Error(`Incident validation failed: invalid source "${data.source}". Allowed sources: ${VALID_SOURCES.join(', ')}.`);
    }

    const sanitizedData = {
      title,
      type,
      severity,
      location: {
        lat,
        lng,
        address: typeof data.location.address === 'string' && data.location.address.trim()
          ? data.location.address.trim().slice(0, 255)
          : 'Central Arterial Node'
      },
      source,
      reportedBy: data.reportedBy ? String(data.reportedBy) : null
    };

    if (mongoose.connection.readyState === 1) {
      return await IncidentModel.create(sanitizedData);
    }
    const newIncident = {
      _id: 'inc-' + Date.now(),
      reportedAt: new Date().toISOString(),
      status: 'ACTIVE',
      impactFactor: severity === 'CRITICAL' ? 1.8 : severity === 'HIGH' ? 1.4 : 1.2,
      affectedRadiusMeters: 500,
      ...sanitizedData
    };
    inMemoryStore.incidents.unshift(newIncident);
    persistStore();
    return newIncident;
  },
  resolve: async (id) => {
    if (mongoose.connection.readyState === 1) {
      return await IncidentModel.findByIdAndUpdate(id, { status: 'RESOLVED' }, { new: true });
    }
    const item = inMemoryStore.incidents.find(i => i._id === id);
    if (item) {
      item.status = 'RESOLVED';
      item.resolvedAt = new Date().toISOString();
      persistStore();
    }
    return item;
  }
};

export default IncidentModel;
