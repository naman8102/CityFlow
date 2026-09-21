/**
 * CityFlow Public Transport Integration Service
 * 
 * Manages multimodal fleet shares across 6 layers:
 * 1. Metro (DMRC Interconnect)
 * 2. Bus (DTC Electric Fleet)
 * 3. Auto (Para-transit / Last-mile)
 * 4. Private vehicles (Cars & Two-wheelers)
 * 5. Freight (Commercial Logistics)
 * 6. Emergency (Ambulance & Fire priority)
 * 
 * Computes AI demand-responsive public transit recommendations:
 * Road congestion high -> Expected transit demand +34%
 * AI Recommendation: +4 buses deployed, peak interval compressed 10 min -> 6 min
 */

class PublicTransportService {
  constructor() {
    this.modalLayers = [
      {
        id: 'metro',
        name: 'Metro Rail',
        icon: 'Subway',
        modeSharePercent: 28,
        activeVehicles: 1450, // daily train trips / sets
        unit: 'Trips/Day',
        capacityLoadPercent: 88,
        status: 'HIGH_LOAD',
        line: 'DMRC Blue/Yellow Line Interchanges',
        hourlyPaxCapacity: 45000,
        color: '#3b82f6'
      },
      {
        id: 'bus',
        name: 'City Bus Transit',
        icon: 'Bus',
        modeSharePercent: 24,
        activeVehicles: 3200,
        unit: 'Active Buses',
        capacityLoadPercent: 86,
        status: 'SATURATED',
        line: 'DTC & Cluster Electric Fleet',
        hourlyPaxCapacity: 38000,
        color: '#10b981'
      },
      {
        id: 'auto',
        name: 'Auto / Para-transit',
        icon: 'Car',
        modeSharePercent: 14,
        activeVehicles: 8400,
        unit: 'Active Autos',
        capacityLoadPercent: 64,
        status: 'MODERATE',
        line: 'Last-Mile Station Feeder Mesh',
        hourlyPaxCapacity: 16800,
        color: '#f59e0b'
      },
      {
        id: 'private',
        name: 'Private Vehicles',
        icon: 'CarFront',
        modeSharePercent: 26,
        activeVehicles: 142000,
        unit: 'Personal Cars/Bikes',
        capacityLoadPercent: 92,
        status: 'CRITICAL',
        line: 'Arterial Road Saturation',
        hourlyPaxCapacity: 28000,
        color: '#ef4444'
      },
      {
        id: 'freight',
        name: 'Commercial Freight',
        icon: 'Truck',
        modeSharePercent: 6,
        activeVehicles: 1842,
        unit: 'Commercial Trucks',
        capacityLoadPercent: 78,
        status: 'ELEVATED',
        line: 'Heavy Industrial Corridors',
        hourlyPaxCapacity: 0,
        color: '#8b5cf6'
      },
      {
        id: 'emergency',
        name: 'Emergency Priority',
        icon: 'Siren',
        modeSharePercent: 2,
        activeVehicles: 34,
        unit: 'Active Responders',
        capacityLoadPercent: 40,
        status: 'OPTIMAL',
        line: 'CATS Ambulance & Fire Preemption',
        hourlyPaxCapacity: 0,
        color: '#06b6d4'
      }
    ];

    // Monitored corridors
    this.corridors = {
      'sector-62': {
        corridorId: 'sector-62',
        name: 'Sector-62 ↔ Noida Electronic City Metro Corridor',
        arterialCongestion: 84, // High congestion
        expectedDemandDeltaPercent: 34, // +34% demand surge
        currentBusCount: 12,
        currentIntervalMinutes: 10,
        recommendedAdditionalBuses: 4,
        recommendedIntervalMinutes: 6,
        isAugmented: false,
        lastAugmentedAt: null
      },
      'ring-road': {
        corridorId: 'ring-road',
        name: 'Ring Road Transit Trunk (Moolchand ↔ Ashram)',
        arterialCongestion: 88,
        expectedDemandDeltaPercent: 41,
        currentBusCount: 18,
        currentIntervalMinutes: 8,
        recommendedAdditionalBuses: 6,
        recommendedIntervalMinutes: 4.5,
        isAugmented: false,
        lastAugmentedAt: null
      },
      'connaught-place': {
        corridorId: 'connaught-place',
        name: 'Connaught Place Radial Transit Hub',
        arterialCongestion: 79,
        expectedDemandDeltaPercent: 26,
        currentBusCount: 14,
        currentIntervalMinutes: 7,
        recommendedAdditionalBuses: 3,
        recommendedIntervalMinutes: 5,
        isAugmented: false,
        lastAugmentedAt: null
      }
    };
  }

