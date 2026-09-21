import crypto from 'crypto';
import { UserDAO } from '../models/User.js';
import { AuthEventDAO } from '../models/AuthEvent.js';
import { createToken, hashPassword, publicUser, verifyPassword } from '../services/authService.js';
import { getDbStatus } from '../config/db.js';
import { validatePasswordPolicy } from '../utils/passwordPolicy.js';

const validateCredentials = (email, password) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email is required.');
  if (!password) throw new Error('Password is required.');
};

const requestDetails = req => ({
  ipAddress: req.ip || req.socket?.remoteAddress || null,
  userAgent: req.get('user-agent') || null
});

export const AuthController = {
  signup: async (req, res) => {
    try {
      const { name, email, password, role = 'USER', accessKey = '', userType = 'NORMAL' } = req.body;
      validateCredentials(email, password);
      validatePasswordPolicy(password);
      if (!name?.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
      if (!['USER', 'POLICE', 'LOGISTICS'].includes(role)) return res.status(400).json({ success: false, error: 'Invalid role.' });
      const validUserType = ['NORMAL', 'EMERGENCY_SPECIAL', 'VIP'].includes(userType) ? userType : 'NORMAL';

      // RBAC Department Authorization Passkey Check
      if (role === 'POLICE') {
        const policeKey = process.env.POLICE_ACCESS_KEY || 'POLICE-DELHI-2026';
        if (accessKey.trim() !== policeKey) {
          return res.status(403).json({
            success: false,
            error: 'Invalid or missing Police Department Authorization Key. Public users must register under the Citizen role.'
          });
        }
      } else if (role === 'LOGISTICS') {
        const logisticsKey = process.env.LOGISTICS_ACCESS_KEY || 'FLEET-LOGIX-2026';
        if (accessKey.trim() !== logisticsKey) {
          return res.status(403).json({
            success: false,
            error: 'Invalid or missing Logistics Fleet Authorization Key. Public users must register under the Citizen role.'
          });
        }
      }

      if (await UserDAO.findByEmail(email)) return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      const credentials = hashPassword(password);
      const user = await UserDAO.create({ 
        name: name.trim(), 
        email: email.toLowerCase(), 
        passwordHash: credentials.hash, 
        passwordSalt: credentials.salt, 
        role,
        userType: validUserType
      });
      await AuthEventDAO.create({ userId: String(user._id), email: user.email, event: 'SIGNUP', success: true, ...requestDetails(req) });
      return res.status(201).json({ success: true, token: createToken(user), user: publicUser(user) });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      validateCredentials(email, password);
      const user = await UserDAO.findByEmail(email);
      if (!user || !verifyPassword(password, user)) {
        await AuthEventDAO.create({ userId: user ? String(user._id) : null, email: email.toLowerCase(), event: 'LOGIN_FAILED', success: false, reason: 'INVALID_CREDENTIALS', ...requestDetails(req) });
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
      await AuthEventDAO.create({ userId: String(user._id), email: user.email, event: 'LOGIN_SUCCESS', success: true, ...requestDetails(req) });
      return res.json({ success: true, token: createToken(user), user: publicUser(user) });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'A valid email is required.' });
      }

      const normalized = email.trim().toLowerCase();
      const user = await UserDAO.findByEmail(normalized);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email address. Please register or check the spelling.'
        });
      }

      // Generate 6-digit code and secure alphanumeric token
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = crypto.randomBytes(20).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await UserDAO.setResetToken(normalized, token, otp, expiresAt);
      await AuthEventDAO.create({
        userId: String(user._id),
        email: normalized,
        event: 'PASSWORD_RESET_REQUEST',
        success: true,
        ...requestDetails(req)
      });

      console.log(`🔑 [CityFlow Auth] Password reset code generated for ${normalized}: ${otp}`);

      return res.json({
        success: true,
        message: 'Password reset code generated successfully. Valid for 15 minutes.',
        email: normalized,
        resetCode: otp,
        resetToken: token,
        expiresInMinutes: 15
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'A valid email is required.' });
      }
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, error: 'Reset code or token is required.' });
      }
      validatePasswordPolicy(newPassword);

      const normalized = email.trim().toLowerCase();
      const user = await UserDAO.findByResetTokenOrOtp(normalized, code.trim());
      if (!user) {
        await AuthEventDAO.create({
          userId: null,
          email: normalized,
          event: 'PASSWORD_RESET_FAILED',
          success: false,
          reason: 'INVALID_OR_EXPIRED_CODE',
          ...requestDetails(req)
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset code. Please request a new code.'
        });
      }

      const credentials = hashPassword(newPassword);
      await UserDAO.updatePassword(user._id, credentials.hash, credentials.salt);
      await AuthEventDAO.create({
        userId: String(user._id),
        email: normalized,
        event: 'PASSWORD_RESET_SUCCESS',
        success: true,
        ...requestDetails(req)
      });

      return res.json({
        success: true,
        message: 'Password has been successfully updated! You can now log in with your new password.'
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required.' });
      }
      validatePasswordPolicy(newPassword);

      const userId = req.user?.sub;
      const user = await UserDAO.findById(userId);
      if (!user || !verifyPassword(currentPassword, user)) {
        await AuthEventDAO.create({
          userId: user ? String(user._id) : null,
          email: user ? user.email : req.user?.email,
          event: 'PASSWORD_CHANGE_FAILED',
          success: false,
          reason: 'INVALID_CURRENT_PASSWORD',
          ...requestDetails(req)
        });
        return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
      }

      if (verifyPassword(newPassword, user)) {
        return res.status(400).json({
          success: false,
          error: 'New password cannot be the same as your current password.'
        });
      }

      const credentials = hashPassword(newPassword);
      await UserDAO.updatePassword(user._id, credentials.hash, credentials.salt);
      await AuthEventDAO.create({
        userId: String(user._id),
        email: user.email,
        event: 'PASSWORD_CHANGE_SUCCESS',
        success: true,
        ...requestDetails(req)
      });

      return res.json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  status: async (req, res) => {
    const db = getDbStatus();
    return res.json({
      success: true,
      service: 'CityFlow Auth & Database Service',
      database: db,
      timestamp: new Date().toISOString()
    });
  },

  history: async (req, res) => {
    const events = await AuthEventDAO.findByUser(req.user.sub);
    return res.json({ success: true, events });
  }
};

