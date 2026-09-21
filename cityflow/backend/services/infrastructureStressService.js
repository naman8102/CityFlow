import { inMemoryStore } from '../config/db.js';

export const InfrastructureStressService = {
  // In-memory relief state tracker
  _reliefStates: {
    'sector-62': false,
    'connaught-place': false,
    'ashram-flyover': false,
    'azadpur-mandi': false,
    'okhla-phase3': false
  },

  /**
   * Get infrastructure stress analysis for a specific zone or all zones
   */
  getZoneStress: (zoneId = 'sector-62') => {
    const isRelieved = InfrastructureStressService._reliefStates[zoneId] || false;

    // Sector-62 (Benchmark node requested by user)
    if (zoneId === 'sector-62') {
      const roadCapacity = isRelieved ? 72 : 91;
      const parkingPressure = isRelieved ? 68 : 87;
      const freightPressure = isRelieved ? 45 : 78;
      const evDemand = isRelieved ? 58 : 72;
      const bridgeLoad = isRelieved ? 64 : 84;
      const publicTransport = isRelieved ? 69 : 81;

      // Overall composite stress calculation
      const overallStress = isRelieved ? 64 : 86;

      return {
        success: true,
        zoneId: 'sector-62',
        zoneName: 'Sector-62 (Noida Commercial & Industrial Node)',
        cityRegion: 'East Metropolitan Corridor',
        coordinates: { lat: 28.6280, lng: 77.3649 },
        isRelieved,
        overallStress,
        stressStatus: isRelieved ? 'CONTROLLED / STABLE' : 'CRITICAL INFRASTRUCTURE BOTTLENECK',
        metrics: [
          { key: 'roadCapacity', label: 'Road Capacity', valuePercent: roadCapacity, status: roadCapacity > 85 ? 'CRITICAL' : 'ELEVATED', barColor: 'rose', description: 'V/C ratio on Model Town road approach' },
          { key: 'bridgeLoad', label: 'Bridge Load', valuePercent: bridgeLoad, status: bridgeLoad > 80 ? 'CRITICAL' : 'ELEVATED', barColor: 'amber', description: 'NH-24 elevated overpass structural queue' },
          { key: 'parkingPressure', label: 'Parking Pressure', valuePercent: parkingPressure, status: parkingPressure > 80 ? 'CRITICAL' : 'ELEVATED', barColor: 'rose', description: 'Commercial IT Park multi-level occupancy' },
          { key: 'evDemand', label: 'EV Demand', valuePercent: evDemand, status: evDemand > 70 ? 'WARNING' : 'STABLE', barColor: 'cyan', description: 'Fast-charging grid transformer peak draw' },
          { key: 'publicTransport', label: 'Public Transport', valuePercent: publicTransport, status: publicTransport > 80 ? 'CRITICAL' : 'ELEVATED', barColor: 'indigo', description: 'Metro feeder bus transit queue index' },
          { key: 'freightHub', label: 'Freight Hub', valuePercent: freightPressure, status: freightPressure > 70 ? 'WARNING' : 'STABLE', barColor: 'amber', description: 'Sector-62 logistics yard inbound queue' }
        ],
        aiRecommendations: [
          { id: 'rec-1', text: 'Shift freight → 11 PM–5 AM', action: 'OFF_PEAK_FREIGHT_WINDOW', impact: 'Cuts commercial yard congestion by -33%' },
          { id: 'rec-2', text: 'Increase signal throughput', action: 'SIGNAL_GREEN_EXTENSION', impact: 'Adds +18s green on NH-24 feeder signal' },
          { id: 'rec-3', text: 'Activate alternate route', action: 'BYPASS_DIVERSION', impact: 'Diverts 16% commuter traffic via Electronic City road' },
          { id: 'rec-4', text: 'Open secondary freight entry', action: 'SECONDARY_GATE_RELEASE', impact: 'Balances Gate #2 & Gate #3 truck queues' }
        ],
        timestamp: new Date().toISOString()
      };
    }

    // Generic fallback for other metropolitan zones
    const zoneNames = {
      'connaught-place': 'Connaught Place (Inner Core)',
      'ashram-flyover': 'Ashram Flyover & Ring Road',
      'azadpur-mandi': 'Azadpur Mandi Freight Terminal',
      'okhla-phase3': 'Okhla Phase-III Industrial Zone'
    };

    const overallStress = isRelieved ? 60 : 79;
    return {
      success: true,
      zoneId,
      zoneName: zoneNames[zoneId] || zoneId,
      cityRegion: 'Delhi NCR Metropolitan Grid',
      isRelieved,
      overallStress,
      stressStatus: isRelieved ? 'CONTROLLED / STABLE' : 'ELEVATED STRESS',
      metrics: [
        { key: 'roadCapacity', label: 'Road Capacity', valuePercent: isRelieved ? 68 : 84, status: 'ELEVATED', barColor: 'rose', description: 'Arterial lane volume' },
        { key: 'bridgeLoad', label: 'Bridge Load', valuePercent: isRelieved ? 60 : 76, status: 'STABLE', barColor: 'amber', description: 'Overpass weight index' },
        { key: 'parkingPressure', label: 'Parking Pressure', valuePercent: isRelieved ? 65 : 82, status: 'ELEVATED', barColor: 'rose', description: 'Curbside saturation' },
        { key: 'evDemand', label: 'EV Demand', valuePercent: isRelieved ? 52 : 68, status: 'STABLE', barColor: 'cyan', description: 'Substation charger draw' },
        { key: 'publicTransport', label: 'Public Transport', valuePercent: isRelieved ? 64 : 75, status: 'STABLE', barColor: 'indigo', description: 'Corridor bus frequency' },
        { key: 'freightHub', label: 'Freight Hub', valuePercent: isRelieved ? 42 : 70, status: 'STABLE', barColor: 'amber', description: 'Terminal gate queue' }
      ],
      aiRecommendations: [
        { id: 'rec-1', text: 'Shift freight → 11 PM–5 AM', action: 'OFF_PEAK_FREIGHT_WINDOW', impact: 'Relieves arterial lane pressure' },
        { id: 'rec-2', text: 'Increase signal throughput', action: 'SIGNAL_GREEN_EXTENSION', impact: 'Clears intersection queue buffer' },
        { id: 'rec-3', text: 'Activate alternate route', action: 'BYPASS_DIVERSION', impact: 'Reduces bottleneck v/c ratio' },
        { id: 'rec-4', text: 'Open secondary freight entry', action: 'SECONDARY_GATE_RELEASE', impact: 'Prevents spillback onto outer lanes' }
      ],
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Actuates the 4 AI recommendations to relieve infrastructure stress
   */
  applyReliefPlan: (zoneId = 'sector-62') => {
    InfrastructureStressService._reliefStates[zoneId] = true;

    // If live city metrics exist, also slightly relieve city congestion
    if (inMemoryStore.cityMetrics) {
      inMemoryStore.cityMetrics.cityCongestionIndex = Math.max(35, (inMemoryStore.cityMetrics.cityCongestionIndex || 64) - 4);
    }

    const updated = InfrastructureStressService.getZoneStress(zoneId);

    return {
      success: true,
      message: `Infrastructure relief plan executed for ${updated.zoneName}. Overall stress reduced from 86% to 64%.`,
      zoneId,
      stressBeforePercent: 86,
      stressAfterPercent: 64,
      deltaPercent: -22,
      actuatedChecklist: {
        freightShiftedToNight: true,
        signalThroughputIncreased: true,
        alternateRouteActivated: true,
        secondaryFreightGateOpened: true
      },
      updatedAnalysis: updated
    };
  },

  /**
   * Resets relief state for testing / demo reset
   */
  resetReliefPlan: (zoneId = 'sector-62') => {
    InfrastructureStressService._reliefStates[zoneId] = false;
    return InfrastructureStressService.getZoneStress(zoneId);
  }
};
