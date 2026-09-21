import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, inMemoryStore, persistStore } from './config/db.js';
import simulationRoutes from './routes/simulationRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import authRoutes from './routes/authRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import { TrafficIngestionService } from './services/trafficIngestionService.js';
import { seedDefaultUsers } from './services/authService.js';
import { EmergencyDAO } from './models/EmergencyMission.js';
import { syncStoreToMongo } from './services/syncService.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// System Health & Telemetry
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'CityFlow AI — Urban Mobility Intelligence',
    event: 'Smart India Hackathon 2026 (SIH 2026)',
    problemStatement: 'SIH26205',
    team: 'NEURALKNIGHTS',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/simulation', simulationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/sos', sosRoutes);

// Background Live Traffic & Signal Simulation Engine
// Updates signal countdowns and transitions phases every 2 seconds
setInterval(() => {
  inMemoryStore.signals.forEach(signal => {
    if (signal.preemptedByEmergency) {
      // Hold green during emergency corridor but countdown timer
      signal.currentState = 'GREEN';
      signal.remainingSeconds = Math.max(1, signal.remainingSeconds - 2);
      return;
    }

    signal.remainingSeconds -= 2;
    if (signal.remainingSeconds <= 0) {
      if (signal.currentState === 'GREEN') {
        signal.currentState = 'YELLOW';
        signal.remainingSeconds = 4;
      } else if (signal.currentState === 'YELLOW') {
        signal.currentState = 'RED';
        signal.remainingSeconds = Math.round(signal.cycleSeconds * 0.45);
      } else {
        signal.currentState = 'GREEN';
        signal.remainingSeconds = Math.round(signal.cycleSeconds * 0.5);
      }
    }
  });

  // Micro-simulate active emergency vehicle moving along coordinates
  inMemoryStore.emergencyMissions.forEach(m => {
    if (m.status === 'EN_ROUTE' || m.status === 'DISPATCHED') {
      if (!m.currentLocation || !m.destination) return;

      const remainingLat = m.destination.lat - m.currentLocation.lat;
      const remainingLng = m.destination.lng - m.currentLocation.lng;
      const distDegrees = Math.hypot(remainingLat, remainingLng);

      // Check waypoint progression or destination arrival
      let hasArrived = false;
      if (Array.isArray(m.waypoints) && m.waypoints.length > 0) {
        m.waypointIndex = (m.waypointIndex || 0) + 7; // Progress ~7 waypoints every 2 sec (~15-20 sec arrival)
        if (m.waypointIndex >= m.waypoints.length - 1) {
          const lastPoint = m.waypoints[m.waypoints.length - 1];
          m.currentLocation = { lat: lastPoint[0], lng: lastPoint[1] };
          hasArrived = true;
        } else {
          const pt = m.waypoints[m.waypointIndex];
          m.currentLocation = { lat: pt[0], lng: pt[1] };
          EmergencyDAO.updateLocation(m._id, m.currentLocation).catch(() => {});
        }
      } else if (distDegrees < 0.001) {
        m.currentLocation.lat = m.destination.lat;
        m.currentLocation.lng = m.destination.lng;
        hasArrived = true;
      } else {
        // Step forward towards destination at constant speed so it never stalls asymptotically
        const stepSize = Math.max(0.002, distDegrees * 0.2);
        const ratio = Math.min(1, stepSize / distDegrees);
        m.currentLocation.lat += remainingLat * ratio;
        m.currentLocation.lng += remainingLng * ratio;
        EmergencyDAO.updateLocation(m._id, m.currentLocation).catch(() => {});
      }

      if (hasArrived) {
        m.status = 'ARRIVED';
        m.arrivedAt = new Date().toISOString();

        // Release corridor preempted signals back to their preserved state
        inMemoryStore.signals.forEach(sig => {
          if (sig.preemptedByEmergency) {
            sig.preemptedByEmergency = false;
            if (sig.previousState) {
              sig.currentState = sig.previousState.currentState || 'GREEN';
              sig.remainingSeconds = sig.previousState.remainingSeconds || Math.round(sig.cycleSeconds * 0.5);
              delete sig.previousState;
            } else {
              sig.remainingSeconds = Math.round(sig.cycleSeconds * 0.5);
            }
          }
        });
        persistStore();

        EmergencyDAO.complete(m._id).catch(() => {});
      }
    }
  });
}, 2000);

// Persist local telemetry snapshots so traffic history remains available for analysis.
setInterval(() => {
  TrafficIngestionService.recordSystemSnapshot().catch(error => {
    console.error('[Traffic ingestion] Snapshot failed:', error.message);
  });
}, 30000);

// Initialize DB and Start Server
connectDB().then(async () => {
  try {
    await seedDefaultUsers();
    await syncStoreToMongo();
  } catch (e) {
    console.warn('[CityFlow Auth/Sync] Notice on startup:', e.message);
  }
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CityFlow AI Backend Server running on port ${port}`);
      console.log(`🎯 SIH 2026 | PS Code: SIH26205 | Team: NEURALKNIGHTS`);
      console.log(`📡 Health Check: http://localhost:${port}/api/health`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is in use, attempting port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(Number(PORT));
});
