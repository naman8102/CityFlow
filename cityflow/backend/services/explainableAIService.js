import { inMemoryStore } from '../config/db.js';

export const ExplainableAIService = {
  /**
   * Generates quantitative feature attribution and human-interpretable reasoning
   * for why AI modified a specific traffic signal.
   */
  explainSignalDecision: (signalId = 'sig-barakhamba', customContext = {}) => {
    // Find target signal or default to Barakhamba (Signal #12 in regional numbering)
    const signal = inMemoryStore.signals.find(s => s.id === signalId) || inMemoryStore.signals[1] || {
      id: 'sig-barakhamba',
      name: 'Barakhamba - Tolstoy Marg',
      currentState: 'RED',
      cycleSeconds: 75,
      remainingSeconds: 20
    };

    const isBarakhamba = signal.id === 'sig-barakhamba';

    // Benchmark values as requested by user
    // Traffic volume: +38%
    // Queue length: +42%
    // Average speed: -27%
    // Downstream capacity: -18%
    // Rain impact: +9%
    // Confidence: 91%
    const factors = {
      trafficVolume: {
        label: 'Traffic Volume',
        deltaPercent: +38,
        direction: 'INCREASE',
        weight: 25,
        observedValue: '2,150 VPH',
        baselineValue: '1,550 VPH',
        impactDescription: 'Severe vehicle arrival surge on primary feeder arterial'
      },
      queueLength: {
        label: 'Queue Length',
        deltaPercent: +42,
        direction: 'INCREASE',
        weight: 35,
        observedValue: '86 vehicles',
        baselineValue: '60 vehicles',
        impactDescription: 'Approaching queue spillback threshold threatening upstream gridlock'
      },
      averageSpeed: {
        label: 'Average Speed',
        deltaPercent: -27,
        direction: 'DECREASE',
        weight: 15,
        observedValue: '18 km/h',
        baselineValue: '25 km/h',
        impactDescription: 'Corridor velocity degradation due to stop-and-go friction'
      },
      downstreamCapacity: {
        label: 'Downstream Capacity',
        deltaPercent: -18,
        direction: 'DECREASE',
        weight: 15,
        observedValue: '1,310 vph',
        baselineValue: '1,600 vph',
        impactDescription: 'Downstream intersection constriction throttles discharge flow'
      },
      rainImpact: {
        label: 'Rain Impact',
        deltaPercent: +9,
        direction: 'INCREASE',
        weight: 10,
        observedValue: 'Wet Road Surface',
        baselineValue: 'Dry Surface (Baseline)',
        impactDescription: 'Pavement moisture extends braking distances and delay headway'
      }
    };

    const confidencePercent = 91;

    // Plain English synthesis
    const synthesis = `AI changed Signal #12 because: Traffic volume surged +38% with a +42% queue buildup (86 vehicles) on the North approach, while average corridor speed deteriorated by -27%. Downstream bottlenecking reduced discharge capacity by -18%, compounded by +9% wet pavement headway delay. Reordering Phase 1 and extending North Green by +20s discharges 32 queued vehicles with 91% model certainty.`;

    const decisionDetails = {
      signalId: signal.id,
      signalLabel: isBarakhamba ? 'Signal #12: Barakhamba Junction' : `Signal: ${signal.name}`,
      intersectionName: signal.name,
      interventionTitle: 'Extended North Green 22s → 42s (+20s AI Boost) & Phase 1 Priority',
      appliedAction: 'GREEN_EXTENSION_AND_PHASE_REORDER',
      greenDurationSeconds: 42,
      previousGreenSeconds: 22,
      greenDeltaSeconds: +20,
      confidencePercent,
      modelArchitecture: 'Physics-Informed XGBoost + Webster Capacity Multi-Arm Policy',
      causalFactors: [
        { name: 'Traffic volume', delta: '+38%', numericDelta: 38, type: 'CRITICAL', color: 'rose', barPercent: 85 },
        { name: 'Queue length', delta: '+42%', numericDelta: 42, type: 'CRITICAL', color: 'rose', barPercent: 92 },
        { name: 'Average speed', delta: '-27%', numericDelta: -27, type: 'WARNING', color: 'amber', barPercent: 65 },
        { name: 'Downstream capacity', delta: '-18%', numericDelta: -18, type: 'WARNING', color: 'amber', barPercent: 50 },
        { name: 'Rain impact', delta: '+9%', numericDelta: 9, type: 'INFO', color: 'cyan', barPercent: 30 }
      ],
      factors,
      synthesis,
      counterfactualComparison: {
        withoutAI: {
          title: 'Status Quo (No AI Intervention)',
          queueVehicles: 118,
          delayMinutes: 18.6,
          los: 'LOS F (Severe Gridlock)',
          upstreamSpillbackRisk: 'HIGH'
        },
        withAI: {
          title: 'AI Actuation (Current Adaptive Decision)',
          queueVehicles: 54,
          delayMinutes: 8.1,
          los: 'LOS C (Stable Flow)',
          upstreamSpillbackRisk: 'MITIGATED'
        },
        netGain: {
          queueRelievedPercent: '54%',
          delaySavedMinutes: '10.5 min',
          co2MitigatedKg: '15.6 kg/hr'
        }
      },
      alternativesEvaluated: [
        { option: 'Keep Fixed Splits (No Action)', score: 32, verdict: 'REJECTED: Approaching gridlock in 4.5 minutes' },
        { option: 'Extend East-West Green (+10s)', score: 41, verdict: 'REJECTED: Mismatched demand; starved North queue' },
        { option: 'Equal 4-Way Round-Robin Split', score: 58, verdict: 'REJECTED: Under-allocates green to critical corridor' },
        { option: 'Extend North Green +20s & Phase 1 Priority (AI Choice)', score: 91, verdict: 'SELECTED: Maximizes discharge rate and clears queue' }
      ],
      timestamp: new Date().toISOString()
    };

    return decisionDetails;
  }
};
