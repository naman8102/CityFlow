import { SosRequestDAO } from '../models/SosRequest.js';
import { UserDAO } from '../models/User.js';
import { EmergencyDAO } from '../models/EmergencyMission.js';
import { inMemoryStore, persistStore } from '../config/db.js';
import { sosEventBus } from '../services/sosEventService.js';
import { verifyToken } from '../services/authService.js';
import { OsrmRoutingService } from '../services/osrmRoutingService.js';
import { GeocodingService } from '../services/geocodingService.js';

export const SosController = {
  /**
   * Real-Time Server-Sent Events stream for instant tab synchronization
   */
  streamEvents: async (req, res) => {
    try {
      // Support token in query string since standard browser EventSource cannot send custom headers
      const token = req.query.token || (req.headers.authorization?.replace(/^Bearer\s+/, ''));
      let user = null;
      if (token) {
        try {
          user = verifyToken(token);
        } catch {
          // Allow connection with degraded non-privileged access
        }
      }

      sosEventBus.registerClient(req, res, user);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Special Case Citizen creates an SOS request
   */
  createRequest: async (req, res) => {
    try {
      const userId = req.user?.sub;
      const user = await UserDAO.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }

      // Security check: Only EMERGENCY_SPECIAL or VIP users can request
      if (user.userType !== 'EMERGENCY_SPECIAL' && user.userType !== 'VIP') {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Only VIP or Emergency Special Case registered citizens have authorization to initiate Priority SOS requests.'
        });
      }

      // Duplicate check: Prevent duplicate pending/active requests
      const existing = await SosRequestDAO.findByUserActive(String(user._id));
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Duplicate request prevented: You already have an active emergency request (${existing.requestId}) in status '${existing.status}'.`,
          activeRequest: existing
        });
      }

      const { location, destination, notes = '', emergencyType = 'CRITICAL_MEDICAL_ESCORT', sosType: requestedSosType } = req.body;
      const isVip = requestedSosType === 'VIP' || user.userType === 'VIP';
      const sosType = isVip ? 'VIP' : 'EMERGENCY';
      const routeType = isVip ? 'VIP_PRIORITY_ROUTE' : 'EMERGENCY_GREEN_CORRIDOR';

      const defaultEmergencyLoc = {
        lat: 28.6289,
        lng: 77.2065,
        name: 'Dr. Ram Manohar Lohia Hospital Corridor',
        address: 'Baba Kharak Singh Marg, Connaught Place Arterial'
      };

      const defaultVipLoc = {
        lat: 28.6143,
        lng: 77.1994,
        name: 'Diplomatic Enclave / Chanakyapuri Compound',
        address: 'Shanti Path, Chanakyapuri Security Sector'
      };

      const defaultEmergencyDest = {
        lat: 28.6448,
        lng: 77.2167,
        name: 'New Delhi Railway Station Emergency Hub',
        address: 'Ajmeri Gate Arterial'
      };

      const defaultVipDest = {
        lat: 28.6145,
        lng: 77.2090,
        name: 'PMO / Central Secretariat High Security Zone',
        address: 'Rajpath / Kartavya Path Arterial'
      };

      const resolvedLocation = location && location.lat && location.lng ? location : (isVip ? defaultVipLoc : defaultEmergencyLoc);
      const resolvedDestination = destination && destination.lat && destination.lng ? destination : (isVip ? defaultVipDest : defaultEmergencyDest);

      let preCalculatedRoute = null;
      if (isVip) {
        try {
          preCalculatedRoute = await OsrmRoutingService.calculateVipPriorityRoute(
            resolvedLocation,
            resolvedDestination,
            1.15,
            inMemoryStore.incidents || [],
            inMemoryStore.signals || []
          );
        } catch {
          // Fallback if calculation encounters issue
        }
      }

      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      const newRequest = await SosRequestDAO.create({
        userId: String(user._id),
        userName: user.name,
        userEmail: user.email,
        userType: user.userType,
        sosType,
        routeType,
        location: resolvedLocation,
        destination: resolvedDestination,
        routeDetails: preCalculatedRoute,
        notes: notes.trim() || (isVip ? 'VIP Motorcade / State Dignitary Escort — Security Priority Clear Request' : 'Special Case Citizen Emergency SOS — Priority Traffic Clear Request'),
        emergencyType: isVip ? 'VIP_STATE_ESCORT' : emergencyType,
        status: 'REQUESTED',
        auditLog: [
          {
            action: 'REQUESTED',
            actorId: String(user._id),
            actorRole: user.role,
            timestamp: new Date().toISOString(),
            ipAddress,
            details: isVip ? 'VIP Priority SOS initiated by State VIP user' : 'Emergency SOS request initiated by Special Case Citizen'
          }
        ]
      });

      // Broadcast real-time event to all connected dashboards
      sosEventBus.broadcastSosEvent('SOS_CREATED', newRequest);

      return res.status(201).json({
        success: true,
        message: isVip
          ? 'VIP Priority SOS request successfully transmitted to Traffic Police Command Hub.'
          : 'Emergency SOS request successfully transmitted to Traffic Police Command Hub.',
        request: newRequest
      });
    } catch (error) {
      console.error('[SosController] createRequest error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Citizen queries their active or latest SOS request
   */
  getMyStatus: async (req, res) => {
    try {
      const userId = req.user?.sub;
      const activeRequest = await SosRequestDAO.findByUserActive(userId);
      const latestRequest = activeRequest || (await SosRequestDAO.findLatestByUser(userId));

      return res.json({
        success: true,
        activeRequest: activeRequest || null,
        latestRequest: latestRequest || null
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Police Hub queries all SOS requests
   */
  getAllRequests: async (req, res) => {
    try {
      const requests = await SosRequestDAO.findAllActiveOrRecent();
      return res.json({
        success: true,
        count: requests.length,
        requests
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Police VERIFIES an incoming SOS request
   */
  verifyRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const sosReq = await SosRequestDAO.findById(id);
      if (!sosReq) {
        return res.status(404).json({ success: false, error: 'SOS request not found.' });
      }

      if (sosReq.status !== 'REQUESTED') {
        return res.status(400).json({
          success: false,
          error: `Cannot verify request: Current status is '${sosReq.status}'. Only 'REQUESTED' items can be verified.`
        });
      }

      const officerId = req.user?.sub;
      const officer = await UserDAO.findById(officerId);
      const officerName = officer?.name || 'Traffic Police Officer';
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      const updated = await SosRequestDAO.updateStatus(id, 'VERIFIED', {
        verifiedAt: new Date().toISOString(),
        verifiedBy: String(officerId),
        verifiedByName: officerName
      });

      await SosRequestDAO.addAuditLog(id, {
        action: 'VERIFIED',
        actorId: String(officerId),
        actorRole: 'POLICE',
        ipAddress,
        details: `Verified by Police Officer ${officerName}`
      });

      // Broadcast real-time event to all connected dashboards
      sosEventBus.broadcastSosEvent('SOS_VERIFIED', updated);

      return res.json({
        success: true,
        message: 'SOS request verified successfully. Ready for Green Wave Corridor activation.',
        request: updated
      });
    } catch (error) {
      console.error('[SosController] verifyRequest error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Police PROCEEDS with SOS: Activates SOS and Green Wave Preemption
   */
  proceedRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const sosReq = await SosRequestDAO.findById(id);
      if (!sosReq) {
        return res.status(404).json({ success: false, error: 'SOS request not found.' });
      }

      if (sosReq.status !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          error: `Cannot proceed: Request must be in 'VERIFIED' status before activation. Current status: '${sosReq.status}'.`
        });
      }

      // If VIP SOS, execute dedicated VIP activation
      if (sosReq.sosType === 'VIP') {
        return await SosController.activateVipRequest(req, res);
      }

      const officerId = req.user?.sub;
      const officer = await UserDAO.findById(officerId);
      const officerName = officer?.name || 'Traffic Police Officer';
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      // 1. Preempt 6 arterial signals along the corridor
      const preemptedIds = ['sig-cp-inner', 'sig-barakhamba', 'sig-chelmsford', 'sig-tolstoy', 'sig-janpath', 'sig-mandi-house'];
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
          sig.remainingSeconds = 180;
        }
      });

      // 2. Compute corridor routing coordinates
      const origin = GeocodingService.resolveLocation('ram-manohar-lohia-hospital');
      const destination = GeocodingService.resolveLocation('new-delhi-railway-station');
      let waypoints = [];
      try {
        const routes = await OsrmRoutingService.getComparativeRoutes(origin, destination, 1.2);
        const greenCorridor = routes?.routes?.emergencyCorridor || routes?.emergencyCorridor;
        waypoints = greenCorridor?.coordinates || [];
      } catch {
        // Fallback coordinates if routing API offline
        waypoints = [
          [28.6289, 77.2065],
          [28.6328, 77.2197],
          [28.6448, 77.2167]
        ];
      }

      // Complete/archive any existing missions
      inMemoryStore.emergencyMissions.forEach(m => {
        if (m.status === 'EN_ROUTE' || m.status === 'DISPATCHED') {
          m.status = 'ARRIVED';
          m.arrivedAt = new Date().toISOString();
        }
      });

      // 3. Create Emergency Mission
      const mission = await EmergencyDAO.create({
        missionCode: `SOS-${sosReq.requestId}`,
        vehicleType: 'AMBULANCE',
        vehicleNumber: 'DL-01-EQ-8812',
        origin: { lat: origin.lat, lng: origin.lng, name: origin.name },
        destination: { lat: destination.lat, lng: destination.lng, name: destination.name },
        currentLocation: { lat: origin.lat, lng: origin.lng },
        status: 'EN_ROUTE',
        priority: 'CRITICAL',
        preemptedSignals: preemptedIds,
        timeSavedSeconds: 436,
        waypoints,
        waypointIndex: 0,
        reportedBy: sosReq.userId,
        dispatchSource: 'POLICE'
      });

      // Also ensure in-memory mission has waypoints
      const inMem = inMemoryStore.emergencyMissions.find(m => m._id === mission._id || String(m._id) === String(mission._id));
      if (inMem) {
        inMem.waypoints = waypoints;
        inMem.waypointIndex = 0;
      }
      persistStore();

      // 4. Update SOS Request to ACTIVE
      const updated = await SosRequestDAO.updateStatus(id, 'ACTIVE', {
        activatedAt: new Date().toISOString(),
        activatedBy: String(officerId),
        activatedByName: officerName,
        emergencyMissionId: String(mission._id)
      });

      await SosRequestDAO.addAuditLog(id, {
        action: 'ACTIVATED',
        actorId: String(officerId),
        actorRole: 'POLICE',
        ipAddress,
        details: `Activated by Police Officer ${officerName}. Green Wave Corridor Locked GREEN.`
      });

      const fullPayload = {
        ...updated,
        mission,
        emergencyData: {
          mission,
          corridorPath: waypoints,
          telemetry: {
            etaBeforeAI: '18:42',
            etaAfterAI: '11:26',
            timeSavedFormatted: '7:16 min',
            timeSavedSeconds: 436,
            signalsAffectedCount: preemptedIds.length,
            trafficDivertedPercent: 14,
            corridorSpeedKmph: 48.5,
            arterialPriorityStatus: 'SOVEREIGN_CORRIDOR_ACTIVE'
          }
        }
      };

      // Broadcast real-time event to all connected dashboards
      sosEventBus.broadcastSosEvent('SOS_ACTIVATED', fullPayload);

      return res.json({
        success: true,
        message: 'SOVEREIGN EMERGENCY GREEN CORRIDOR ACTIVATED! Special Case SOS is now LIVE.',
        request: updated,
        mission,
        emergencyData: fullPayload.emergencyData
      });
    } catch (error) {
      console.error('[SosController] proceedRequest error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Police Activates VIP Priority SOS Corridor (VIP_PRIORITY_ROUTE)
   */
  activateVipRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const sosReq = await SosRequestDAO.findById(id);
      if (!sosReq) {
        return res.status(404).json({ success: false, error: 'VIP SOS request not found.' });
      }

      if (sosReq.status !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          error: `Cannot activate VIP SOS: Request must be in 'VERIFIED' status before activation. Current status: '${sosReq.status}'.`
        });
      }

      const officerId = req.user?.sub;
      const officer = await UserDAO.findById(officerId);
      const officerName = officer?.name || 'Traffic Police Officer';
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      // Calculate or retrieve dedicated VIP Priority Route
      const origin = sosReq.location || { lat: 28.6143, lng: 77.1994, name: 'VIP Origin Compound' };
      const destination = sosReq.destination || { lat: 28.6145, lng: 77.2090, name: 'PMO / Central Secretariat High Security Zone' };

      const vipRoute = await OsrmRoutingService.calculateVipPriorityRoute(
        origin,
        destination,
        1.15,
        inMemoryStore.incidents || [],
        inMemoryStore.signals || []
      );

      // Coordinate VIP Security Signals (distinct from emergency signals)
      const vipPreemptedIds = vipRoute.preemptedSignals || ['sig-ashoka-rd', 'sig-kg-marg', 'sig-barakhamba', 'sig-tolstoy'];
      inMemoryStore.signals.forEach(sig => {
        if (vipPreemptedIds.includes(sig.id)) {
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

      // Update SOS Request to ACTIVE
      const updated = await SosRequestDAO.updateStatus(id, 'ACTIVE', {
        routeType: 'VIP_PRIORITY_ROUTE',
        routeDetails: vipRoute,
        corridorPath: vipRoute.coordinates || [],
        activatedAt: new Date().toISOString(),
        activatedBy: String(officerId),
        activatedByName: officerName
      });

      await SosRequestDAO.addAuditLog(id, {
        action: 'ACTIVATED',
        actorId: String(officerId),
        actorRole: 'POLICE',
        ipAddress,
        details: `VIP SOS Activated by Police Officer ${officerName}. VIP Priority Corridor ENGAGED.`
      });

      const fullVipPayload = {
        ...updated,
        sosType: 'VIP',
        routeType: 'VIP_PRIORITY_ROUTE',
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
            preemptedSignalsCount: vipPreemptedIds.length,
            corridorName: vipRoute.name
          }
        }
      };

      sosEventBus.broadcastSosEvent('VIP_SOS_ACTIVATED', fullVipPayload);
      sosEventBus.broadcastSosEvent('SOS_ACTIVATED', fullVipPayload);

      return res.json({
        success: true,
        message: 'VIP HIGH-SECURITY PRIORITY CORRIDOR ACTIVATED! State escort convoy engaged.',
        request: updated,
        vipRoute,
        vipData: fullVipPayload.vipData
      });
    } catch (error) {
      console.error('[SosController] activateVipRequest error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Police RESOLVES an active SOS request
   */
  resolveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const sosReq = await SosRequestDAO.findById(id);
      if (!sosReq) {
        return res.status(404).json({ success: false, error: 'SOS request not found.' });
      }

      const officerId = req.user?.sub;
      const officer = await UserDAO.findById(officerId);
      const officerName = officer?.name || 'Traffic Police Officer';
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

      // Release preemption signals
      inMemoryStore.signals.forEach(sig => {
        if (sig.preemptedByEmergency) {
          sig.preemptedByEmergency = false;
          if (sig.previousState) {
            sig.currentState = sig.previousState.currentState || 'GREEN';
            sig.remainingSeconds = sig.previousState.remainingSeconds || Math.round(sig.cycleSeconds * 0.5);
            delete sig.previousState;
          } else {
            sig.remainingSeconds = Math.round(sig.cycleSeconds * 0.5);
          }
        }
      });
      persistStore();

      const updated = await SosRequestDAO.updateStatus(id, 'RESOLVED', {
        resolvedAt: new Date().toISOString(),
        resolvedBy: String(officerId)
      });

      await SosRequestDAO.addAuditLog(id, {
        action: 'RESOLVED',
        actorId: String(officerId),
        actorRole: 'POLICE',
        ipAddress,
        details: `Resolved by Police Officer ${officerName}`
      });

      sosEventBus.broadcastSosEvent('SOS_RESOLVED', updated);

      return res.json({
        success: true,
        message: 'SOS request resolved. Corridor preemption cleared.',
        request: updated
      });
    } catch (error) {
      console.error('[SosController] resolveRequest error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};
