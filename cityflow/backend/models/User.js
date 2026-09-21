import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  role: { type: String, enum: ['USER', 'POLICE', 'LOGISTICS'], default: 'USER' },
  userType: { type: String, enum: ['NORMAL', 'EMERGENCY_SPECIAL', 'VIP'], default: 'NORMAL' },
  resetPasswordToken: { type: String, default: null, index: true },
  resetPasswordOtp: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

let UserModel;
try { UserModel = mongoose.model('User', userSchema); } catch { UserModel = mongoose.model('User'); }

export const UserDAO = {
  findByEmail: async email => {
    const normalized = (email || '').trim().toLowerCase();
    if (mongoose.connection.readyState === 1) return UserModel.findOne({ email: normalized });
    return (inMemoryStore.users || []).find(user => user.email === normalized) || null;
  },

  findById: async id => {
    if (mongoose.connection.readyState === 1) return UserModel.findById(id);
    return (inMemoryStore.users || []).find(user => String(user._id) === String(id)) || null;
  },

  create: async data => {
    if (mongoose.connection.readyState === 1) return UserModel.create(data);
    const user = { _id: `usr-${Date.now()}`, createdAt: new Date().toISOString(), ...data };
    inMemoryStore.users = inMemoryStore.users || [];
    inMemoryStore.users.push(user);
    persistStore();
    return user;
  },

  setResetToken: async (email, token, otp, expiresAt) => {
    const normalized = (email || '').trim().toLowerCase();
    if (mongoose.connection.readyState === 1) {
      return UserModel.findOneAndUpdate(
        { email: normalized },
        { resetPasswordToken: token, resetPasswordOtp: otp, resetPasswordExpires: expiresAt },
        { new: true }
      );
    }
    inMemoryStore.users = inMemoryStore.users || [];
    const user = inMemoryStore.users.find(u => u.email === normalized);
    if (user) {
      user.resetPasswordToken = token;
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = expiresAt.toISOString();
      persistStore();
    }
    return user || null;
  },

  findByResetTokenOrOtp: async (email, tokenOrOtp) => {
    const normalized = (email || '').trim().toLowerCase();
    const code = (tokenOrOtp || '').trim();
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      return UserModel.findOne({
        email: normalized,
        resetPasswordExpires: { $gt: now },
        $or: [{ resetPasswordToken: code }, { resetPasswordOtp: code }]
      });
    }

    inMemoryStore.users = inMemoryStore.users || [];
    return inMemoryStore.users.find(u =>
      u.email === normalized &&
      (u.resetPasswordToken === code || u.resetPasswordOtp === code) &&
      u.resetPasswordExpires &&
      new Date(u.resetPasswordExpires) > now
    ) || null;
  },

  updatePassword: async (userId, passwordHash, passwordSalt) => {
    if (mongoose.connection.readyState === 1) {
      return UserModel.findByIdAndUpdate(
        userId,
        {
          passwordHash,
          passwordSalt,
          resetPasswordToken: null,
          resetPasswordOtp: null,
          resetPasswordExpires: null
        },
        { new: true }
      );
    }

    inMemoryStore.users = inMemoryStore.users || [];
    const user = inMemoryStore.users.find(u => String(u._id) === String(userId));
    if (user) {
      user.passwordHash = passwordHash;
      user.passwordSalt = passwordSalt;
      user.resetPasswordToken = null;
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      persistStore();
    }
    return user || null;
  }
};

export default UserModel;

