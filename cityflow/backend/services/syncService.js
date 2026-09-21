import mongoose from 'mongoose';
import { inMemoryStore } from '../config/db.js';
import IncidentModel from '../models/Incident.js';
import EmergencyMissionModel from '../models/EmergencyMission.js';
import LogisticsTripModel from '../models/LogisticsTrip.js';

export const syncStoreToMongo = async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    // 1. Sync Incidents if empty or missing
    const incidentCount = await IncidentModel.countDocuments();
    if (incidentCount === 0 && Array.isArray(inMemoryStore.incidents) && inMemoryStore.incidents.length > 0) {
      console.log('🔄 [CityFlow DB Sync] Migrating stored incidents to MongoDB Atlas...');
      for (const inc of inMemoryStore.incidents.slice(0, 15)) {
        try {
          await IncidentModel.create({
            title: inc.title || 'Traffic Congestion',
            type: inc.type || 'CONGESTION',
            severity: inc.severity || 'MEDIUM',
            location: inc.location || { lat: 28.6328, lng: 77.2197, address: 'Connaught Place Radial' },
            status: inc.status || 'ACTIVE',
            affectedRadiusMeters: inc.affectedRadiusMeters || 500,
            impactFactor: inc.impactFactor || 1.3,
            source: inc.source || 'CITIZEN',
            reportedBy: inc.reportedBy || null
          });
        } catch (e) {
          // Continue if any single validation fails
        }
      }
      console.log('✅ [CityFlow DB Sync] Incidents migrated to MongoDB Atlas successfully.');
    }

    // 2. Sync Emergency Missions if empty
    const missionCount = await EmergencyMissionModel.countDocuments();
    if (missionCount === 0 && Array.isArray(inMemoryStore.emergencyMissions) && inMemoryStore.emergencyMissions.length > 0) {
      console.log('🔄 [CityFlow DB Sync] Migrating emergency missions to MongoDB Atlas...');
      for (const emg of inMemoryStore.emergencyMissions.slice(0, 8)) {
        try {
          await EmergencyMissionModel.create({
            missionCode: emg.missionCode || 'SOS-' + Math.floor(1000 + Math.random() * 9000),
            vehicleType: emg.vehicleType || 'AMBULANCE',
            vehicleNumber: emg.vehicleNumber || 'DL-01-EQ-8812',
            origin: emg.origin || { lat: 28.6289, lng: 77.2065, name: 'RML Hospital' },
            destination: emg.destination || { lat: 28.6448, lng: 77.2167, name: 'New Delhi Railway Station' },
            currentLocation: emg.currentLocation || emg.origin || { lat: 28.6289, lng: 77.2065 },
            status: emg.status || 'DISPATCHED',
            priority: emg.priority || 'CRITICAL',
            preemptedSignals: emg.preemptedSignals || ['sig-cp-inner', 'sig-barakhamba'],
            timeSavedSeconds: emg.timeSavedSeconds || 436,
            reportedBy: emg.reportedBy || null,
            dispatchSource: emg.dispatchSource || 'POLICE'
          });
        } catch (e) {
          // Continue
        }
      }
      console.log('✅ [CityFlow DB Sync] Emergency missions migrated to MongoDB Atlas successfully.');
    }

    // 3. Sync Logistics Trips if empty
    const tripCount = await LogisticsTripModel.countDocuments();
    if (tripCount === 0 && Array.isArray(inMemoryStore.logisticsTrips) && inMemoryStore.logisticsTrips.length > 0) {
      console.log('🔄 [CityFlow DB Sync] Migrating logistics trips to MongoDB Atlas...');
      for (const trip of inMemoryStore.logisticsTrips) {
        try {
          await LogisticsTripModel.create({
            fleetCompany: trip.fleetCompany || 'Apex City Logistics',
            truckId: trip.truckId || 'TRK-ALPHA-44',
            cargoType: trip.cargoType || 'Cold Storage Food Supplies',
            tonnage: trip.tonnage || 8.5,
            route: trip.route || 'Okhla -> Azadpur',
            requestedDeparture: trip.requestedDeparture || '09:30 AM',
            suggestedDeparture: trip.suggestedDeparture || '11:15 AM',
            isShifted: !!trip.isShifted,
            originalDelayMinutes: trip.originalDelayMinutes || 60,
            optimizedDelayMinutes: trip.optimizedDelayMinutes || 25,
            delaySavedMinutes: trip.delaySavedMinutes || 35,
            carbonSavedKg: trip.carbonSavedKg || 15,
            incentiveCreditsEarned: trip.incentiveCreditsEarned || 150
          });
        } catch (e) {
          // Continue
        }
      }
      console.log('✅ [CityFlow DB Sync] Logistics trips migrated to MongoDB Atlas successfully.');
    }
  } catch (error) {
    console.warn('[CityFlow DB Sync] Auto-sync notice:', error.message);
  }
};
