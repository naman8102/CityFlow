import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const authEventSchema = new mongoose.Schema({
  userId: { type: String, default: null, index: true },
  email: { type: String, required: true, lowercase: true, index: true },
  event: {
    type: String,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'SIGNUP',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_SUCCESS',
      'PASSWORD_RESET_FAILED',
      'PASSWORD_CHANGE_SUCCESS',
      'PASSWORD_CHANGE_FAILED'
    ],
    required: true
  },
  success: { type: Boolean, required: true },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  reason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
});

let AuthEventModel;
try { AuthEventModel = mongoose.model('AuthEvent', authEventSchema); } catch { AuthEventModel = mongoose.model('AuthEvent'); }

export const AuthEventDAO = {
  create: async data => {
    if (mongoose.connection.readyState === 1) return AuthEventModel.create(data);
    const event = { _id: `auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), ...data };
    inMemoryStore.authEvents = inMemoryStore.authEvents || [];
    inMemoryStore.authEvents.unshift(event);
    persistStore();
    return event;
  },
  findByUser: async userId => {
    if (mongoose.connection.readyState === 1) return AuthEventModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return (inMemoryStore.authEvents || []).filter(event => event.userId === userId).slice(0, 50);
  }
};

export default AuthEventModel;
