import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cityFlowAPI } from './services/api';
import MapView from './components/MapView';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import IncidentReporterModal from './components/IncidentReporterModal';
import UserDashboard from './pages/UserDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import CitizenPage from './pages/CitizenPage';
import PolicePage from './pages/PolicePage';
import LogisticsPage from './pages/LogisticsPage';
import AIControlCenter from './components/AIControlCenter';
import AdaptiveSignalAILab from './components/AdaptiveSignalAILab';
import IncidentResponseModal from './components/IncidentResponseModal';
import WeatherIntelligenceBar from './components/WeatherIntelligenceBar';
import DigitalTwinSimulatorModal from './components/DigitalTwinSimulatorModal';
import PublicTransportModal from './components/PublicTransportModal';
import IncidentPredictionModal from './components/IncidentPredictionModal';
import ExplainableAIDecisionModal from './components/ExplainableAIDecisionModal';
import EmergencyCorridorHUD from './components/EmergencyCorridorHUD';
import SidebarNav from './components/SidebarNav';
import CityHealthBar from './components/CityHealthBar';
import AIRecommendationDeck from './components/AIRecommendationDeck';
import { Shield, Users, Truck, Activity, Gauge, Lock, ShieldAlert, X, Radio, KeyRound, Siren } from 'lucide-react';
import AuthPage from './components/AuthPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import { sosAPI } from './services/sosService';
import { useRouter } from './utils/useRouter';
import { getTabUser, clearTabSession } from './utils/sessionManager';

