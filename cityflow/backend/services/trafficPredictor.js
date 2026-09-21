/**
 * CityFlow AI - Traffic Prediction & Optimization Engine
 * Implements:
 * 1. Bureau of Public Roads (BPR) Link Delay Formulation
 * 2. Multi-variable Congestion Risk Regressor
 * 3. Dynamic Webster-Inspired Green Split Phase Optimizer
 * 4. Freight Idle Carbon Footprint Estimation
 */

export class TrafficPredictor {
  /**
   * Calculates actual travel time using the Federal Highway Administration BPR function:
   * t = t0 * [1 + alpha * (V / C)^beta]
   *
   * @param {number} freeFlowMinutes - Free-flow baseline travel time (t0)
   * @param {number} volume - Current traffic flow (vehicles per hour)
   * @param {number} capacity - Practical road capacity (vehicles per hour)
   * @param {number} alpha - BPR calibration parameter (default 0.15)
   * @param {number} beta - BPR power exponent (default 4.0)
   * @returns {object} { travelTimeMinutes, delayMinutes, volumeCapacityRatio, levelOfService }
   */
  static calculateBPRDelay(freeFlowMinutes, volume, capacity, alpha = 0.15, beta = 4.0) {
    const vcRatio = Math.max(0.1, volume / Math.max(capacity, 1));
    const congestionFactor = 1 + alpha * Math.pow(vcRatio, beta);
    const actualTravelTime = freeFlowMinutes * congestionFactor;
    const delayMinutes = Math.max(0, actualTravelTime - freeFlowMinutes);

    // Highway Capacity Manual (HCM) Level of Service (LOS) grade: A through F
    let los = 'A';
    if (vcRatio > 1.15) los = 'F (System Breakdown)';
    else if (vcRatio > 0.95) los = 'E (Unstable Flow)';
    else if (vcRatio > 0.80) los = 'D (Approaching Capacity)';
    else if (vcRatio > 0.65) los = 'C (Stable Flow)';
    else if (vcRatio > 0.45) los = 'B (Reasonably Free Flow)';
    else los = 'A (Free Flow)';

    return {
      travelTimeMinutes: Number(actualTravelTime.toFixed(1)),
      delayMinutes: Number(delayMinutes.toFixed(1)),
      volumeCapacityRatio: Number(vcRatio.toFixed(2)),
      levelOfService: los
    };
  }

  /**
   * Multi-variable Congestion Risk Regressor
   * Evaluates congestion likelihood score (0 - 100%)
   */
  static predictCongestionRisk({
    hourOfDay = new Date().getHours(),
    volume = 1200,
    capacity = 1800,
    weatherCondition = 'CLEAR', // 'CLEAR', 'RAIN', 'FOG', 'STORM'
    activeIncidents = 0
  }) {
    // Peak hour wave function (Peaks typically around 08:30-10:30 & 17:30-20:30)
    let timePeakFactor = 0.2;
    if ((hourOfDay >= 8 && hourOfDay <= 11) || (hourOfDay >= 17 && hourOfDay <= 21)) {
      timePeakFactor = 0.85;
    } else if (hourOfDay >= 12 && hourOfDay <= 16) {
      timePeakFactor = 0.45;
    }

    const weatherMultipliers = {
      CLEAR: 1.0,
      RAIN: 1.35,
      FOG: 1.25,
      STORM: 1.6
    };
    const weatherFactor = weatherMultipliers[weatherCondition] || 1.0;

    const baseRatio = volume / Math.max(capacity, 1);
    const incidentImpact = activeIncidents * 0.12;

    // Regression formula
    const rawRisk = (baseRatio * 0.45 + timePeakFactor * 0.35 + incidentImpact) * weatherFactor;
    const normalizedRisk = Math.min(99, Math.max(5, Math.round(rawRisk * 100)));

    let riskBand = 'LOW';
    if (normalizedRisk >= 75) riskBand = 'CRITICAL';
    else if (normalizedRisk >= 55) riskBand = 'HIGH';
    else if (normalizedRisk >= 35) riskBand = 'MODERATE';

    return {
      riskPercentage: normalizedRisk,
      riskBand,
      isPeakHour: timePeakFactor > 0.6,
      recommendation: normalizedRisk > 60 
        ? 'Shift heavy freight and adjust green phase timing on primary arterial corridor.'
        : 'Traffic flow is optimal. Standard signal cycle maintained.'
    };
  }

  /**
   * Webster-style Dynamic Signal Cycle Optimizer
   * Recalculates North-South vs East-West green splits to equalize saturation degree
   */
  static optimizeSignalSplit(cycleLength, volumeNS, volumeEW, isEmergencyPreempted = false) {
    if (isEmergencyPreempted) {
      return {
        mode: 'EMERGENCY_CORRIDOR_PREEMPTION',
        nsGreenSeconds: cycleLength - 8,
        ewGreenSeconds: 4,
        yellowSeconds: 4,
        cycleLength,
        status: 'CORRIDOR_LOCKED_GREEN'
      };
    }

    const totalVolume = Math.max(volumeNS + volumeEW, 100);
    const lostTime = 8; // Yellow + All-Red clearance
    const availableGreen = Math.max(cycleLength - lostTime, 20);

    const nsProportion = volumeNS / totalVolume;
    const nsGreen = Math.max(15, Math.min(availableGreen - 15, Math.round(availableGreen * nsProportion)));
    const ewGreen = availableGreen - nsGreen;

    return {
      mode: 'AI_ADAPTIVE_BALANCING',
      nsGreenSeconds: nsGreen,
      ewGreenSeconds: ewGreen,
      yellowSeconds: 4,
      cycleLength,
      efficiencyGainPercent: Number(((Math.abs(volumeNS - volumeEW) / totalVolume) * 22).toFixed(1))
    };
  }

  /**
   * Estimates fuel and carbon savings when commercial trucks shift off-peak
   */
  static calculateLogisticsSavings(tonnage, delaySavedMinutes) {
    // Diesel truck average idle burn = 2.4 liters/hour
    // Carbon per liter of diesel = 2.68 kg CO2
    const idleFuelSavedLiters = (delaySavedMinutes / 60) * (2.4 + tonnage * 0.08);
    const carbonSavedKg = idleFuelSavedLiters * 2.68;
    const fuelCostSavedINR = idleFuelSavedLiters * 92.5; // Avg diesel price in INR

    return {
      fuelSavedLiters: Number(idleFuelSavedLiters.toFixed(2)),
      carbonSavedKg: Number(carbonSavedKg.toFixed(2)),
      costSavedINR: Math.round(fuelCostSavedINR),
      recommendedOffPeakWindow: '11:00 AM - 03:30 PM (or Post 21:30 PM)'
    };
  }
}
