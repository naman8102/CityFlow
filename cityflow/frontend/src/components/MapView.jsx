import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, ShieldAlert, Siren, Navigation, Radio } from 'lucide-react';

// Fix Leaflet Default Icon asset paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to auto-pan when routes or emergencies change
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ 
  signals = [], 
  incidents = [], 
  routes = null, 
  activeScenario = null, 
  emergencyData = null,
  vipData = null,
  onSignalClick = null,
  onAmbulanceArrived = null,
  onVipArrived = null
}) {
  const defaultCenter = [28.6328, 77.2197]; // Central Delhi / Connaught Place Hub

  // Custom DOM Icon creator for Signals
  const createSignalIcon = (signal) => {
    const isPreempted = signal.preemptedByEmergency;
    const color = isPreempted 
      ? '#10b981' 
      : signal.currentState === 'GREEN' 
      ? '#10b981' 
      : signal.currentState === 'YELLOW' 
      ? '#f59e0b' 
      : '#ef4444';

    return L.divIcon({
      className: 'custom-signal-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full animate-ping opacity-40" style="background-color: ${color}"></span>
          <div class="relative w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style="background-color: ${color}">
            ${signal.remainingSeconds || 30}
          </div>
          ${isPreempted ? '<span class="absolute -top-3 -right-2 text-emerald-400 text-xs font-black">⚡SOS</span>' : ''}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Custom icon for emergency vehicle
  const ambulanceIcon = L.divIcon({
    className: 'custom-ambulance-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-9 h-9 rounded-full animate-ping bg-rose-500 opacity-50"></span>
        <div class="w-8 h-8 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center shadow-xl text-white font-bold text-xs">
          🚑
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Custom icon for VIP Convoy Marker
  const vipConvoyIcon = useMemo(() => L.divIcon({
    className: 'custom-vip-convoy-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-11 h-11 rounded-full animate-ping bg-purple-500 opacity-60"></span>
        <div class="w-9 h-9 bg-gradient-to-br from-purple-700 to-indigo-900 border-2 border-amber-300 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.8)] text-white text-lg">
          👑
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  }), []);

  // Custom icon for VIP Origin (Source)
  const vipSourceIcon = useMemo(() => L.divIcon({
    className: 'custom-vip-source-icon',
    html: `
      <div class="relative flex flex-col items-center">
        <span class="absolute -top-1 w-8 h-8 rounded-full bg-purple-500/50 animate-ping"></span>
        <div class="relative w-8 h-8 rounded-xl border-2 border-purple-300 bg-purple-950 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.9)]">
          🏛️
        </div>
        <span class="mt-1 px-1.5 py-0.5 rounded bg-purple-950/95 border border-purple-400 text-[9px] font-mono font-black text-purple-200 shadow whitespace-nowrap">
          VIP ORIGIN
        </span>
      </div>
    `,
    iconSize: [64, 52],
    iconAnchor: [32, 26]
  }), []);

  // Custom icon for VIP Destination
  const vipDestIcon = useMemo(() => L.divIcon({
    className: 'custom-vip-dest-icon',
    html: `
      <div class="relative flex flex-col items-center">
        <span class="absolute -top-1 w-8 h-8 rounded-full bg-amber-400/50 animate-ping"></span>
        <div class="relative w-8 h-8 rounded-xl border-2 border-amber-300 bg-amber-950 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(245,158,11,0.9)]">
          🏁
        </div>
        <span class="mt-1 px-1.5 py-0.5 rounded bg-amber-950/95 border border-amber-400 text-[9px] font-mono font-black text-amber-200 shadow whitespace-nowrap">
          DESTINATION
        </span>
      </div>
    `,
    iconSize: [64, 52],
    iconAnchor: [32, 26]
  }), []);

  // Smooth animated progression along green corridor road path
  const [ambulanceProgressIndex, setAmbulanceProgressIndex] = useState(0);

  useEffect(() => {
    const path = emergencyData?.corridorPath;
    if (!emergencyData || !Array.isArray(path) || path.length === 0) {
      setAmbulanceProgressIndex(0);
      return;
    }

    if (emergencyData.mission?.status === 'ARRIVED') {
      setAmbulanceProgressIndex(path.length - 1);
      return;
    }

    // Step forward along road waypoints (~150ms interval = ~15-18 seconds to reach hospital)
    const totalWaypoints = path.length;
    const interval = setInterval(() => {
      setAmbulanceProgressIndex(prev => {
        const next = prev + 1;
        if (next >= totalWaypoints - 1) {
          clearInterval(interval);
          if (onAmbulanceArrived) {
            onAmbulanceArrived();
          }
          return totalWaypoints - 1;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [emergencyData?.corridorPath, emergencyData?.mission?.status]);

  const animatedAmbulancePosition = useMemo(() => {
    const path = emergencyData?.corridorPath;
    if (Array.isArray(path) && path.length > 0) {
      const idx = Math.min(ambulanceProgressIndex, path.length - 1);
      const pt = path[idx];
      if (Array.isArray(pt)) return [pt[0], pt[1]];
      if (pt && typeof pt.lat === 'number') return [pt.lat, pt.lng];
    }
    if (emergencyData?.currentAmbulanceLocation) {
      return [emergencyData.currentAmbulanceLocation.lat, emergencyData.currentAmbulanceLocation.lng];
    }
    if (emergencyData?.mission?.currentLocation) {
      return [emergencyData.mission.currentLocation.lat, emergencyData.mission.currentLocation.lng];
    }
    return defaultCenter;
  }, [emergencyData, ambulanceProgressIndex, defaultCenter]);

  // Smooth animated progression of VIP Convoy along VIP priority road path
  const [vipProgressIndex, setVipProgressIndex] = useState(0);
  const onVipArrivedRef = useRef(onVipArrived);
  useEffect(() => {
    onVipArrivedRef.current = onVipArrived;
  }, [onVipArrived]);

  const hasReportedVipArrivalRef = useRef(false);

  useEffect(() => {
    const vipPath = vipData?.corridorPath || (emergencyData?.routeType === 'VIP_PRIORITY_ROUTE' ? emergencyData.corridorPath : null);
    if (!vipPath || !Array.isArray(vipPath) || vipPath.length === 0) {
      setVipProgressIndex(0);
      hasReportedVipArrivalRef.current = false;
      return;
    }

    if (vipData?.status === 'ARRIVED' || vipData?.mission?.status === 'ARRIVED') {
      setVipProgressIndex(vipPath.length - 1);
      return;
    }

    setVipProgressIndex(0);
    hasReportedVipArrivalRef.current = false;
    const totalWaypoints = vipPath.length;

    // Smooth traversal: dynamically calculated interval (~120ms to 240ms) giving ~5 to 6s smooth movement from source to dest
    const stepIntervalMs = Math.max(120, Math.min(260, Math.round(5500 / Math.max(1, totalWaypoints))));

    const interval = setInterval(() => {
      setVipProgressIndex(prev => {
        const next = prev + 1;
        if (next >= totalWaypoints - 1) {
          clearInterval(interval);
          if (!hasReportedVipArrivalRef.current) {
            hasReportedVipArrivalRef.current = true;
            if (onVipArrivedRef.current) {
              onVipArrivedRef.current();
            }
          }
          return totalWaypoints - 1;
        }
        return next;
      });
    }, stepIntervalMs);

    return () => clearInterval(interval);
  }, [vipData?.corridorPath, vipData?.status, emergencyData?.routeType]);

  const animatedVipPosition = useMemo(() => {
    const vipPath = vipData?.corridorPath || (emergencyData?.routeType === 'VIP_PRIORITY_ROUTE' ? emergencyData.corridorPath : null);
    if (Array.isArray(vipPath) && vipPath.length > 0) {
      const idx = Math.min(vipProgressIndex, vipPath.length - 1);
      const pt = vipPath[idx];
      if (Array.isArray(pt)) return [pt[0], pt[1]];
      if (pt && typeof pt.lat === 'number') return [pt.lat, pt.lng];
    }
    return defaultCenter;
  }, [vipData, emergencyData, vipProgressIndex, defaultCenter]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b0f19]">
      {/* HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none flex flex-col gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-2 text-xs font-mono text-cyan-400 pointer-events-auto shadow-lg backdrop-blur-md">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>CITYFLOW REAL-TIME ARTERIAL MESH: ONLINE</span>
        </div>
        {emergencyData && (
          <div className="glass-panel px-3 py-1.5 rounded-lg border border-emerald-500/50 flex items-center gap-2 text-xs font-mono text-emerald-300 pointer-events-auto animate-bounce bg-emerald-950/60 shadow-xl">
            <Siren className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>GREEN CORRIDOR PREEMPTION ENGAGED</span>
          </div>
        )}
      </div>

      {/* Map Component */}
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full dark-tiles z-0"
        style={{ minHeight: '100%', height: '100%' }}
      >
        <MapRecenter center={defaultCenter} />
        
        {/* OpenStreetMap Tile Provider */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Conventional Congested Route (Scenario B) */}
        {routes && routes.conventionalRoute && (
          <Polyline 
            positions={routes.conventionalRoute.coordinates}
            pathOptions={{ 
              color: '#ef4444', 
              weight: 5, 
              opacity: 0.85, 
              dashArray: '8, 8' 
            }}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Conventional Route
                </div>
                <div>Delay: +{routes.conventionalRoute.delayMinutes} min</div>
                <div>LOS: {routes.conventionalRoute.levelOfService}</div>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* AI-Coordinated Route (Scenario B) */}
        {routes && routes.aiOptimizedRoute && (
          <Polyline 
            positions={routes.aiOptimizedRoute.coordinates}
            pathOptions={{ 
              color: '#06b6d4', 
              weight: 6, 
              opacity: 0.95 
            }}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-cyan-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" /> CityFlow AI Route
                </div>
                <div>Saved: {routes.aiOptimizedRoute.timeSavedMinutes} min</div>
                <div>Safety Index: {routes.aiOptimizedRoute.safetyIndex}/100</div>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* Priority Green Corridor for Emergency SOS (Scenario C) */}
        {emergencyData && emergencyData.corridorPath && emergencyData.routeType !== 'VIP_PRIORITY_ROUTE' && emergencyData.sosType !== 'VIP' && (
          <>
            {/* Outer Ambient Corridor Glow */}
            <Polyline 
              positions={emergencyData.corridorPath}
              pathOptions={{ 
                color: '#10b981', 
                weight: 16, 
                opacity: 0.3,
                lineCap: 'round'
              }}
            />
            {/* Core Green Wave Corridor */}
            <Polyline 
              positions={emergencyData.corridorPath}
              pathOptions={{ 
                color: '#34d399', 
                weight: 7, 
                opacity: 0.95,
                lineCap: 'round'
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs font-mono">
                  <div className="font-black text-emerald-400 flex items-center gap-1 mb-1">
                    <Siren className="w-4 h-4 text-emerald-400" /> SOVEREIGN EMERGENCY GREEN CORRIDOR
                  </div>
                  <div>ETA: <b className="text-white">11:26 min</b> <span className="text-emerald-400 font-bold">(Saved 7:16 min)</span></div>
                  <div>Preempted Intersections: <b className="text-white">6 Connected Signals (100% GREEN)</b></div>
                  <div>Traffic Diverted: <b className="text-amber-300">14% to Bypass Arterials</b></div>
                  <div>Priority: <span className="text-rose-400 font-bold">Level 1 Sovereign Life-Saving</span></div>
                </div>
              </Popup>
            </Polyline>

            {/* Active Emergency Vehicle Marker */}
            <Marker 
              position={animatedAmbulancePosition} 
              icon={ambulanceIcon}
            >
              <Popup>
                <div className="p-2.5 text-xs font-mono">
                  <div className="font-black text-rose-400 flex items-center gap-1 mb-1">
                    <Siren className="w-4 h-4" /> AMBULANCE DL-01-EQ-8812
                  </div>
                  <div>Mission: <b className="text-white">Critical Cardiac Trauma Transit</b></div>
                  <div>Status: <span className="text-emerald-400 font-bold">{emergencyData.mission?.status === 'ARRIVED' ? 'ARRIVED at Hospital' : 'In Transit (Green Wave Active)'}</span></div>
                  <div>Signals Cleared: <span className="text-emerald-300 font-bold">{emergencyData.mission?.status === 'ARRIVED' ? 'Corridor Auto-Releasing' : '6/6 GREEN WAVE LOCKED'}</span></div>
                  <div className="text-[10px] text-cyan-300 mt-1">ETA: 11:26 min (Saved 7:16 min) · 14% Traffic Diverted</div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DISTINCT VIP PRIORITY CORRIDOR (VIP_PRIORITY_ROUTE)
            ══════════════════════════════════════════════════════════════════════════ */}
        {((vipData && vipData.corridorPath) || (emergencyData && (emergencyData.routeType === 'VIP_PRIORITY_ROUTE' || emergencyData.sosType === 'VIP'))) && (() => {
          const vipCorridorPath = vipData?.corridorPath || emergencyData?.corridorPath || emergencyData?.waypoints || emergencyData?.vipRoute?.coordinates || [];
          if (!Array.isArray(vipCorridorPath) || vipCorridorPath.length === 0) return null;
          const midIdx = Math.floor(vipCorridorPath.length / 2);
          const convoyPos = vipCorridorPath[midIdx];

          return (
            <>
              {/* Outer Ambient Purple Glow */}
              <Polyline 
                positions={vipCorridorPath}
                pathOptions={{ 
                  color: '#a855f7', 
                  weight: 18, 
                  opacity: 0.35,
                  lineCap: 'round'
                }}
              />
              {/* Core VIP Corridor with Gold Accents */}
              <Polyline 
                positions={vipCorridorPath}
                pathOptions={{ 
                  color: '#c084fc', 
                  weight: 7, 
                  opacity: 0.95,
                  dashArray: '8, 8',
                  lineCap: 'round'
                }}
              >
                <Popup>
                  <div className="p-2.5 text-xs font-mono">
                    <div className="font-black text-purple-400 flex items-center gap-1.5 mb-1">
                      <span>👑</span> VIP HIGH-SECURITY PRIORITY CORRIDOR
                    </div>
                    <div>Route ID: <b className="text-white">VIP_PRIORITY_ROUTE</b></div>
                    <div>Security Level: <span className="text-amber-300 font-bold">Z+ Protocol State Escort</span></div>
                    <div>Convoy Speed: <b className="text-white">54 km/h Security Pace</b></div>
                    <div>Safety Index: <b className="text-cyan-300">96 / 100</b> <span className="text-emerald-400 font-bold">(0 Incidents)</span></div>
                    <div>Corridor Status: <span className="text-purple-300 font-bold">Arterials Cleared for Convoy</span></div>
                  </div>
                </Popup>
              </Polyline>

              {/* VIP Origin (Source) Marker */}
              {vipCorridorPath.length > 0 && (
                <Marker 
                  position={Array.isArray(vipCorridorPath[0]) ? [vipCorridorPath[0][0], vipCorridorPath[0][1]] : [vipCorridorPath[0].lat, vipCorridorPath[0].lng]} 
                  icon={vipSourceIcon}
                >
                  <Popup>
                    <div className="p-2 text-xs font-mono">
                      <div className="font-bold text-purple-400 mb-0.5 flex items-center gap-1">
                        🏛️ VIP ORIGIN (Source)
                      </div>
                      <div className="text-slate-300">Diplomatic & State Dignitary Origin</div>
                      <div className="text-purple-300 text-[10px]">Escort departure point</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* VIP Destination Marker */}
              {vipCorridorPath.length > 1 && (
                <Marker 
                  position={
                    Array.isArray(vipCorridorPath[vipCorridorPath.length - 1]) 
                      ? [vipCorridorPath[vipCorridorPath.length - 1][0], vipCorridorPath[vipCorridorPath.length - 1][1]] 
                      : [vipCorridorPath[vipCorridorPath.length - 1].lat, vipCorridorPath[vipCorridorPath.length - 1].lng]
                  } 
                  icon={vipDestIcon}
                >
                  <Popup>
                    <div className="p-2 text-xs font-mono">
                      <div className="font-bold text-amber-400 mb-0.5 flex items-center gap-1">
                        🏁 VIP DESTINATION
                      </div>
                      <div className="text-slate-300">Central Secretariat / Secured Complex</div>
                      <div className="text-emerald-400 text-[10px] font-bold">
                        {vipProgressIndex >= vipCorridorPath.length - 1 ? 'Convoy Arrived · Auto-Releasing' : 'Awaiting Motorcade Arrival'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Animated VIP Convoy Marker (Source -> Destination progression) */}
              {animatedVipPosition && (
                <Marker 
                  position={animatedVipPosition} 
                  icon={vipConvoyIcon}
                >
                  <Popup>
                    <div className="p-2.5 text-xs font-mono">
                      <div className="font-black text-purple-400 flex items-center gap-1 mb-1">
                        <span>👑</span> STATE VIP MOTORCADE
                      </div>
                      <div>Vehicle: <b className="text-white">DL-01-VIP-0001 · Armed Escort</b></div>
                      <div>Route: <span className="text-purple-300 font-bold">VIP_PRIORITY_ROUTE</span></div>
                      <div>Progress: <span className="text-cyan-300 font-bold">Waypoint {vipProgressIndex + 1} / {vipCorridorPath.length}</span></div>
                      <div>Status: <span className="text-emerald-400 font-bold">{vipProgressIndex >= vipCorridorPath.length - 1 ? '🏁 ARRIVED at Destination' : 'In Transit (Source ➔ Destination)'}</span></div>
                      <div>Security: <span className="text-purple-300 font-bold">{vipProgressIndex >= vipCorridorPath.length - 1 ? 'Corridor Auto-Releasing...' : '5 Signals Locked GREEN'}</span></div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          );
        })()}

        {/* Traffic Signal Markers */}
        {signals.map(signal => (
          <Marker
            key={signal.id}
            position={[signal.location.lat, signal.location.lng]}
            icon={createSignalIcon(signal)}
            eventHandlers={{
              click: () => onSignalClick && onSignalClick(signal)
            }}
          >
            <Popup>
              <div className="p-2 text-xs text-slate-200">
                <div className="font-bold text-cyan-400 mb-1">{signal.name}</div>
                <div>Current Phase: <span className="font-bold uppercase text-white">{signal.currentState}</span></div>
                <div>Remaining: {signal.remainingSeconds}s</div>
                <div>AI Adaptive: {signal.aiAdaptiveEnabled ? 'ENABLED' : 'MANUAL'}</div>
                {signal.preemptedByEmergency && (
                  <div className="text-emerald-400 font-bold mt-1 animate-pulse">
                    ⚡ PREEMPTED FOR EMERGENCY PASSAGE
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incidents & Hazards Markers */}
        {incidents.map(inc => (
          <CircleMarker
            key={inc._id}
            center={[inc.location.lat, inc.location.lng]}
            radius={14}
            pathOptions={{
              color: inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
              fillColor: inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.45,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2 text-xs text-slate-200">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {inc.type}
                </div>
                <div className="font-semibold">{inc.title}</div>
                <div className="text-slate-400 text-[11px]">{inc.location.address}</div>
                <div className="text-rose-400 mt-1 font-mono">Severity: {inc.severity}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend Footer */}
      <div className="absolute bottom-3 right-3 z-[500] glass-panel px-3 py-2 rounded-lg text-[11px] flex items-center gap-4 text-slate-300 pointer-events-auto border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>CityFlow AI Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Conventional Delay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Green Wave Preemption</span>
        </div>
      </div>
    </div>
  );
}
