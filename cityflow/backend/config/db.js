import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
dotenv.config({ path: path.join(DATA_DIR, '..', '.env') });

const STORE_FILE = path.join(DATA_DIR, 'cityflow-store.json');

// In-Memory Datastore Fallback for Zero-Dependency Execution
export const inMemoryStore = {
  incidents: [
    {
      _id: 'inc-101',
      title: 'Waterlogging & Stalled Bus',
      type: 'CONGESTION',
      severity: 'HIGH',
      location: { lat: 28.6328, lng: 77.2197, address: 'Barakhamba Road, Connaught Place' },
      reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      affectedRadiusMeters: 450,
      impactFactor: 1.45
    },
    {
      _id: 'inc-102',
      title: 'Minor Multi-Vehicle Collision',
      type: 'ACCIDENT',
      severity: 'CRITICAL',
      location: { lat: 28.6139, lng: 77.2090, address: 'Rajpath - Janpath Intersection' },
      reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      affectedRadiusMeters: 600,
      impactFactor: 1.85
    }
  ],
  emergencyMissions: [
    {
      _id: 'emg-001',
      missionCode: 'SOS-MED-992',
      vehicleType: 'AMBULANCE',
      vehicleNumber: 'DL-01-EQ-8812',
      origin: { lat: 28.6289, lng: 77.2065, name: 'Ram Manohar Lohia Hospital' },
      destination: { lat: 28.6448, lng: 77.2167, name: 'New Delhi Railway Station Emergency Gate' },
      currentLocation: { lat: 28.6320, lng: 77.2100 },
      status: 'EN_ROUTE',
      priority: 'CRITICAL',
      preemptedSignals: ['sig-cp-inner', 'sig-barakhamba', 'sig-chelmsford'],
      timeSavedSeconds: 420,
      createdAt: new Date().toISOString()
    }
  ],
  logisticsTrips: [
    {
      _id: 'log-501',
      fleetCompany: 'Apex City Logistics',
      truckId: 'TRK-ALPHA-44',
      cargoType: 'Cold Storage Food Supplies',
      tonnage: 8.5,
      route: 'Okhla Industrial Area -> Azadpur Mandi',
      requestedDeparture: '09:30 AM (Peak Surge Window)',
      suggestedDeparture: '11:15 AM (Optimized Off-Peak Slot)',
      isShifted: true,
      originalDelayMinutes: 74,
      optimizedDelayMinutes: 28,
      delaySavedMinutes: 46,
      carbonSavedKg: 18.4,
      incentiveCreditsEarned: 150
    },
    {
      _id: 'log-502',
      fleetCompany: 'BlueDart Freightline',
      truckId: 'TRK-BETA-89',
      cargoType: 'E-Commerce Parcel Batches',
      tonnage: 4.2,
      route: 'Noida Sector 62 -> Central Delhi Hub',
      requestedDeparture: '08:45 AM (Peak Window)',
      suggestedDeparture: '10:30 AM (Recommended Slot)',
      isShifted: false,
      originalDelayMinutes: 62,
      optimizedDelayMinutes: 24,
      delaySavedMinutes: 38,
      carbonSavedKg: 14.1,
      incentiveCreditsEarned: 120
    }
  ],
  signals: [
    {
      id: 'sig-cp-inner',
      name: 'Connaught Circus Junction 1',
      location: { lat: 28.6330, lng: 77.2190 },
      currentState: 'GREEN',
      cycleSeconds: 90,
      remainingSeconds: 45,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 1840, eastWest: 920 }
    },
    {
      id: 'sig-barakhamba',
      name: 'Barakhamba - Tolstoy Marg',
      location: { lat: 28.6280, lng: 77.2240 },
      currentState: 'RED',
      cycleSeconds: 75,
      remainingSeconds: 20,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 2100, eastWest: 1400 }
    },
    {
      id: 'sig-chelmsford',
      name: 'Chelmsford Road Crossing',
      location: { lat: 28.6410, lng: 77.2180 },
      currentState: 'YELLOW',
      cycleSeconds: 60,
      remainingSeconds: 5,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 1450, eastWest: 1100 }
    },
    {
      id: 'sig-janpath',
      name: 'Janpath - Windsor Place',
      location: { lat: 28.6180, lng: 77.2150 },
      currentState: 'GREEN',
      cycleSeconds: 80,
      remainingSeconds: 38,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 1600, eastWest: 1250 }
    },
    {
      id: 'sig-tolstoy',
      name: 'Tolstoy Marg Crossing',
      location: { lat: 28.6250, lng: 77.2210 },
      currentState: 'RED',
      cycleSeconds: 85,
      remainingSeconds: 22,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 1950, eastWest: 1100 }
    },
    {
      id: 'sig-mandi-house',
      name: 'Mandi House Circle Approach',
      location: { lat: 28.6258, lng: 77.2340 },
      currentState: 'YELLOW',
      cycleSeconds: 75,
      remainingSeconds: 6,
      preemptedByEmergency: false,
      aiAdaptiveEnabled: true,
      phaseVolume: { northSouth: 1720, eastWest: 1300 }
    }
  ],
  sosRequests: []
};

const loadPersistentStore = () => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      const defaultSignals = [...inMemoryStore.signals];
      Object.assign(inMemoryStore, saved);
      // Ensure all 6 core corridor signals exist in store
      if (Array.isArray(inMemoryStore.signals)) {
        for (const defSig of defaultSignals) {
          if (!inMemoryStore.signals.some(s => s.id === defSig.id)) {
            inMemoryStore.signals.push(defSig);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`[CityFlow DB] Could not load local store: ${error.message}`);
  }
};

export const persistStore = () => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryStore, null, 2));
  } catch (error) {
    console.error(`[CityFlow DB] Could not persist local store: ${error.message}`);
  }
};

loadPersistentStore();

export const getDbStatus = () => {
  const readyState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const maskedUri = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/:([^:@]{3,})@/, ':***@')
    : null;

  return {
    connectedToMongo: readyState === 1,
    state: states[readyState] || 'Unknown',
    mongoUri: maskedUri,
    localStoreActive: readyState !== 1,
    storeFile: STORE_FILE
  };
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚡ [CityFlow DB] No MONGODB_URI found. Initializing the durable local datastore.');
    console.log(`✅ [CityFlow DB] Local data file: ${STORE_FILE}`);
    return;
  }

  try {
    console.log(`📡 [CityFlow DB] Connecting to MongoDB (${uri.replace(/:([^:@]{3,})@/, ':***@')})...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ [CityFlow DB] Connected to MongoDB database successfully.');
  } catch (err) {
    console.warn('⚠️ [CityFlow DB] MongoDB connection could not be established: ' + err.message);
    console.log('🔄 [CityFlow DB] Auto-falling back to the durable local datastore.');
    console.log(`📁 [CityFlow DB] Local backup active: ${STORE_FILE}`);
  }
};

