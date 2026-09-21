import { inMemoryStore, persistStore } from '../config/db.js';
import { TrafficPredictor } from '../services/trafficPredictor.js';
import { OsrmRoutingService } from '../services/osrmRoutingService.js';
import { IncidentDAO } from '../models/Incident.js';
import { GeocodingService } from '../services/geocodingService.js';
import { AdaptiveSignalOptimizer } from '../services/adaptiveSignalOptimizer.js';
import { IncidentResponseEngine } from '../services/incidentResponseEngine.js';
import { WeatherIntelligenceService } from '../services/weatherIntelligenceService.js';
import { ExplainableAIService } from '../services/explainableAIService.js';
import { DigitalTwinSimulatorService } from '../services/digitalTwinSimulatorService.js';
import { InfrastructureStressService } from '../services/infrastructureStressService.js';
import { publicTransportService } from '../services/publicTransportService.js';
import { incidentPredictionService } from '../services/incidentPredictionService.js';

export const SimulationController = {
  /**
   * Scenario A: Peak Hour Hotspot Detection & Bottleneck Ingestion
   */
  simulateHotspot: async (req, res) => {
    try {
      const { volume = 2250, capacity = 1800, intersectionId = 'sig-barakhamba', hourOfDay = 9 } = req.body;
      const freeFlowMinutes = 8.0;

      const bprMetrics = TrafficPredictor.calculateBPRDelay(freeFlowMinutes, volume, capacity);
      const riskAssessment = TrafficPredictor.predictCongestionRisk({
        hourOfDay,
        volume,
        capacity,
        weatherCondition: req.body.weather || 'CLEAR',
        activeIncidents: 1
      });

      // Adaptive Signal Timing Recalculation
      const signalOptimization = TrafficPredictor.optimizeSignalSplit(80, volume, 1100);

      // Find affected signal in inMemoryStore
      const signal = inMemoryStore.signals.find(s => s.id === intersectionId) || inMemoryStore.signals[1];
      signal.phaseVolume.northSouth = volume;

      return res.status(200).json({
        success: true,
        scenario: 'SCENARIO_A_PEAK_HOTSPOT',
        message: 'Peak hour volume surge analyzed. Automated signal phase adjustment recommended.',
        hotspotData: {
          intersectionId: signal.id,
          intersectionName: signal.name,
          location: signal.location,
          currentVolumeVPH: volume,
          nominalCapacityVPH: capacity,
          volumeCapacityRatio: bprMetrics.volumeCapacityRatio,
          levelOfService: bprMetrics.levelOfService,
          estimatedDelayMinutes: bprMetrics.delayMinutes,
          congestionRisk: riskAssessment,
          recommendedSignalPhase: signalOptimization,
          alertLevel: bprMetrics.volumeCapacityRatio > 1.1 ? 'CRITICAL_CONGESTION_ALERT' : 'MODERATE_WARNING',
          rootCause: `High arterial feeder inflow from Connaught Circus (${volume} vph vs ${capacity} capacity) compounded by downstream bottleneck at Tolstoy Marg crossing.`,
          actionPlan: {
            title: 'Closed-Loop Multi-Agent Traffic Intervention',
            actions: [
              {
                id: 'action-signal',
                title: 'Adaptive Signal Phase Extension',
                detail: `Extend North-South green +18s (Allocate ${signalOptimization.nsGreenSeconds}s NS / ${signalOptimization.ewGreenSeconds}s EW)`,
                impact: 'Flushes 380 queued vehicles per 10-min cycle'
              },
              {
                id: 'action-divert',
                title: 'Dynamic Commuter Rerouting',
                detail: 'Broadcast automated navigation guidance diverting 12% flow via Janpath bypass corridor',
                impact: 'Reduces arrival inflow by ~285 vph'
              },
              {
                id: 'action-freight',
                title: 'Commercial Freight Load Shift',
                detail: 'Enforce 20-minute temporary off-peak window shift for heavy commercial trucks',
                impact: 'Removes 4.2% heavy vehicle lane occupancy'
              },
              {
                id: 'action-wave',
                title: 'Multi-Signal Green Wave Progression',
                detail: 'Synchronize offsets across Barakhamba, Connaught Circus, and Chelmsford crossings',
                impact: 'Eliminates secondary queue shockwaves'
              }
            ],
            projectedImpact: {
              queueReductionPercent: 31,
              travelTimeReductionPercent: 18,
              carbonMitigatedPercent: 12,
              estimatedDelayAfterMinutes: Math.round(bprMetrics.delayMinutes * 0.3 * 10) / 10,
              levelOfServiceTarget: 'LOS C'
            }
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Scenario B: Smart Alternative Routing Generation
   */
  getAlternativeRoutes: async (req, res) => {
    try {
      const { origin, destination, trafficIntensity = 1.0 } = req.body;
      const originNode = origin && origin.lat ? origin : GeocodingService.resolveLocation('ram-manohar-lohia-hospital');
      const destNode = destination && destination.lat ? destination : GeocodingService.resolveLocation('new-delhi-railway-station');

      const routesData = await OsrmRoutingService.getComparativeRoutes(originNode, destNode, trafficIntensity);

      return res.status(200).json({
        success: true,
        scenario: 'SCENARIO_B_SMART_ALTERNATIVE_ROUTING',
        origin: originNode,
        destination: destNode,
        routes: routesData.routes,
        summary: routesData.summary
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * VIP Priority Route Simulation: High-Security Arterials & Signal Preemption
   */
  getVipRoute: async (req, res) => {
    try {
      const { origin, destination, trafficIntensity = 1.15 } = req.body || {};
      const originNode = origin && origin.lat ? origin : {
        lat: 28.5983,
        lng: 77.1850,
        name: 'Diplomatic Enclave / Chanakyapuri Security Compound',
        address: 'Shanti Path, Chanakyapuri Security Sector'
      };
      const destNode = destination && destination.lat ? destination : {
        lat: 28.6144,
        lng: 77.1996,
        name: 'Rashtrapati Bhavan (State Protocol Wing)',
        address: 'Presidential Estate, New Delhi'
      };

      const vipRoute = await OsrmRoutingService.calculateVipPriorityRoute(
        originNode,
        destNode,
        trafficIntensity,
        inMemoryStore.incidents || [],
        inMemoryStore.signals || []
      );

      // Preempt signals along the VIP corridor
      const preemptedIds = vipRoute.preemptedSignals || ['sig-ashoka-rd', 'sig-kg-marg', 'sig-barakhamba', 'sig-tolstoy', 'sig-janpath'];
      inMemoryStore.signals.forEach(sig => {
        if (preemptedIds.includes(sig.id)) {
          if (!sig.preemptedByEmergency) {
            sig.previousState = {
              currentState: sig.currentState,
              remainingSeconds: sig.remainingSeconds
            };
          }
          sig.currentState = 'GREEN';
          sig.preemptedByEmergency = true;
          sig.remainingSeconds = 240;
        }
      });
      persistStore();

      return res.status(200).json({
        success: true,
        scenario: 'VIP_PRIORITY_ROUTE',
        origin: originNode,
        destination: destNode,
        vipRoute,
        vipData: {
          routeType: 'VIP_PRIORITY_ROUTE',
          corridorPath: vipRoute.coordinates,
          telemetry: {
            etaMinutes: vipRoute.estimatedTimeMinutes,
            speedKmph: vipRoute.speedKmph,
            riskScore: vipRoute.riskScore,
            riskLevel: vipRoute.riskLevel,
            safetyIndex: vipRoute.safetyIndex,
            securityProtocol: vipRoute.securityProtocol,
            preemptedSignalsCount: preemptedIds.length,
            corridorName: vipRoute.name
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Clear VIP Priority Route Preemption & Restore Signals
   */
  clearVipRoute: async (req, res) => {
    try {
      if (Array.isArray(inMemoryStore.signals)) {
        inMemoryStore.signals.forEach(sig => {
          if (sig.preemptedByEmergency) {
            sig.preemptedByEmergency = false;
            if (sig.previousState) {
              sig.currentState = sig.previousState.currentState || 'GREEN';
              sig.remainingSeconds = sig.previousState.remainingSeconds || Math.round((sig.cycleSeconds || 60) * 0.5);
              delete sig.previousState;
            } else {
              sig.remainingSeconds = Math.round((sig.cycleSeconds || 60) * 0.5);
            }
          }
        });
        persistStore();
      }

      return res.status(200).json({
        success: true,
        message: 'VIP Priority corridor cleared. Preempted signals successfully restored to normal cycle states.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Real-Time City State Snapshot (Signals, Incidents, Telemetry)
   */
  getCityState: async (req, res) => {
    try {
      const incidents = await IncidentDAO.findActive();
      const signals = inMemoryStore.signals;
      
      const cityCongestionScore = Math.round(
        signals.reduce((acc, s) => acc + (s.phaseVolume.northSouth / 2200) * 100, 0) / signals.length
      );

      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        metrics: {
          cityCongestionIndex: Math.min(94, Math.max(30, cityCongestionScore)),
          activeIncidentsCount: incidents.length,
          managedSignalsCount: signals.length,
          averageSpeedKmph: 26.4,
          carbonMitigatedTodayKg: 428.5
        },
        signals,
        incidents,
        landmarks: GeocodingService.getLandmarks(),
        activeEmergency: (Array.isArray(inMemoryStore.emergencyMissions) ? inMemoryStore.emergencyMissions : []).find(m => m.status === 'EN_ROUTE' || m.status === 'DISPATCHED') || null
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  getIncidentHistory: async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
    const [history, hotspots] = await Promise.all([IncidentDAO.findHistory(limit), IncidentDAO.recurringHotspots()]);
    return res.json({ success: true, history, hotspots });
  },

  importIncidents: async (req, res) => {
    if (req.user?.role !== 'POLICE') return res.status(403).json({ success: false, error: 'Only police operators can import a verified external feed.' });
    const records = Array.isArray(req.body?.records) ? req.body.records : [];
    if (!records.length || records.length > 5000) return res.status(400).json({ success: false, error: 'Provide 1 to 5000 incident records.' });
    const imported = [];
    for (const record of records) {
      if (!record.title || !record.location || !Number.isFinite(Number(record.location.lat)) || !Number.isFinite(Number(record.location.lng))) continue;
      if (!['CONGESTION', 'ACCIDENT', 'CONSTRUCTION', 'HAZARD'].includes(record.type || 'CONGESTION')) continue;
      if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(record.severity || 'MEDIUM')) continue;
      imported.push(await IncidentDAO.create({
        title: String(record.title).slice(0, 200),
        type: record.type || 'CONGESTION',
        severity: record.severity || 'MEDIUM',
        location: { lat: Number(record.location.lat), lng: Number(record.location.lng), address: record.location.address || 'External feed location' },
        source: 'EXTERNAL_FEED',
        reportedBy: req.user.sub
      }));
    }
    return res.status(201).json({ success: true, importedCount: imported.length, incidents: imported });
  },

  /**
   * Incident Reporting by Citizen or Traffic Officer
   */
  reportIncident: async (req, res) => {
    try {
      const { title, type, severity, location } = req.body || {};

      const trimmedTitle = typeof title === 'string' ? title.trim() : '';
      if (!trimmedTitle || trimmedTitle.length < 3 || trimmedTitle.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Title is required and must be between 3 and 200 characters.'
        });
      }

      const VALID_TYPES = ['CONGESTION', 'ACCIDENT', 'CONSTRUCTION', 'HAZARD'];
      const normalizedType = (type || 'CONGESTION').toUpperCase();
      if (!VALID_TYPES.includes(normalizedType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid incident type '${type}'. Valid types are: ${VALID_TYPES.join(', ')}.`
        });
      }

      const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const normalizedSeverity = (severity || 'MEDIUM').toUpperCase();
      if (!VALID_SEVERITIES.includes(normalizedSeverity)) {
        return res.status(400).json({
          success: false,
          error: `Invalid severity '${severity}'. Valid severities are: ${VALID_SEVERITIES.join(', ')}.`
        });
      }

      if (!location || typeof location !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Location coordinates object { lat, lng } is required.'
        });
      }

      const lat = Number(location.lat);
      const lng = Number(location.lng);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          error: 'Latitude must be a valid finite number between -90 and 90.'
        });
      }

      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Longitude must be a valid finite number between -180 and 180.'
        });
      }

      const created = await IncidentDAO.create({
        title: trimmedTitle,
        type: normalizedType,
        severity: normalizedSeverity,
        location: {
          lat,
          lng,
          address: typeof location.address === 'string' && location.address.trim()
            ? location.address.trim().slice(0, 255)
            : 'Central Arterial Node'
        },
        source: req.user?.role === 'POLICE' ? 'POLICE' : 'CITIZEN',
        reportedBy: req.user?.sub || null
      });

      const responsePlan = IncidentResponseEngine.generateResponsePlan(created);

      return res.status(201).json({
        success: true,
        message: 'Incident reported and broadcast to CityFlow AI network for immediate route avoidance.',
        incident: created,
        responsePlan
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Signal Control State Override (Manual or AI Adaptive)
   */
  updateSignal: async (req, res) => {
    try {
      const { signalId, state, aiAdaptiveEnabled } = req.body || {};
      if (!signalId) {
        return res.status(400).json({ success: false, error: 'Signal ID is required.' });
      }

      const sig = inMemoryStore.signals.find(s => s.id === signalId);
      if (!sig) {
        return res.status(404).json({ success: false, error: `Signal '${signalId}' not found.` });
      }

      const allowedStates = ['GREEN', 'YELLOW', 'RED'];
      if (state !== undefined) {
        const normalizedState = typeof state === 'string' ? state.toUpperCase().trim() : '';
        if (!allowedStates.includes(normalizedState)) {
          return res.status(400).json({
            success: false,
            error: `Invalid signal state '${state}'. Allowed states are: ${allowedStates.join(', ')}.`
          });
        }
        sig.currentState = normalizedState;
      }

      if (aiAdaptiveEnabled !== undefined) {
        if (typeof aiAdaptiveEnabled !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'aiAdaptiveEnabled must be a boolean value (true or false).'
          });
        }
        sig.aiAdaptiveEnabled = aiAdaptiveEnabled;
      }

      persistStore();

      return res.status(200).json({ success: true, signal: sig });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Scenario A Closed-Loop Actuation: Execute Multi-Agent AI Intervention
   */
  applyIntervention: async (req, res) => {
    try {
      const { intersectionId = 'sig-barakhamba', additionalGreenSeconds = 18 } = req.body || {};
      const primarySignal = inMemoryStore.signals.find(s => s.id === intersectionId) || inMemoryStore.signals[1];

      // 1. Actuate Primary Signal: Allocate additional green phase
      primarySignal.currentState = 'GREEN';
      primarySignal.remainingSeconds = Math.max(primarySignal.remainingSeconds, 45 + additionalGreenSeconds);
      primarySignal.aiAdaptiveEnabled = true;

      // 2. Actuate Adjacent Signals: Multi-Signal Green Wave Synchronization
      const adjacentIds = ['sig-cp-inner', 'sig-chelmsford'];
      const adjustedSignals = [primarySignal.id];

      inMemoryStore.signals.forEach(sig => {
        if (adjacentIds.includes(sig.id)) {
          sig.aiAdaptiveEnabled = true;
          sig.currentState = 'GREEN';
          sig.remainingSeconds = 42;
          adjustedSignals.push(sig.id);
        }
      });

      // 3. Actuate Freight Load Shift: Shift commercial fleet trips during peak surge
      let shiftedFreightCount = 0;
      if (Array.isArray(inMemoryStore.logisticsTrips)) {
        inMemoryStore.logisticsTrips.forEach(trip => {
          if (!trip.isShifted) {
            trip.isShifted = true;
            shiftedFreightCount++;
          }
        });
      }

      // 4. Update Inflow on intersection (drop volume by 28% due to diversion and green wave flush)
      const initialVolume = primarySignal.phaseVolume?.northSouth || 2380;
      const mitigatedVolume = Math.round(initialVolume * 0.72);
      if (primarySignal.phaseVolume) {
        primarySignal.phaseVolume.northSouth = mitigatedVolume;
      }

      persistStore();

      return res.status(200).json({
        success: true,
        status: 'INTERVENTION_ACTUATED',
        timestamp: new Date().toISOString(),
        actuationSummary: {
          primaryIntersection: primarySignal.name,
          primarySignalId: primarySignal.id,
          signalsAdjusted: adjustedSignals,
          primarySignalGreenAddedSeconds: additionalGreenSeconds,
          trafficDivertedVPH: Math.round(initialVolume * 0.12),
          freightTripsShiftedCount: Math.max(shiftedFreightCount, 2),
          hardwareMeshStatus: 'SYNCHRONIZED_GREEN_WAVE'
        },
        measuredImpact: {
          queueReductionPercent: 31.4,
          delayReductionMinutes: 10.1,
          travelTimeReductionPercent: 18.2,
          carbonMitigatedKg: 48.6,
          volumeReliefVPH: initialVolume - mitigatedVolume,
          levelOfServiceBefore: 'LOS F',
          levelOfServiceAfter: 'LOS C',
          commuterCongestionIndexChange: '-28 pts'
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Revert / Rollback AI Intervention to baseline
   */
  revertIntervention: async (req, res) => {
    try {
      const { intersectionId = 'sig-barakhamba' } = req.body || {};
      const primarySignal = inMemoryStore.signals.find(s => s.id === intersectionId) || inMemoryStore.signals[1];

      if (primarySignal.phaseVolume) {
        primarySignal.phaseVolume.northSouth = 2100;
      }
      primarySignal.remainingSeconds = 25;

      persistStore();

      return res.status(200).json({
        success: true,
        status: 'INTERVENTION_REVERTED',
        message: 'Intervention released. Signal grid returned to baseline adaptive cycle.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Adaptive Signal AI: Retrieve Current Autonomous Phase & Coordination State
   */
  getAdaptiveSignalState: async (req, res) => {
    try {
      const state = AdaptiveSignalOptimizer.optimize();
      return res.status(200).json(state);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Adaptive Signal AI: Execute Real-Time Multi-Variable Optimization
   */
  runAdaptiveOptimization: async (req, res) => {
    try {
      const optimization = AdaptiveSignalOptimizer.optimize(req.body || {});

      // Synchronize in-memory store signals with coordinated green wave timings
      if (optimization?.coordinatedSignals) {
        for (const coord of optimization.coordinatedSignals) {
          const sig = inMemoryStore.signals.find(s => s.id === coord.id);
          if (sig) {
            sig.greenWaveSynchronized = true;
            sig.coordinatedOffsetSeconds = coord.offsetSeconds;
            if (coord.id === 'sig-barakhamba' && optimization.splits) {
              sig.remainingSeconds = optimization.splits.north;
              if (sig.phaseVolume) {
                sig.phaseVolume.northSouth = req.body?.arms?.north?.volume || 2150;
              }
            }
          }
        }
        persistStore();
      }

      return res.status(200).json(optimization);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Incident Response Engine: Execute Multi-Agency Response Plan
   */
  executeIncidentResponsePlan: async (req, res) => {
    try {
      const { incidentId, plan } = req.body || {};
      const result = await IncidentResponseEngine.executeResponsePlan(incidentId, plan);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Benchmark Preset: Simulate Accident Incident & Generate Response Plan
   */
  simulateAccidentIncident: async (req, res) => {
    try {
      const benchmark = IncidentResponseEngine.getBenchmarkAccident();
      const existing = inMemoryStore.incidents.find(i => i._id === benchmark._id);
      if (!existing) {
        inMemoryStore.incidents.unshift(benchmark);
        persistStore();
      }
      const responsePlan = IncidentResponseEngine.generateResponsePlan(benchmark);
      return res.status(200).json({
        success: true,
        incident: benchmark,
        responsePlan
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Weather Intelligence: Get Current State & Causal Analysis
   */
  getWeatherIntelligence: async (req, res) => {
    try {
      const data = WeatherIntelligenceService.getCurrentState();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Weather Intelligence: Set Condition & Actuate Causal Chain
   */
  setWeatherIntelligence: async (req, res) => {
    try {
      const { condition } = req.body || {};
      const data = WeatherIntelligenceService.setCondition(condition);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Explainable AI (XAI): Why did AI change this signal?
   */
  explainSignalDecision: async (req, res) => {
    try {
      const signalId = req.params.signalId || req.query.signalId || 'sig-barakhamba';
      const explanation = ExplainableAIService.explainSignalDecision(signalId, req.query);
      return res.status(200).json({
        success: true,
        data: explanation
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * City Simulation / Digital Twin: Run macro urban stress-test scenario
   */
  runDigitalTwinSimulation: async (req, res) => {
    try {
      const config = req.body || {};
      const result = DigitalTwinSimulatorService.runSimulation(config);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Infrastructure Stress: Get multi-dimensional urban infrastructure analysis
   */
  getInfrastructureStress: async (req, res) => {
    try {
      const zoneId = req.params.nodeId || req.query.zoneId || 'sector-62';
      const data = InfrastructureStressService.getZoneStress(zoneId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Infrastructure Stress: Apply 4 AI recommendations to relieve pressure
   */
  applyInfrastructureRelief: async (req, res) => {
    try {
      const { zoneId = 'sector-62' } = req.body || {};
      const result = InfrastructureStressService.applyReliefPlan(zoneId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Public Transport: Get 6-layer multimodal analysis and dynamic frequency recommendation
   */
  getPublicTransport: async (req, res) => {
    try {
      const corridorId = req.params.corridorId || req.query.corridorId || 'sector-62';
      const data = publicTransportService.getTransitAnalysis(corridorId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Public Transport: Apply AI transit augmentation (+4 buses, compress interval 10m -> 6m)
   */
  applyTransitAugmentation: async (req, res) => {
    try {
      const { corridorId = 'sector-62' } = req.body || {};
      const result = publicTransportService.applyTransitAugmentation(corridorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * AI Incident Prediction: Get pre-collision risk assessment and causal factors
   */
  getIncidentPrediction: async (req, res) => {
    try {
      const corridorId = req.params.corridorId || req.query.corridorId || 'nh-24';
      const data = incidentPredictionService.getRiskAnalysis(corridorId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * AI Incident Prevention: Execute 4 preventive actions (inflow, patrol, freight, signals)
   */
  applyPreventiveAction: async (req, res) => {
    try {
      const { corridorId = 'nh-24' } = req.body || {};
      const result = incidentPredictionService.applyPreventivePlan(corridorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};





