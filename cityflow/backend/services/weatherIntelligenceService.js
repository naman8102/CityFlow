import { inMemoryStore, persistStore } from '../config/db.js';

/**
 * CityFlow AI - Weather Intelligence Service
 * Drives the causal chain:
 * Weather → Traffic Prediction → Signal Decision → Route Decision
 */
export class WeatherIntelligenceService {
  static activeCondition = 'CLEAR';

  static weatherProfiles = {
    CLEAR: {
      condition: 'CLEAR',
      name: 'Normal / Clear Sky',
      icon: 'Sun',
      precipitationProbability: 10,
      averageSpeedKmph: 42,
      baselineSpeedKmph: 42,
      expectedTrafficImpactPercent: 0,
      roadCapacityFactor: 1.0,
      effectiveCapacityVPH: 1800,
      nominalCapacityVPH: 1800,
      signalClearanceSeconds: 4.0,
      baselineClearanceSeconds: 4.0,
      logisticsWarning: 'Optimal conditions. Standard delivery schedules maintained.',
      emergencyETABufferMinutes: 0.0,
      causalChain: {
        step1_weather: 'Normal Weather Detected (10% Precipitation)',
        step2_trafficPrediction: 'Nominal traffic flow. Average arterial speed 42 km/h. Road capacity 1,800 vph.',
        step3_signalDecision: 'Standard 4.0s yellow clearance cycle maintained across all intersections.',
        step4_routeDecision: 'Direct primary arterials operating without weather impedance penalties.'
      }
    },
    RAIN: {
      condition: 'RAIN',
      name: 'Heavy Monsoon Rain',
      icon: 'CloudRain',
      precipitationProbability: 78,
      averageSpeedKmph: 27,
      baselineSpeedKmph: 42,
      expectedTrafficImpactPercent: 23,
      roadCapacityFactor: 0.75,
      effectiveCapacityVPH: 1350,
      nominalCapacityVPH: 1800,
      signalClearanceSeconds: 6.0,
      baselineClearanceSeconds: 4.0,
      logisticsWarning: '⚠️ Waterlogging hazard at Minto Bridge & Tilak Bridge underpasses. Speed capped at 35 km/h. +18 min buffer applied to schedules.',
      emergencyETABufferMinutes: 2.5,
      causalChain: {
        step1_weather: 'Heavy Rain Detected (78% Probability)',
        step2_trafficPrediction: 'Road capacity drops to 1,350 vph (-25%). Average speed drops 42 → 27 km/h (+23% congestion impact).',
        step3_signalDecision: 'Signal clearance time increased 4.0s → 6.0s (+50%) for wet tarmac braking distance.',
        step4_routeDecision: 'Bypass flood-prone underpasses; warn logistics fleet & recalculate emergency ETA.'
      }
    },
    FOG: {
      condition: 'FOG',
      name: 'Dense Winter Fog',
      icon: 'CloudFog',
      precipitationProbability: 40,
      averageSpeedKmph: 31,
      baselineSpeedKmph: 42,
      expectedTrafficImpactPercent: 16,
      roadCapacityFactor: 0.82,
      effectiveCapacityVPH: 1475,
      nominalCapacityVPH: 1800,
      signalClearanceSeconds: 5.5,
      baselineClearanceSeconds: 4.0,
      logisticsWarning: '⚠️ Low visibility (<150m). Commercial convoy speed capped at 40 km/h.',
      emergencyETABufferMinutes: 1.8,
      causalChain: {
        step1_weather: 'Dense Fog Detected (Visibility <150m)',
        step2_trafficPrediction: 'Approach speeds drop to 31 km/h. Expected traffic impact +16%.',
        step3_signalDecision: 'Signal clearance extended to 5.5s with high-contrast LED strobes enabled.',
        step4_routeDecision: 'Route navigation shifts commuters toward illuminated arterial corridors.'
      }
    },
    STORM: {
      condition: 'STORM',
      name: 'Severe Thunderstorm',
      icon: 'CloudLightning',
      precipitationProbability: 94,
      averageSpeedKmph: 22,
      baselineSpeedKmph: 42,
      expectedTrafficImpactPercent: 38,
      roadCapacityFactor: 0.65,
      effectiveCapacityVPH: 1170,
      nominalCapacityVPH: 1800,
      signalClearanceSeconds: 7.0,
      baselineClearanceSeconds: 4.0,
      logisticsWarning: '🛑 High wind & downpour. Heavy trucks instructed to hold at staging depots.',
      emergencyETABufferMinutes: 4.2,
      causalChain: {
        step1_weather: 'Severe Thunderstorm Active (94% Probability)',
        step2_trafficPrediction: 'Speeds drop to 22 km/h. Arterial congestion surge +38%. Capacity -35%.',
        step3_signalDecision: 'Maximum safety clearance: 7.0s all-red clearance intervals actuated.',
        step4_routeDecision: 'Freight temporarily held. Dynamic emergency routing prioritized on elevated flyovers.'
      }
    }
  };

  /**
   * Get Live Weather State and Impact Analysis
   */
  static getCurrentState() {
    const profile = this.weatherProfiles[this.activeCondition] || this.weatherProfiles.CLEAR;
    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...profile
    };
  }

  /**
   * Set Weather Condition and Actuate Across Signals and Mobility Mesh
   */
  static setCondition(condition = 'CLEAR') {
    const norm = (condition || 'CLEAR').toUpperCase();
    this.activeCondition = this.weatherProfiles[norm] ? norm : 'CLEAR';
    const profile = this.weatherProfiles[this.activeCondition];

    // Actuate on in-memory store signals: adjust yellow/clearance duration
    if (Array.isArray(inMemoryStore.signals)) {
      inMemoryStore.signals.forEach(sig => {
        sig.weatherCondition = this.activeCondition;
        sig.clearanceSeconds = profile.signalClearanceSeconds;
        // If signal is yellow, ensure remaining seconds respect wet clearance
        if (sig.currentState === 'YELLOW') {
          sig.remainingSeconds = Math.round(profile.signalClearanceSeconds);
        }
      });
      persistStore();
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: `Weather intelligence updated to ${profile.name}. Causal chain actuated.`,
      ...profile
    };
  }
}
