import { inMemoryStore } from '../config/db.js';
import { LogisticsDAO } from '../models/LogisticsTrip.js';
import { TrafficPredictor } from '../services/trafficPredictor.js';
import { LogisticsTrafficBridgeService } from '../services/logisticsTrafficBridgeService.js';

export const LogisticsController = {
  /**
   * Scenario D: Logistics Freight Load Shifting & Slot Optimization
   */
  optimizeFleetSchedule: async (req, res) => {
    try {
      const { 
        fleetCompany = 'Apex City Logistics',
        truckId = 'TRK-ALPHA-44',
        cargoType = 'Industrial Goods',
        tonnage = 7.5,
        route = 'Okhla Industrial Area -> Azadpur Mandi',
        requestedHour = 9.0 // Peak surge hour
      } = req.body;

      // Peak hour penalty calculation
      const peakDelayMinutes = Math.round(55 + tonnage * 2.8);
      const offPeakDelayMinutes = Math.round(18 + tonnage * 0.9);
      const delaySavedMinutes = peakDelayMinutes - offPeakDelayMinutes;

      const savings = TrafficPredictor.calculateLogisticsSavings(tonnage, delaySavedMinutes);
      const incentiveCredits = Math.round(delaySavedMinutes * 3.5);

      const trip = await LogisticsDAO.create({
        fleetCompany,
        truckId,
        cargoType,
        tonnage,
        route,
        requestedDeparture: `${Math.floor(requestedHour)}:00 AM (Peak Surge Window)`,
        suggestedDeparture: '11:30 AM (CityFlow Recommended Slot)',
        isShifted: true,
        originalDelayMinutes: peakDelayMinutes,
        optimizedDelayMinutes: offPeakDelayMinutes,
        delaySavedMinutes,
        carbonSavedKg: savings.carbonSavedKg,
        incentiveCreditsEarned: incentiveCredits
      });

      return res.status(201).json({
        success: true,
        scenario: 'SCENARIO_D_LOGISTICS_LOAD_SHIFTING',
        message: 'Commercial freight departure slot shifted off-peak. Network capacity balanced.',
        trip,
        savings,
        networkImpact: {
          peakCorridorReliefVehiclesPerHour: -1,
          peakCapacityFreedPercent: '4.2%',
          carbonMitigatedKg: savings.carbonSavedKg,
          fuelCostSavingsINR: savings.costSavedINR,
          driverFatigueReductionIndex: 'High'
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Get all logistics trips
   */
  getAllTrips: async (req, res) => {
    try {
      const trips = await LogisticsDAO.findAll();
      const totalCarbonSaved = trips.reduce((acc, t) => acc + (t.isShifted ? t.carbonSavedKg : 0), 0);
      const totalDelaySaved = trips.reduce((acc, t) => acc + (t.isShifted ? t.delaySavedMinutes : 0), 0);

      return res.status(200).json({
        success: true,
        trips,
        aggregateStats: {
          totalTrips: trips.length,
          shiftedTripsCount: trips.filter(t => t.isShifted).length,
          totalCarbonSavedKg: Number(totalCarbonSaved.toFixed(1)),
          totalDelaySavedHours: Number((totalDelaySaved / 60).toFixed(1)),
          complianceRatePercent: Math.round((trips.filter(t => t.isShifted).length / Math.max(trips.length, 1)) * 100)
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Toggle load shifting state for a freight vehicle
   */
  toggleShiftState: async (req, res) => {
    try {
      const { tripId } = req.params;
      const updated = await LogisticsDAO.toggleShift(tripId);
      return res.status(200).json({
        success: true,
        message: updated.isShifted ? 'Trip shifted off-peak.' : 'Trip restored to peak schedule.',
        trip: updated
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * AI Logistics-to-Traffic Bridge: Correlate city congestion with freight demand
   */
  getTrafficCorrelation: async (req, res) => {
    try {
      const data = await LogisticsTrafficBridgeService.getTrafficCorrelationAnalysis();
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * AI Logistics-to-Traffic Bridge: Actuate AI freight time-shifting plan (10:00 AM -> 11:30 PM)
   */
  applyAITimeShift: async (req, res) => {
    try {
      const result = await LogisticsTrafficBridgeService.applyAITimeShiftPlan();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

