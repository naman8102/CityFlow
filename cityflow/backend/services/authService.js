import crypto from 'crypto';
import mongoose from 'mongoose';
import { inMemoryStore, persistStore } from '../config/db.js';
import UserModel from '../models/User.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24;
const secret = () => process.env.AUTH_SECRET || 'cityflow-development-secret-change-me';

const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = value => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

export const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
});

export const verifyPassword = (password, user) => {
  const hash = crypto.pbkdf2Sync(password, user.passwordSalt, 120000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.passwordHash, 'hex'));
};

export const createToken = user => {
  const payload = { 
    sub: String(user._id), 
    email: user.email, 
    role: user.role, 
    userType: user.userType || 'NORMAL',
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS 
  };
  const encoded = encode(payload);
  const signature = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
};

export const verifyToken = token => {
  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature) throw new Error('Invalid authentication token.');
  const expected = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid authentication token.');
  }
  const payload = decode(encoded);
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Authentication token expired.');
  return payload;
};

export const publicUser = user => ({ 
  id: String(user._id), 
  name: user.name, 
  email: user.email, 
  role: user.role,
  userType: user.userType || 'NORMAL'
});

export const saveLocalUser = user => {
  inMemoryStore.users = inMemoryStore.users || [];
  inMemoryStore.users.push(user);
  persistStore();
  return user;
};

export const findLocalUserByEmail = email => (inMemoryStore.users || []).find(user => user.email === email.toLowerCase());

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const seedDefaultUsers = async () => {
  const defaultAccounts = [
    {
      name: 'Aarav Sharma (Citizen)',
      email: 'citizen@cityflow.ai',
      role: 'USER',
      userType: 'NORMAL',
      password: 'CityFlow@2026'
    },
    {
      name: 'Rohan Deshmukh (Special Case Citizen)',
      email: 'special@cityflow.ai',
      role: 'USER',
      userType: 'EMERGENCY_SPECIAL',
      password: 'CityFlow@2026'
    },
    {
      name: 'Inspector Vikram Rao (Traffic Hub)',
      email: 'police@cityflow.ai',
      role: 'POLICE',
      userType: 'NORMAL',
      password: 'CityFlow@2026'
    },
    {
      name: 'Ananya Mehta (Fleet Operations)',
      email: 'logistics@cityflow.ai',
      role: 'LOGISTICS',
      userType: 'NORMAL',
      password: 'CityFlow@2026'
    },
    {
      name: 'H.E. Diplomatic Convoy (VIP)',
      email: 'vip@cityflow.ai',
      role: 'USER',
      userType: 'VIP',
      password: 'CityFlow@2026'
    }
  ];

  for (const acc of defaultAccounts) {
    try {
      const creds = hashPassword(acc.password);
      // Seed in-memory store
      const localExisting = findLocalUserByEmail(acc.email);
      if (!localExisting) {
        saveLocalUser({
          _id: `usr-seed-${acc.role.toLowerCase()}-${acc.userType.toLowerCase()}`,
          name: acc.name,
          email: acc.email.toLowerCase(),
          role: acc.role,
          userType: acc.userType,
          passwordHash: creds.hash,
          passwordSalt: creds.salt,
          createdAt: new Date().toISOString()
        });
      } else {
        localExisting.userType = acc.userType;
        localExisting.name = acc.name;
        persistStore();
      }

      // Seed MongoDB Atlas if connected
      if (mongoose.connection.readyState === 1) {
        const mongoExisting = await UserModel.findOne({ email: acc.email.toLowerCase() });
        if (!mongoExisting) {
          await UserModel.create({
            name: acc.name,
            email: acc.email.toLowerCase(),
            role: acc.role,
            userType: acc.userType,
            passwordHash: creds.hash,
            passwordSalt: creds.salt
          });
          console.log(`👤 [CityFlow Auth] Default account ${acc.email} synced to MongoDB Atlas.`);
        } else if (!mongoExisting.userType) {
          mongoExisting.userType = acc.userType;
          await mongoExisting.save();
        }
      }
    } catch (err) {
      console.warn(`[CityFlow Auth] Note for ${acc.email}: ${err.message}`);
    }
  }
};
