import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const sosRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userType: { type: String, default: 'EMERGENCY_SPECIAL' },
  sosType: {
    type: String,
    enum: ['EMERGENCY', 'VIP'],
    default: 'EMERGENCY',
    index: true
  },
  routeType: {
    type: String,
    enum: ['EMERGENCY_GREEN_CORRIDOR', 'VIP_PRIORITY_ROUTE'],
    default: 'EMERGENCY_GREEN_CORRIDOR',
    index: true
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'VERIFIED', 'ACTIVE', 'RESOLVED', 'CANCELLED'],
    default: 'REQUESTED',
    index: true
  },
  location: {
    lat: { type: Number, default: 28.6289 },
    lng: { type: Number, default: 77.2065 },
    name: { type: String, default: 'Dr. Ram Manohar Lohia Hospital Corridor' },
    address: { type: String, default: 'Baba Kharak Singh Marg, Connaught Place Arterial' }
  },
  destination: {
    lat: { type: Number, default: 28.6448 },
    lng: { type: Number, default: 77.2167 },
    name: { type: String, default: 'New Delhi Railway Station / VIP Terminal' },
    address: { type: String, default: 'Ajmeri Gate Arterial' }
  },
  routeDetails: { type: Object, default: null },
  corridorPath: { type: Array, default: [] },
  emergencyType: { type: String, default: 'CRITICAL_MEDICAL_ESCORT' },
  notes: { type: String, default: 'Special Case Citizen Emergency SOS — Priority Traffic Clear Request' },
  requestedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date, default: null },
  verifiedBy: { type: String, default: null },
  verifiedByName: { type: String, default: null },
  activatedAt: { type: Date, default: null },
  activatedBy: { type: String, default: null },
  activatedByName: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: String, default: null },
  emergencyMissionId: { type: String, default: null },
  auditLog: [
    {
      action: { type: String, required: true },
      actorId: { type: String, required: true },
      actorRole: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String, default: null },
      details: { type: String, default: null }
    }
  ],
  createdAt: { type: Date, default: Date.now, index: true }
});

let SosRequestModel;
try {
  SosRequestModel = mongoose.model('SosRequest', sosRequestSchema);
} catch {
  SosRequestModel = mongoose.model('SosRequest');
}

export const SosRequestDAO = {
  create: async data => {
    const sosType = data.sosType === 'VIP' ? 'VIP' : 'EMERGENCY';
    const routeType = data.routeType || (sosType === 'VIP' ? 'VIP_PRIORITY_ROUTE' : 'EMERGENCY_GREEN_CORRIDOR');
    const record = {
      requestId: data.requestId || `SOS-REQ-${Date.now().toString().slice(-6)}`,
      sosType,
      routeType,
      requestedAt: data.requestedAt || new Date().toISOString(),
      status: 'REQUESTED',
      auditLog: data.auditLog || [],
      ...data
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await SosRequestModel.create(record);
      return doc.toObject();
    }

    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    const local = { _id: record.requestId, ...record };
    inMemoryStore.sosRequests.unshift(local);
    persistStore();
    return local;
  },

  findById: async id => {
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.findOne({
        $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { requestId: id }]
      });
    }
    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    return inMemoryStore.sosRequests.find(r => r._id === id || r.requestId === id) || null;
  },

  findByUserActive: async userId => {
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.findOne({
        userId,
        status: { $in: ['REQUESTED', 'VERIFIED', 'ACTIVE'] }
      }).sort({ createdAt: -1 });
    }
    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    return inMemoryStore.sosRequests.find(
      r => r.userId === userId && ['REQUESTED', 'VERIFIED', 'ACTIVE'].includes(r.status)
    ) || null;
  },

  findLatestByUser: async userId => {
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.findOne({ userId }).sort({ createdAt: -1 });
    }
    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    const userReqs = inMemoryStore.sosRequests.filter(r => r.userId === userId);
    return userReqs[0] || null;
  },

  findAllActiveOrRecent: async () => {
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.find({}).sort({ createdAt: -1 }).limit(50);
    }
    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    return inMemoryStore.sosRequests.slice(0, 50);
  },

  updateStatus: async (id, status, updates = {}) => {
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { requestId: id }] },
        { status, ...updates },
        { new: true }
      );
    }

    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    const item = inMemoryStore.sosRequests.find(r => r._id === id || r.requestId === id);
    if (item) {
      item.status = status;
      Object.assign(item, updates);
      persistStore();
    }
    return item || null;
  },

  addAuditLog: async (id, entry) => {
    const logItem = { timestamp: new Date().toISOString(), ...entry };
    if (mongoose.connection.readyState === 1) {
      return await SosRequestModel.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { requestId: id }] },
        { $push: { auditLog: logItem } },
        { new: true }
      );
    }

    inMemoryStore.sosRequests = inMemoryStore.sosRequests || [];
    const item = inMemoryStore.sosRequests.find(r => r._id === id || r.requestId === id);
    if (item) {
      item.auditLog = item.auditLog || [];
      item.auditLog.push(logItem);
      persistStore();
    }
    return item || null;
  }
};

export default SosRequestModel;
