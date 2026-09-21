/**
 * CityFlow AI - Predictive Incident & Preventive Safety Shield Service
 * 
 * Transforms CityFlow from a Reactive (post-incident) response engine
 * into a Predictive + Preventive Safety Shield that identifies collision
 * and gridlock risks BEFORE they occur.
 * 
 * Evaluates 5 core spatial hazard dimensions:
 * 1. High congestion (V/C ratio & spillback queue)
 * 2. Low speed variance / abrupt shockwave deceleration
 * 3. Heavy vehicle concentration (Freight truck mix with light vehicles)
 * 4. Rain & wet road friction coefficient
 * 5. Poor visibility (Fog/smog atmospheric sensor)
 * 
 * Generates 4 automated Preventive Actions:
 * 1. Reduce inflow (Upstream ramp metering)
 * 2. Alert patrol (Pre-deploy Highway Interceptor Police)
 * 3. Reduce heavy vehicles (Divert non-essential commercial freight)
 * 4. Adjust signals (Harmonize green wave & extend clearance intervals)
 */

class IncidentPredictionService {
  constructor() {
    this.corridors = {
      'nh-24': {
        corridorId: 'nh-24',
        name: 'NH-24 Express Corridor (Ghazipur ↔ Mayur Vihar)',
        baselineRiskPercent: 87,
        currentRiskPercent: 87,
        riskLevel: 'CRITICAL_HAZARD',
        isPrevented: false,
        preventedAt: null,
        reasons: [
          {
            id: 'congestion',
            title: 'High Congestion',
            metric: 'V/C = 1.34 · 88% Capacity',
            severity: 'CRITICAL',
            description: 'Approaching saturation creates dense vehicle bunching and zero recovery space.'
          },
          {
            id: 'speed_variance',
            title: 'Low Speed Variance',
            metric: 'Compression Shockwaves (48 → 11 km/h in 150m)',
            severity: 'CRITICAL',
            description: 'Sudden erratic braking ripples back into trailing traffic, multiplying rear-end crash risk.'
          },
          {
            id: 'heavy_vehicles',
            title: 'Heavy Vehicle Concentration',
            metric: '26% Multi-Axle Freight Share',
            severity: 'HIGH',
            description: 'Mixed heavy commercial trucks with two-wheelers creates high kinetic blindspot hazard.'
          },
          {
            id: 'rain',
            title: 'Rain & Wet Pavement Friction',
            metric: 'Friction Coefficient μ = 0.38 · Headway +45%',
            severity: 'HIGH',
            description: 'Reduced tire adhesion extends wet stopping distances significantly.'
          },
          {
            id: 'visibility',
            title: 'Poor Visibility',
            metric: 'Visibility < 250m (Smog / Mist)',
            severity: 'MODERATE',
            description: 'Reduced optical horizon restricts driver reaction and hazard recognition time.'
          }
        ],
        preventiveActions: [
          {
            id: 'action-inflow',
            key: 'REDUCE_INFLOW',
            title: 'Reduce Inflow',
            detail: 'Throttle upstream feeder meters by -24% to buffer corridor vehicle density',
            agency: 'TRAFFIC_CONTROL',
            status: 'PENDING'
          },
          {
            id: 'action-patrol',
            key: 'ALERT_PATROL',
            title: 'Alert Patrol',
            detail: 'Pre-deploy Traffic Interceptor Unit #07 to Ghazipur elevated section for visual deterrence',
            agency: 'POLICE_HIGHWAY_PATROL',
            status: 'PENDING'
          },
          {
            id: 'action-freight',
            key: 'REDUCE_HEAVY_VEHICLES',
            title: 'Reduce Heavy Vehicles',
            detail: 'Broadcast dynamic VMS detour shifting non-perishable freight > 7.5T to Eastern Peripheral bypass',
            agency: 'LOGISTICS_DAO',
            status: 'PENDING'
          },
          {
            id: 'action-signals',
            key: 'ADJUST_SIGNALS',
            title: 'Adjust Signals',
            detail: 'Extend green wave progression +14s and add +2.5s amber clearance to smooth stop-and-go shockwaves',
            agency: 'AI_SIGNAL_MESH',
            status: 'PENDING'
          }
        ],
        expectedImpact: {
          riskDrop: '87% → 32%',
          potentialCrashesAverted: '2-3 estimated in next 45 min',
          speedSmoothingDelta: '+18 km/h stabilized flow',
          secondaryGridlockRisk: 'ELIMINATED'
        }
      },

      'ashram-flyover': {
        corridorId: 'ashram-flyover',
        name: 'Ring Road Ashram Flyover Descent',
        baselineRiskPercent: 74,
        currentRiskPercent: 74,
        riskLevel: 'HIGH_HAZARD',
        isPrevented: false,
        preventedAt: null,
        reasons: [
          {
            id: 'congestion',
            title: 'High Congestion',
            metric: 'V/C = 1.18 · 79% Capacity',
            severity: 'HIGH',
            description: 'Merge bottleneck where flyover traffic meets surface arterial.'
          },
          {
            id: 'speed_variance',
            title: 'Low Speed Variance',
            metric: 'Abrupt deceleration at descent slip-road',
            severity: 'HIGH',
            description: 'Inflow merging with stationary surface queues.'
          },
          {
            id: 'heavy_vehicles',
            title: 'Heavy Vehicle Concentration',
            metric: '18% Freight Share',
            severity: 'MODERATE',
            description: 'Commercial delivery vans competing for lane position.'
          },
          {
            id: 'rain',
            title: 'Rain & Wet Pavement Friction',
            metric: 'Drizzle telemetry active',
            severity: 'MODERATE',
            description: 'Slick concrete bridge deck descent.'
          },
          {
            id: 'visibility',
            title: 'Poor Visibility',
            metric: 'Visibility ~400m',
            severity: 'LOW',
            description: 'Overcast skies.'
          }
        ],
        preventiveActions: [
          {
            id: 'action-inflow',
            key: 'REDUCE_INFLOW',
            title: 'Reduce Inflow',
            detail: 'Throttle flyover ingress by -18%',
            agency: 'TRAFFIC_CONTROL',
            status: 'PENDING'
          },
          {
            id: 'action-patrol',
            key: 'ALERT_PATROL',
            title: 'Alert Patrol',
            detail: 'Deploy motorcycle patrol unit #14 at descent merge',
            agency: 'POLICE_HIGHWAY_PATROL',
            status: 'PENDING'
          },
          {
            id: 'action-freight',
            key: 'REDUCE_HEAVY_VEHICLES',
            title: 'Reduce Heavy Vehicles',
            detail: 'Restrict commercial vehicles to far-left lane',
            agency: 'LOGISTICS_DAO',
            status: 'PENDING'
          },
          {
            id: 'action-signals',
            key: 'ADJUST_SIGNALS',
            title: 'Adjust Signals',
            detail: 'Extend Ashram surface intersection green +12s',
            agency: 'AI_SIGNAL_MESH',
            status: 'PENDING'
          }
        ],
        expectedImpact: {
          riskDrop: '74% → 28%',
          potentialCrashesAverted: '1-2 estimated',
          speedSmoothingDelta: '+14 km/h stabilized flow',
          secondaryGridlockRisk: 'ELIMINATED'
        }
      }
    };
  }