  /**
   * Get multimodal telemetry and dynamic AI recommendation
   */
  getTransitAnalysis(corridorId = 'sector-62') {
    const corridor = this.corridors[corridorId] || this.corridors['sector-62'];

    const activeBusCount = corridor.isAugmented 
      ? corridor.currentBusCount + corridor.recommendedAdditionalBuses 
      : corridor.currentBusCount;

    const activeIntervalMinutes = corridor.isAugmented 
      ? corridor.recommendedIntervalMinutes 
      : corridor.currentIntervalMinutes;

    return {
      corridorId: corridor.corridorId,
      corridorName: corridor.name,
      arterialCongestion: corridor.isAugmented ? Math.max(52, corridor.arterialCongestion - 16) : corridor.arterialCongestion,
      expectedDemandDeltaPercent: corridor.expectedDemandDeltaPercent, // +34%
      isAugmented: corridor.isAugmented,
      lastAugmentedAt: corridor.lastAugmentedAt,

      // Modal Split Layers
      modalLayers: this.modalLayers,

      // Transit Fleet Metrics
      fleetStatus: {
        activeBuses: activeBusCount,
        baselineBuses: corridor.currentBusCount,
        additionalBusesDeployed: corridor.isAugmented ? corridor.recommendedAdditionalBuses : 0,
        peakIntervalMinutes: activeIntervalMinutes,
        baselineIntervalMinutes: corridor.currentIntervalMinutes,
        metroLineSync: corridor.isAugmented ? 'SYNCHRONIZED (3.2 min headway)' : 'AUTONOMOUS (4.5 min headway)',
        autoFeederSync: corridor.isAugmented ? 'GEOFENCED (45 autos stationed at Gate 2)' : 'DISPERSED'
      },

      // AI Recommendation
      aiRecommendation: {
        trigger: 'Road Congestion High (Arterial 84%)',
        demandSurge: `+${corridor.expectedDemandDeltaPercent}%`,
        recommendationHeadline: `Deploy +${corridor.recommendedAdditionalBuses} buses · Compress peak interval ${corridor.currentIntervalMinutes} min → ${corridor.recommendedIntervalMinutes} min`,
        actions: [
          {
            id: 'deploy-buses',
            label: `+${corridor.recommendedAdditionalBuses} Electric Buses`,
            detail: `Inject +${corridor.recommendedAdditionalBuses} reserve low-floor electric buses into corridor loop`,
            status: corridor.isAugmented ? 'EXECUTED' : 'RECOMMENDED'
          },
          {
            id: 'compress-interval',
            label: `Peak Interval: ${corridor.currentIntervalMinutes} min → ${corridor.recommendedIntervalMinutes} min`,
            detail: `Compress service headway by 40% to absorb +${corridor.expectedDemandDeltaPercent}% commuter surge`,
            status: corridor.isAugmented ? 'EXECUTED' : 'RECOMMENDED'
          },
          {
            id: 'sync-metro',
            label: 'Metro Feeder Gate Synchronization',
            detail: 'Synchronize bus departure cycles with Metro train arrival pulses',
            status: corridor.isAugmented ? 'EXECUTED' : 'RECOMMENDED'
          },
          {
            id: 'geofence-autos',
            label: 'Last-Mile Auto Feeder Stand Redistribution',
            detail: 'Geofence 45 idle auto-rickshaws to metro station gate bays',
            status: corridor.isAugmented ? 'EXECUTED' : 'RECOMMENDED'
          }
        ],
        expectedImpact: {
          passengerThroughputPerHour: corridor.isAugmented ? '+3,850 pax/hr' : '+3,850 pax/hr',
          privateVehicleDiversionPercent: corridor.isAugmented ? '-19%' : '-19%',
          roadCongestionReductionPercent: corridor.isAugmented ? '↓ 15.2%' : '↓ 15.2%',
          commuterWaitTimeMinutes: corridor.isAugmented ? '10 min → 5.8 min' : '10 min → 5.8 min',
          co2AvertedKgDay: 1420
        }
      }
    };
  }

  /**
   * Apply AI public transit augmentation plan
   */
  applyTransitAugmentation(corridorId = 'sector-62') {
    const corridor = this.corridors[corridorId] || this.corridors['sector-62'];
    corridor.isAugmented = true;
    corridor.lastAugmentedAt = new Date().toISOString();

    return {
      success: true,
      message: `AI Transit Augmentation deployed for ${corridor.name}`,
      corridorId: corridor.corridorId,
      busesAdded: corridor.recommendedAdditionalBuses,
      newIntervalMinutes: corridor.recommendedIntervalMinutes,
      oldIntervalMinutes: corridor.currentIntervalMinutes,
      roadCongestionBefore: corridor.arterialCongestion,
      roadCongestionAfter: Math.max(52, corridor.arterialCongestion - 16),
      actuationChecklist: {
        additionalBusesDispatched: true,
        headwayCompressed: true,
        metroFeederSynced: true,
        autosGeofenced: true
      },
      appliedAt: corridor.lastAugmentedAt
    };
  }
}

export const publicTransportService = new PublicTransportService();
export default publicTransportService;
