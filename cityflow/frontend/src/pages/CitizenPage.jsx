import React, { useState } from 'react';
import MapView from '../components/MapView';
import UserDashboard from './UserDashboard';
import SosRequestPanel from '../components/SosRequestPanel';
import EmergencyCorridorHUD from '../components/EmergencyCorridorHUD';
import VipCorridorHUD from '../components/VipCorridorHUD';
import IncidentReporterModal from '../components/IncidentReporterModal';
import PublicTransportModal from '../components/PublicTransportModal';
import RoleAccessDenied from '../components/RoleAccessDenied';
import { Radio, Users, Shield, Truck, AlertCircle, KeyRound, Siren, Navigation, Crown } from 'lucide-react';

export default function CitizenPage({
  currentUser,
  currentSos,
  signals = [],
  incidents = [],
  routesData,
  selectedRouteId,
  onSelectRoute,
  onRequestRoute,
  emergencyData,
  vipData = null,
  onClearVip = null,
  onDispatchEmergency,
  onClearEmergency,
  onAmbulanceArrived,
  onVipArrived = null,
  cityMetrics,
  onSosUpdated,
  onEmergencyActivated,
  onNavigate,
  onSignOut,
  onOpenChangePassword
}) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);

  // RBAC Access Guard: Citizen page is restricted to role === 'USER'
  if (currentUser && currentUser.role !== 'USER') {
    return (
      <RoleAccessDenied
        currentUser={currentUser}
        targetRouteName="Citizen Dashboard"
        targetRole="USER"
        correctRoute={currentUser.role === 'POLICE' ? '/police' : '/logistics'}
        correctRouteName={currentUser.role === 'POLICE' ? 'Police Dashboard' : 'Logistics Dashboard'}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Route Sub-Header Bar */}
      <div className="bg-[#080d1e] border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            CITIZEN & COMMUTER PORTAL
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Route: /citizen
          </span>
          {currentUser?.userType === 'EMERGENCY_SPECIAL' && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <Siren className="w-3 h-3 text-rose-400" />
              SPECIAL CASE CITIZEN
            </span>
          )}
        </div>

        {/* Quick Nav Switcher */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Dashboards:</span>
          <button
            onClick={() => onNavigate('/citizen')}
            className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
          >
            /citizen
          </button>
          <button
            onClick={() => onNavigate('/police')}
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            /police
          </button>
          <button
            onClick={() => onNavigate('/logistics')}
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            /logistics
          </button>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-4">
        {/* Special Case / VIP Citizen SOS Request Panel */}
        {(currentUser?.userType === 'EMERGENCY_SPECIAL' || currentUser?.userType === 'VIP' || vipData) && (
          <SosRequestPanel
            currentUser={currentUser}
            currentSos={currentSos}
            onSosUpdated={onSosUpdated}
            onEmergencyActivated={onEmergencyActivated}
          />
        )}

        {/* Live City Map Hero */}
        <div className="rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl relative bg-[#070a18]">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <span>🗺️</span>
              LIVE CITY COMMUTER MAP · Real-Time Congestion & Routes
            </span>
            <span className="text-cyan-400 font-bold">126 Intersections Synced</span>
          </div>
          <div className="h-[420px] lg:h-[480px] w-full relative">
            <MapView
              signals={signals}
              incidents={incidents}
              routes={routesData}
              activeScenario={emergencyData ? 'SCENARIO_C_EMERGENCY_SOS' : vipData ? 'VIP_PRIORITY_ROUTE' : null}
              emergencyData={emergencyData}
              vipData={vipData}
              onAmbulanceArrived={onAmbulanceArrived}
              onVipArrived={onVipArrived}
            />
          </div>
        </div>

        {/* Active VIP High-Security Priority Corridor HUD */}
        {vipData && (
          <VipCorridorHUD
            vipData={vipData}
            onClearVip={onClearVip}
            signals={signals}
          />
        )}

        {/* Active Emergency Green Corridor HUD (Visible if active) */}
        {emergencyData && (
          <EmergencyCorridorHUD
            emergencyData={emergencyData}
            onDispatchEmergency={onDispatchEmergency}
            onClearEmergency={onClearEmergency}
            signals={signals}
          />
        )}

        {/* Citizen Navigation & Route Optimization Deck */}
        <UserDashboard
          routes={routesData}
          onSelectRoute={onSelectRoute}
          selectedRouteId={selectedRouteId}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          cityMetrics={cityMetrics}
          onRequestRoute={onRequestRoute}
          currentUser={currentUser}
          currentSos={currentSos}
          onSosUpdated={onSosUpdated}
          onEmergencyActivated={onEmergencyActivated}
        />
      </div>

      {/* Citizen Modals */}
      <IncidentReporterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <PublicTransportModal
        isOpen={isTransitModalOpen}
        onClose={() => setIsTransitModalOpen(false)}
      />
    </div>
  );
}