export default function App() {
  const { currentPath, navigate, isCitizenRoute, isPoliceRoute, isLogisticsRoute } = useRouter();
  const [currentUser, setCurrentUser] = useState(() => getTabUser());
  const [activeRole, setActiveRole] = useState(() => currentUser?.role || 'USER');
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [rbacNotice, setRbacNotice] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [signals, setSignals] = useState([]);
  const selectedSignalRef = useRef(null);
  const [selectedSignal, setSelectedSignalState] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [routesData, setRoutesData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState('route-cityflow-ai');
  const [emergencyData, setEmergencyData] = useState(null);
  const [vipData, setVipData] = useState(null);
  const [hotspotData, setHotspotData] = useState(null);
  const [interventionData, setInterventionData] = useState(null);
  const [isApplyingIntervention, setIsApplyingIntervention] = useState(false);
  const [logisticsTrips, setLogisticsTrips] = useState([]);
  const [aggregateLogistics, setAggregateLogistics] = useState(null);
  const [currentSos, setCurrentSos] = useState(null);
  const [sosRequests, setSosRequests] = useState([]);
  const [cityMetrics, setCityMetrics] = useState({
    cityCongestionIndex: 64,
    activeIncidentsCount: 2,
    managedSignalsCount: 4,
    averageSpeedKmph: 26.4
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdaptiveLabOpen, setIsAdaptiveLabOpen] = useState(false);
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [incidentResponseModal, setIncidentResponseModal] = useState({ isOpen: false, incident: null, plan: null });
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [loading, setLoading] = useState(false);

  // Live ticking digital clock (21:42 format)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fix stale closure: keep selectedSignal in a ref so the polling interval can use it
  const setSelectedSignal = (sig) => {
    selectedSignalRef.current = sig;
    setSelectedSignalState(sig);
  };

  // City state refresh (signals, incidents, metrics)
  const refreshCityState = useCallback(async () => {
    try {
      const data = await cityFlowAPI.getCityState();
      setIsBackendOnline(!data?.isOfflineFallback);
      if (data?.signals) {
        setSignals(data.signals);
        // Update selected signal using the ref — no stale closure
        if (!selectedSignalRef.current && data.signals.length > 0) {
          setSelectedSignal(data.signals[0]);
        } else if (selectedSignalRef.current) {
          const updated = data.signals.find(s => s.id === selectedSignalRef.current.id);
          if (updated) setSelectedSignal(updated);
        }
      }
      if (data?.incidents) setIncidents(data.incidents);
      if (data?.metrics) setCityMetrics(data.metrics);
      if (data?.activeEmergency) {
        setEmergencyData(prev => {
          if (!prev) {
            return {
              mission: data.activeEmergency,
              corridorPath: data.activeEmergency.waypoints || [],
              currentAmbulanceLocation: data.activeEmergency.currentLocation
            };
          }
          return {
            ...prev,
            mission: {
              ...prev.mission,
              ...data.activeEmergency
            },
            currentAmbulanceLocation: data.activeEmergency.currentLocation || prev.currentAmbulanceLocation
          };
        });
      } else {
        // Backend has no active emergency: ensure emergencyData is closed
        setEmergencyData(null);
      }
    } catch (err) {
      setIsBackendOnline(false);
      console.error('Telemetry refresh error:', err);
    }
  }, []);

  const refreshLogistics = useCallback(async () => {
    try {
      const data = await cityFlowAPI.getLogisticsTrips();
      if (data?.trips) setLogisticsTrips(data.trips);
      if (data?.aggregateStats) setAggregateLogistics(data.aggregateStats);
    } catch (err) {
      console.error('Logistics refresh error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshCityState();
    refreshLogistics();

    // Auto-refresh city state every 3 seconds for dynamic countdowns
    const interval = setInterval(refreshCityState, 3000);
    return () => clearInterval(interval);
  }, [refreshCityState]);

  // Real-Time SOS State Management & SSE Multi-Tab Synchronization
  const refreshSosState = useCallback(async () => {
    try {
      if (currentUser?.userType === 'EMERGENCY_SPECIAL' || currentUser?.role === 'USER') {
        const myRes = await sosAPI.getMyStatus();
        if (myRes?.activeRequest) setCurrentSos(myRes.activeRequest);
        else if (myRes?.latestRequest) setCurrentSos(myRes.latestRequest);
      }
      if (currentUser?.role === 'POLICE' || activeRole === 'POLICE') {
        const allRes = await sosAPI.getAllRequests();
        if (allRes?.requests) setSosRequests(allRes.requests);
      }
    } catch {
      // Ignore
    }
  }, [currentUser, activeRole]);

  useEffect(() => {
    if (!currentUser) return;
    refreshSosState();

    const unsubscribe = sosAPI.subscribeStream((event) => {
      const { eventType, payload } = event;
      if (!payload) return;

      if (eventType === 'SOS_CREATED') {
        setSosRequests(prev => {
          const id = payload._id || payload.requestId;
          if (prev.some(r => (r._id || r.requestId) === id)) return prev;
          return [payload, ...prev];
        });
        if (currentUser.id === payload.userId || currentUser.sub === payload.userId) {
          setCurrentSos(payload);
        }
      } else if (eventType === 'SOS_VERIFIED') {
        const id = payload._id || payload.requestId;
        setSosRequests(prev => prev.map(r => (r._id || r.requestId) === id ? { ...r, ...payload, status: 'VERIFIED' } : r));
        setCurrentSos(prev => {
          if (prev && (prev._id === id || prev.requestId === id || prev.userId === payload.userId)) {
            return { ...prev, ...payload, status: 'VERIFIED' };
          }
          return prev;
        });
      } else if (eventType === 'SOS_ACTIVATED') {
        const id = payload._id || payload.requestId;
        setSosRequests(prev => prev.map(r => (r._id || r.requestId) === id ? { ...r, ...payload, status: 'ACTIVE' } : r));
        setCurrentSos(prev => {
          if (prev && (prev._id === id || prev.requestId === id || prev.userId === payload.userId)) {
            return { ...prev, ...payload, status: 'ACTIVE' };
          }
          return prev;
        });

        // Automatically activate Emergency Green Corridor HUD on map and telemetry
        if (payload.emergencyData) {
          setEmergencyData(payload.emergencyData);
          setActiveScenario('SCENARIO_C_EMERGENCY_SOS');
        } else if (payload.mission) {
          setEmergencyData({
            mission: payload.mission,
            corridorPath: payload.mission.waypoints || [],
            telemetry: {
              etaBeforeAI: '18:42',
              etaAfterAI: '11:26',
              timeSavedFormatted: '7:16 min',
              signalsAffectedCount: 6,
              trafficDivertedPercent: 14,
              corridorSpeedKmph: 48.5,
              arterialPriorityStatus: 'SOVEREIGN_CORRIDOR_ACTIVE'
            }
          });
          setActiveScenario('SCENARIO_C_EMERGENCY_SOS');
        }
        refreshCityState();
      } else if (eventType === 'SOS_RESOLVED') {
        const id = payload._id || payload.requestId;
        setSosRequests(prev => prev.map(r => (r._id || r.requestId) === id ? { ...r, ...payload, status: 'RESOLVED' } : r));
        setCurrentSos(prev => {
          if (prev && (prev._id === id || prev.requestId === id)) {
            return { ...prev, ...payload, status: 'RESOLVED' };
          }
          return prev;
        });
      }
    });

    const timer = setInterval(refreshSosState, 3000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [currentUser, activeRole, refreshSosState, refreshCityState, refreshLogistics]);

  // ─── Scenario Handlers ─────────────────────────────────────────────

  const handleScenarioA = async () => {
    setActiveScenario('A');
    if (currentUser?.role === 'POLICE') {
      setActiveRole('POLICE');
    }
    setInterventionData(null);
    setLoading(true);
    const res = await cityFlowAPI.simulateHotspot({ volume: 2380, capacity: 1800, hourOfDay: 9 });
    if (res?.hotspotData) {
      setHotspotData(res.hotspotData);
      // Auto-select the affected signal on the map
      const targetSig = signals.find(s => s.id === res.hotspotData.intersectionId);
      if (targetSig) setSelectedSignal(targetSig);
    }
    setLoading(false);
  };

  const handleApplyIntervention = async () => {
    if (currentUser?.role !== 'POLICE') {
      setRbacNotice({
        title: 'Access Restricted: Police Command Required',
        message: 'Only authorized Traffic Police operators can execute closed-loop mesh interventions.'
      });
      return;
    }
    setIsApplyingIntervention(true);
    try {
      const res = await cityFlowAPI.applyAIIntervention({
        intersectionId: hotspotData?.intersectionId || 'sig-barakhamba',
        additionalGreenSeconds: 18
      });
      if (res?.status === 'INTERVENTION_ACTUATED') {
        setInterventionData(res);
        await refreshCityState();
        await refreshLogistics();
        setCityMetrics(prev => prev ? {
          ...prev,
          cityCongestionIndex: Math.max(34, prev.cityCongestionIndex - 24),
          averageSpeedKmph: Number((prev.averageSpeedKmph + 5.2).toFixed(1)),
          carbonMitigatedTodayKg: Number((prev.carbonMitigatedTodayKg + 48.6).toFixed(1))
        } : prev);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Intervention execution failed';
      setRbacNotice({ title: 'Intervention Execution Failed', message: errorMsg });
    } finally {
      setIsApplyingIntervention(false);
    }
  };

  const handleRevertIntervention = async () => {
    try {
      await cityFlowAPI.revertAIIntervention({
        intersectionId: hotspotData?.intersectionId || 'sig-barakhamba'
      });
      setInterventionData(null);
      await refreshCityState();
    } catch (err) {
      console.error('Revert failed:', err);
    }
  };

  // Accepts optional origin and destination from UserDashboard's selectors
  const handleScenarioB = async (originNode, destNode) => {
    setActiveScenario('B');
    if (currentUser?.role === 'USER') {
      setActiveRole('USER');
    }
    setLoading(true);
    const res = await cityFlowAPI.getRoutes({
      origin: originNode || undefined,
      destination: destNode || undefined,
      trafficIntensity: 1.15
    });
    if (res?.routes) {
      setRoutesData(res.routes);
      setSelectedRouteId(res.routes.aiOptimizedRoute?.id || 'route-cityflow-ai');
    }
    setLoading(false);
  };

  const handleScenarioC = async () => {
    if (currentUser?.role !== 'POLICE') {
      setRbacNotice({
        title: 'Access Restricted: Police Hub Only',
        message: 'Scenario C (Green Corridor Preemption) is restricted to Traffic Police operators. Switch to or sign in with a Police account to execute signal preemption.'
      });
      return;
    }
    setActiveScenario('C');
    setActiveRole('POLICE');
    setLoading(true);
    try {
      const res = await cityFlowAPI.dispatchEmergency({
        vehicleType: 'AMBULANCE',
        vehicleNumber: 'DL-01-EQ-8812',
        originQuery: 'ram-manohar-lohia-hospital',
        destQuery: 'new-delhi-railway-station'
      });
      if (res?.corridorPath) {
        setEmergencyData(res);
        await refreshCityState();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Server connection failed';
      console.error('Emergency dispatch failed:', errorMsg);
      setRbacNotice({
        title: 'Emergency Dispatch Failed',
        message: `Unable to activate Green Corridor: ${errorMsg}. Preemption was not applied.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioD = async () => {
    if (currentUser?.role !== 'LOGISTICS') {
      setRbacNotice({
        title: 'Access Restricted: Logistics Fleet Only',
        message: 'Scenario D (Commercial Freight Shifting) is restricted to Logistics & Fleet Operators. Switch to or sign in with a Logistics account to optimize schedules.'
      });
      return;
    }
    setActiveScenario('D');
    setActiveRole('LOGISTICS');
    setLoading(true);
    try {
      // Optimize a default freight trip so the table is never empty
      await cityFlowAPI.optimizeLogistics({
        fleetCompany: 'Apex City Logistics',
        truckId: 'TRK-ALPHA-44',
        cargoType: 'Cold Storage Food Supplies',
        tonnage: 8.5,
        route: 'Okhla Industrial Area → Azadpur Mandi',
        requestedHour: 9
      });
      await cityFlowAPI.optimizeLogistics({
        fleetCompany: 'BlueDart Freightline',
        truckId: 'TRK-BETA-89',
        cargoType: 'E-Commerce Parcel Batches',
        tonnage: 4.2,
        route: 'Noida Sector 62 → Central Delhi Hub',
        requestedHour: 8
      });
      await refreshLogistics();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Server connection failed';
      console.error('Logistics optimization failed:', errorMsg);
      setRbacNotice({
        title: 'Logistics Optimization Failed',
        message: `Unable to optimize fleet load schedules: ${errorMsg}.`
      });
    } finally {
      setLoading(false);
    }
  };

  // VIP High-Security Priority Corridor Authorization (POLICE COMMAND ONLY)
  const handlePoliceAuthorizeVipSos = async () => {
    if (currentUser?.role !== 'POLICE') {
      setRbacNotice({
        title: 'VIP Authorization Restricted: Police Only',
        message: 'VIP Priority Green Corridors can ONLY be authorized and deployed by Traffic Police Command. Special Case & VIP users can submit an SOS request for police verification.'
      });
      return;
    }

    setActiveScenario('VIP_PRIORITY_ROUTE');
    setLoading(true);
    try {
      // 1. If there's any pending VIP request in the queue, verify & activate it through the official Police SOS endpoint
      const pendingVipReq = sosRequests.find(r => r.sosType === 'VIP' && (r.status === 'REQUESTED' || r.status === 'VERIFIED'));
      if (pendingVipReq) {
        if (pendingVipReq.status === 'REQUESTED') {
          await sosAPI.verifyRequest(pendingVipReq._id || pendingVipReq.id);
        }
        const actRes = await sosAPI.activateVipRequest(pendingVipReq._id || pendingVipReq.id);
        if (actRes?.vipData || actRes?.request) {
          const activatedVipData = {
            ...(actRes.vipData || {}),
            status: 'ACTIVE',
            routeType: 'VIP_PRIORITY_ROUTE',
            corridorPath: actRes.vipRoute?.coordinates || actRes.request?.corridorPath || actRes.vipData?.corridorPath || [],
            telemetry: {
              etaMinutes: actRes.vipRoute?.estimatedTimeMinutes || 11.4,
              speedKmph: actRes.vipRoute?.speedKmph || 54,
              riskScore: actRes.vipRoute?.riskScore || 14,
              safetyIndex: actRes.vipRoute?.safetyIndex || 96,
              securityProtocol: 'Z_PLUS_GRADE_MOTORCADE_ESCORT',
              preemptedSignalsCount: 5,
              corridorName: 'VIP High-Security Priority Corridor (Motorcade Cleared)'
            }
          };
          setVipData(activatedVipData);
          setEmergencyData(null);
          await refreshSosState();
          await refreshCityState();
          setRbacNotice({
            title: '👑 VIP Priority Corridor Authorized by Police Command',
            message: `VIP SOS request (${pendingVipReq.requestId}) verified and activated. Security arterials locked GREEN on Police Tactical Map.`
          });
          return;
        }
      }

      // 2. Direct Police authorization of VIP Priority Corridor
      const res = await cityFlowAPI.getVipRoute();
      if (res?.vipData || res?.vipRoute) {
        const calculatedVipData = {
          ...(res.vipData || {}),
          status: 'ACTIVE',
          routeType: 'VIP_PRIORITY_ROUTE',
          corridorPath: res.vipRoute?.coordinates || res.vipData?.corridorPath || [],
          telemetry: {
            etaMinutes: res.vipRoute?.estimatedTimeMinutes || 11.4,
            speedKmph: res.vipRoute?.speedKmph || 54,
            riskScore: res.vipRoute?.riskScore || 14,
            riskLevel: res.vipRoute?.riskLevel || 'LOW_RISK',
            safetyIndex: res.vipRoute?.safetyIndex || 96,
            securityProtocol: 'Z_PLUS_GRADE_MOTORCADE_ESCORT',
            preemptedSignalsCount: 5,
            corridorName: 'VIP High-Security Priority Corridor (Motorcade Cleared)'
          }
        };
        setVipData(calculatedVipData);
        setEmergencyData(null);

        // Preempt signals along the VIP corridor
        const preemptedIds = res.vipRoute?.preemptedSignals || ['sig-ashoka-rd', 'sig-kg-marg', 'sig-barakhamba', 'sig-tolstoy', 'sig-janpath'];
        setSignals(prev => prev.map(sig => {
          if (preemptedIds.includes(sig.id)) {
            return {
              ...sig,
              currentState: 'GREEN',
              preemptedByEmergency: true,
              remainingSeconds: 240
            };
          }
          return sig;
        }));

        setRbacNotice({
          title: '👑 VIP High-Security Corridor Authorized by Police Command',
          message: 'Officer authorization verified. VIP Priority Route deployed on the Master Tactical Map and 5 arterial intersections locked GREEN.'
        });
      }
    } catch (err) {
      console.warn('VIP route authorization notice:', err);
    } finally {
      setLoading(false);
    }
  };

  // When a Citizen clicks VIP SOS: Inform them that Police must authorize it!
  const handleCitizenVipSosClick = () => {
    // If police has already authorized a VIP corridor, show it on map
    if (vipData) {
      setRbacNotice({
        title: 'Active VIP Convoy Corridor (Police Authorized)',
        message: 'A High-Security State Convoy is currently in transit under Traffic Police authorization. Priority arterials are cleared.'
      });
      return;
    }

    // Otherwise, citizen cannot self-authorize
    setRbacNotice({
      title: 'Police Authorization Required (VIP Escort Protocol)',
      message: 'VIP Priority Green Corridors can ONLY be authorized and activated by Traffic Police Command. Citizens and Special Case personnel may submit an SOS Request for police clearance below.'
    });

    // If on citizen page, scroll/focus to the SOS Request Panel
    setTimeout(() => {
      const panelEl = document.getElementById('sos-request-panel');
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleClearVip = async () => {
    setVipData(null);
    setActiveScenario(prev => (prev === 'VIP_PRIORITY_ROUTE' ? null : prev));

    // 1. Immediately release preemptedByEmergency on local signals so UI updates instantly
    setSignals(prev => prev.map(sig => {
      if (sig.preemptedByEmergency) {
        return {
          ...sig,
          preemptedByEmergency: false,
          remainingSeconds: Math.round((sig.cycleSeconds || 60) * 0.5)
        };
      }
      return sig;
    }));

    // 2. Call backend VIP clear endpoint to reset in-memory signals and persistStore
    try {
      await cityFlowAPI.clearVipRoute();
    } catch (e) {
      console.warn('Clear VIP route API notice:', e?.message);
    }

    // 3. Call emergency clear fallback to ensure all preemption locks are removed
    try {
      await cityFlowAPI.clearEmergency('vip_corridor');
    } catch (e) {
      // ignore
    }

    // 4. Resolve any active VIP SOS request in backend if present
    const activeVip = sosRequests.find(r => r.sosType === 'VIP' && (r.status === 'ACTIVE' || r.status === 'VERIFIED' || r.status === 'REQUESTED'));
    if (activeVip) {
      try {
        await sosAPI.resolveRequest(activeVip._id || activeVip.id);
        await refreshSosState();
      } catch (e) {
        console.warn('Auto resolve VIP SOS notice:', e?.message);
      }
    }

    // 5. Re-fetch clean signal states from backend
    await refreshCityState();
  };

  const isRoleAccessible = (roleId) => {
    return currentUser?.role === roleId;
  };

  // Auto-route to the authorized dashboard on root navigation
  useEffect(() => {
    if (currentUser && (currentPath === '/' || currentPath === '')) {
      if (currentUser.role === 'POLICE') navigate('/police');
      else if (currentUser.role === 'LOGISTICS') navigate('/logistics');
      else navigate('/citizen');
    }
  }, [currentUser, currentPath, navigate]);

  const handleSelectScenario = (scId) => {
    if (scId === 'A') handleScenarioA();
    else if (scId === 'B') {
      setActiveRole('USER');
      handleScenarioB();
    }
    else if (scId === 'C') {
      if (currentUser?.role !== 'POLICE') {
        setRbacNotice({
          title: 'Access Restricted: Police Department Clearance Required',
          message: 'Scenario C (Green Corridor Signal Preemption) is restricted to Traffic Police & Emergency dispatchers. Public citizens cannot preempt arterial signals.'
        });
        return;
      }
      handleScenarioC();
    }
    else if (scId === 'D') {
      if (currentUser?.role !== 'LOGISTICS') {
        setRbacNotice({
          title: 'Access Restricted: Logistics Fleet Operator Clearance Required',
          message: 'Scenario D (Freight Demand Shifting & Schedule Optimization) is restricted to Logistics & Fleet Operators. Sign in with a Logistics account to operate this scenario.'
        });
        return;
      }
      handleScenarioD();
    }
  };

  const handleAmbulanceArrival = useCallback(() => {
    setEmergencyData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mission: {
          ...prev.mission,
          status: 'ARRIVED',
          arrivedAt: new Date().toISOString()
        }
      };
    });
  }, []);

  // Auto-release Green Corridor & turn off SOS when ambulance arrives at destination
  useEffect(() => {
    if (emergencyData?.mission?.status === 'ARRIVED') {
      const timer = setTimeout(() => {
        handleClearEmergency();
      }, 2500); // 2.5s pause to celebrate arrival & Golden Hour saved, then automatically turn off SOS
      return () => clearTimeout(timer);
    }
  }, [emergencyData?.mission?.status]);

  const handleVipArrival = useCallback(() => {
    setVipData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'ARRIVED',
        arrivedAt: new Date().toISOString()
      };
    });
  }, []);

  // Auto-release VIP Priority Corridor & turn off VIP SOS automatically when convoy arrives at destination
  useEffect(() => {
    if (vipData?.status === 'ARRIVED') {
      const timer = setTimeout(async () => {
        // Find if there is an active VIP SOS request in sosRequests
        const activeVip = sosRequests.find(r => r.sosType === 'VIP' && (r.status === 'ACTIVE' || r.status === 'VERIFIED'));
        if (activeVip) {
          try {
            await sosAPI.resolveRequest(activeVip._id || activeVip.id);
            await refreshSosState();
          } catch (e) {
            console.warn('Auto resolve VIP SOS notice:', e.message);
          }
        }
        await handleClearVip();
      }, 2500); // 2.5s display of safe arrival, then automatically shut off VIP SOS and clear corridor
      return () => clearTimeout(timer);
    }
  }, [vipData?.status, sosRequests]);

  const handleClearEmergency = async () => {
    const missionId = emergencyData?.mission?._id || 'latest';
    // 1. Immediately close HUD panel and clear map corridor
    setEmergencyData(null);
    setVipData(null);
    setActiveScenario(prev => (prev === 'C' ? null : prev));
    try {
      await cityFlowAPI.clearEmergency(missionId);
    } catch (error) {
      console.warn('Auto clear emergency notice:', error.message);
    } finally {
      await refreshCityState();
    }
  };

  const handleUpdateSignal = async (payload) => {
    // _selectOnly means PoliceDashboard signal grid was clicked — just select, no API call
    if (payload._selectOnly) {
      const sig = signals.find(s => s.id === payload.signalId);
      if (sig) setSelectedSignal(sig);
      return;
    }
    try {
      await cityFlowAPI.updateSignal(payload);
      await refreshCityState();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setRbacNotice({ title: 'Signal Control Denied (HTTP 403)', message: errorMsg });
    }
  };

  const handleReportIncident = async (payload) => {
    try {
      const res = await cityFlowAPI.reportIncident(payload);
      await refreshCityState();
      if (res?.responsePlan) {
        setIncidentResponseModal({
          isOpen: true,
          incident: res.incident || payload,
          plan: res.responsePlan
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Server connection failed';
      console.error('Incident report failed:', errorMsg);
      setRbacNotice({
        title: 'Incident Report Failed',
        message: `Failed to register incident: ${errorMsg}.`
      });
    }
  };

  const handleSimulateIncidentResponse = async () => {
    try {
      const res = await cityFlowAPI.simulateAccidentIncident();
      await refreshCityState();
      setIncidentResponseModal({
        isOpen: true,
        incident: res.incident,
        plan: res.responsePlan
      });
    } catch (error) {
      console.error('Incident simulation failed:', error);
    }
  };

  const handleToggleLogisticsShift = async (tripId) => {
    try {
      await cityFlowAPI.toggleFreightShift(tripId);
      await refreshLogistics();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setRbacNotice({ title: 'Freight Shifting Denied (HTTP 403)', message: errorMsg });
    }
  };

  const handleOptimizeFreight = async (tripData) => {
    try {
      setLoading(true);
      await cityFlowAPI.optimizeLogistics(tripData);
      await refreshLogistics();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setRbacNotice({ title: 'Fleet Optimization Denied (HTTP 403)', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Switch role with RBAC authorization check
  const handleRoleSwitch = (role) => {
    if (role === activeRole) return;

    if (!isRoleAccessible(role)) {
      if (role === 'POLICE') {
        setRbacNotice({
          title: 'Access Restricted: Police Hub Credentials Required',
          message: `Your active account (${currentUser?.name}) has the ${currentUser?.role || 'CITIZEN'} role. Law enforcement signal override and emergency dispatch are restricted to the Traffic Police Hub.`
        });
      } else if (role === 'LOGISTICS') {
        setRbacNotice({
          title: 'Access Restricted: Logistics Fleet Credentials Required',
          message: `Your active account (${currentUser?.name}) has the ${currentUser?.role || 'CITIZEN'} role. Commercial freight load shifting and ML dispatch optimization require verified Logistics Fleet credentials.`
        });
      }
      return;
    }

    setRbacNotice(null);
    setActiveRole(role);
    if (role === 'USER' && !routesData) {
      handleScenarioB();
    } else if (role === 'LOGISTICS' && logisticsTrips.length === 0) {
      handleScenarioD();
    }
  };

  if (!currentUser) {
    return (
      <AuthPage
        targetRoute={currentPath}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          if (currentPath === '/' || currentPath === '') {
            if (user.role === 'POLICE') navigate('/police');
            else if (user.role === 'LOGISTICS') navigate('/logistics');
            else navigate('/citizen');
          }
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050814] text-slate-100 flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* ─── Top Header: CITYFLOW AI (Left) · LIVE ● 21:42 + Route Switcher (Right) ─── */}
      <header className="sticky top-0 z-[600] bg-[#070b1a]/95 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#090e1c] rounded-[10px] flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-black tracking-wider text-white">CITYFLOW <span className="text-cyan-400">AI</span></h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 whitespace-nowrap hidden sm:inline">
                SIH 2026 · SIH26205
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Area: LIVE ● Digital Clock + Route Switcher + Sign Out */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* LIVE ● Clock */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold shadow-inner">
            <span className="text-emerald-400 flex items-center gap-1.5">
              LIVE
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-white tracking-widest">{currentTime}</span>
          </div>

          {/* Persona Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#090e1c] border border-slate-800 rounded-xl text-xs">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              currentUser?.userType === 'EMERGENCY_SPECIAL' ? 'bg-rose-400' : 'bg-emerald-400'
            }`} />
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">{currentUser?.name || 'User'}</span>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 leading-tight">
                  {currentUser?.role || 'USER'}
                </span>
                {currentUser?.userType === 'EMERGENCY_SPECIAL' && (
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                    SPECIAL SOS
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Route Switcher (/citizen | /police | /logistics) */}
          <div className="flex items-center gap-1 bg-[#090e1c] p-1 rounded-xl border border-slate-800">
            {[
              { path: '/citizen', id: 'USER', label: 'Citizen', icon: Users, activeClass: 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' },
              { path: '/police', id: 'POLICE', label: 'Police', icon: Shield, activeClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' },
              { path: '/logistics', id: 'LOGISTICS', label: 'Logistics', icon: Truck, activeClass: 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' },
            ].map(({ path, id, label, icon: Icon, activeClass }) => {
              const isActive = currentPath === path;
              const accessible = isRoleAccessible(id);
              return (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setActiveRole(id);
                    if (id === 'USER' && !routesData) handleScenarioB();
                    if (id === 'LOGISTICS' && logisticsTrips.length === 0) handleScenarioD();
                  }}
                  title={accessible ? `Open ${label} Dashboard (${path})` : `Locked: Requires ${id} authorization`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? activeClass
                      : accessible
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-400 opacity-60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{label}</span>
                  <span className="text-[9px] font-mono opacity-70 hidden xl:inline">{path}</span>
                  {!accessible && <Lock className="w-2.5 h-2.5 text-amber-400 ml-0.5" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            title="Change Account Password"
            className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-950/30 hover:bg-cyan-950/60 transition flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span className="hidden sm:inline">CHANGE PASSWORD</span>
          </button>

          <button
            onClick={() => {
              clearTabSession();
              setCurrentUser(null);
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-rose-500/40 transition cursor-pointer"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* RBAC Security Feedback Banner */}
      {rbacNotice && (
        <div className="w-full px-4 pt-2 shrink-0">
          <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 shadow-lg text-amber-200 text-xs backdrop-blur-md">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-300 block text-xs">{rbacNotice.title}</strong>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">{rbacNotice.message}</p>
              </div>
            </div>
            <button
              onClick={() => setRbacNotice(null)}
              className="text-amber-400 hover:text-amber-200 p-1 rounded hover:bg-amber-900/40 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Body: Left Sidebar + Center Viewport ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Navigation Menu matching Diagram */}
        <SidebarNav
          activeTab={activeNavTab}
          onSelectTab={(tabId) => {
            setActiveNavTab(tabId);
            if (tabId === 'traffic') {
              navigate('/citizen');
              setIsTransitModalOpen(true);
            }
            if (tabId === 'signals') {
              navigate('/police');
              setIsAdaptiveLabOpen(true);
            }
            if (tabId === 'emergency') {
              navigate('/police');
              if (!emergencyData) handleScenarioC();
            }
            if (tabId === 'logistics') {
              navigate('/logistics');
              handleScenarioD();
            }
            if (tabId === 'incidents') setIsPredictionModalOpen(true);
            if (tabId === 'simulation') setIsDigitalTwinOpen(true);
            if (tabId === 'ai-actions') setIsXAIModalOpen(true);
            if (tabId === 'vip-sos') {
              if (currentUser?.role === 'POLICE') {
                navigate('/police');
                handlePoliceAuthorizeVipSos();
              } else if (currentUser?.role === 'LOGISTICS') {
                setRbacNotice({
                  title: 'VIP Authorization Restricted: Police Only',
                  message: 'VIP Priority Green Corridors can ONLY be authorized and deployed by Traffic Police Command.'
                });
              } else {
                navigate('/citizen');
                handleCitizenVipSosClick();
              }
            }
          }}
          metrics={cityMetrics}
          emergencyCount={emergencyData ? 1 : 2}
          riskPercent={61}
          signalsCount={126}
        />

        {/* Dynamic Route Viewport: /police | /logistics | /citizen */}
        {isPoliceRoute ? (
          <PolicePage
            currentUser={currentUser}
            signals={signals}
            selectedSignal={selectedSignal}
            onSelectSignal={setSelectedSignal}
            onUpdateSignal={handleUpdateSignal}
            incidents={incidents}
            emergencyData={emergencyData}
            vipData={vipData}
            onClearVip={handleClearVip}
            onDispatchEmergency={handleScenarioC}
            onClearEmergency={handleClearEmergency}
            onAmbulanceArrived={handleAmbulanceArrival}
            onVipArrived={handleVipArrival}
            hotspotData={hotspotData}
            interventionData={interventionData}
            isApplyingIntervention={isApplyingIntervention}
            onApplyIntervention={handleApplyIntervention}
            onRevertIntervention={handleRevertIntervention}
            onSimulateHotspot={handleScenarioA}
            onSimulateIncidentResponse={handleSimulateIncidentResponse}
            sosRequests={sosRequests}
            onSosUpdated={() => refreshSosState()}
            onEmergencyActivated={(data) => {
              if (data?.routeType === 'VIP_PRIORITY_ROUTE' || data?.sosType === 'VIP') {
                setVipData({ ...data, status: data?.status || 'ACTIVE' });
              } else {
                setEmergencyData(data);
                setActiveScenario('SCENARIO_C_EMERGENCY_SOS');
              }
            }}
            onNavigate={navigate}
            onSignOut={() => {
              clearTabSession();
              setCurrentUser(null);
            }}
          />
        ) : isLogisticsRoute ? (
          <LogisticsPage
            currentUser={currentUser}
            signals={signals}
            incidents={incidents}
            logisticsTrips={logisticsTrips}
            aggregateLogistics={aggregateLogistics}
            onToggleLogisticsShift={handleToggleLogisticsShift}
            onOptimizeFreight={handleOptimizeFreight}
            onNavigate={navigate}
            onSignOut={() => {
              clearTabSession();
              setCurrentUser(null);
            }}
          />
        ) : (
          <CitizenPage
            currentUser={currentUser}
            currentSos={currentSos}
            signals={signals}
            incidents={incidents}
            routesData={routesData}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            onRequestRoute={(origin, dest) => handleScenarioB(origin, dest)}
            emergencyData={emergencyData}
            vipData={vipData}
            onClearVip={handleClearVip}
            onDispatchEmergency={handleScenarioC}
            onClearEmergency={handleClearEmergency}
            onAmbulanceArrived={handleAmbulanceArrival}
            onVipArrived={handleVipArrival}
            cityMetrics={cityMetrics}
            onSosUpdated={(updatedReq) => {
              setCurrentSos(updatedReq);
              refreshSosState();
            }}
            onEmergencyActivated={(data) => {
              if (data?.routeType === 'VIP_PRIORITY_ROUTE' || data?.sosType === 'VIP') {
                setVipData({ ...data, status: data?.status || 'ACTIVE' });
              } else {
                setEmergencyData(data);
                setActiveScenario('SCENARIO_C_EMERGENCY_SOS');
              }
            }}
            onNavigate={navigate}
            onSignOut={() => {
              clearTabSession();
              setCurrentUser(null);
            }}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          />
        )}
      </div>

      {/* ─── Global Intelligence Modals ─── */}
      <IncidentReporterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportIncident}
      />

      <AdaptiveSignalAILab
        isOpen={isAdaptiveLabOpen}
        onClose={() => setIsAdaptiveLabOpen(false)}
      />

      <IncidentResponseModal
        isOpen={incidentResponseModal.isOpen}
        onClose={() => setIncidentResponseModal({ isOpen: false, incident: null, plan: null })}
        incident={incidentResponseModal.incident}
        plan={incidentResponseModal.plan}
        onActuated={() => {
          refreshCityState();
          refreshLogistics();
        }}
      />

      <DigitalTwinSimulatorModal
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      <PublicTransportModal
        isOpen={isTransitModalOpen}
        onClose={() => setIsTransitModalOpen(false)}
      />

      <IncidentPredictionModal
        isOpen={isPredictionModalOpen}
        onClose={() => setIsPredictionModalOpen(false)}
      />

      <ExplainableAIDecisionModal
        isOpen={isXAIModalOpen}
        onClose={() => setIsXAIModalOpen(false)}
        signalId="sig-barakhamba"
        signalName="Signal #12: Barakhamba Junction"
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