  /**
   * Get accident risk prediction and causal breakdown for corridor
   */
  getRiskAnalysis(corridorId = 'nh-24') {
    const corridor = this.corridors[corridorId] || this.corridors['nh-24'];
    
    return {
      corridorId: corridor.corridorId,
      name: corridor.name,
      riskPercent: corridor.currentRiskPercent,
      baselineRiskPercent: corridor.baselineRiskPercent,
      riskLevel: corridor.isPrevented ? 'STABLE_GREEN' : corridor.riskLevel,
      isPrevented: corridor.isPrevented,
      preventedAt: corridor.preventedAt,
      paradigmShift: {
        from: 'Reactive (Acting AFTER crash occurs)',
        to: 'Predictive + Preventive (Eliminating hazard BEFORE occurrence)'
      },
      reasons: corridor.reasons,
      preventiveActions: corridor.preventiveActions.map(action => ({
        ...action,
        status: corridor.isPrevented ? 'EXECUTED' : 'PENDING'
      })),
      expectedImpact: corridor.expectedImpact
    };
  }

  /**
   * Execute 4-point autonomous preventive intervention plan
   */
  applyPreventivePlan(corridorId = 'nh-24') {
    const corridor = this.corridors[corridorId] || this.corridors['nh-24'];
    corridor.isPrevented = true;
    corridor.currentRiskPercent = 32; // Crushed down to 32%
    corridor.preventedAt = new Date().toISOString();

    return {
      success: true,
      message: `Preventive Safety Plan executed for ${corridor.name}. Crash probability reduced from ${corridor.baselineRiskPercent}% to ${corridor.currentRiskPercent}%.`,
      corridorId: corridor.corridorId,
      riskBeforePercent: corridor.baselineRiskPercent,
      riskAfterPercent: corridor.currentRiskPercent,
      riskReductionPercent: corridor.baselineRiskPercent - corridor.currentRiskPercent,
      actuatedChecklist: {
        inflowReduced: true,
        patrolAlerted: true,
        heavyVehiclesDiverted: true,
        signalsHarmonized: true
      },
      preventedAt: corridor.preventedAt
    };
  }

  /**
   * Reset corridor state (for testing and recurring evaluation)
   */
  resetCorridorState(corridorId = 'nh-24') {
    const corridor = this.corridors[corridorId];
    if (corridor) {
      corridor.isPrevented = false;
      corridor.currentRiskPercent = corridor.baselineRiskPercent;
      corridor.preventedAt = null;
    }
  }
}

export const incidentPredictionService = new IncidentPredictionService();
export default incidentPredictionService;
