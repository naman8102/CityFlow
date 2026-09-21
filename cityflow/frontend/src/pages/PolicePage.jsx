import React, { useState } from 'react';
import MapView from '../components/MapView';
import PoliceDashboard from './PoliceDashboard';
import PoliceSosQueue from '../components/PoliceSosQueue';
import EmergencyCorridorHUD from '../components/EmergencyCorridorHUD';
import VipCorridorHUD from '../components/VipCorridorHUD';
import IncidentPredictionModal from '../components/IncidentPredictionModal';
import ExplainableAIDecisionModal from '../components/ExplainableAIDecisionModal';
import DigitalTwinSimulatorModal from '../components/DigitalTwinSimulatorModal';
import IncidentResponseModal from '../components/IncidentResponseModal';
import RoleAccessDenied from '../components/RoleAccessDenied';
import { Shield, Radio, Siren, Cpu, Activity, Zap, AlertTriangle, Crown } from 'lucide-react';

export default function PolicePage({
  currentUser,
  signals = [],
  selectedSignal,
  onSelectSignal,
  onUpdateSignal,
  incidents = [],
  emergencyData,
  vipData = null,
  onClearVip = null,
  onDispatchEmergency,
  onClearEmergency,
  onAmbulanceArrived,
  onVipArrived = null,
  hotspotData,
  interventionData,
  isApplyingIntervention,
  onApplyIntervention,
  onRevertIntervention,
  onSimulateHotspot,
  onSimulateIncidentResponse,
  sosRequests = [],
  onSosUpdated,
  onEmergencyActivated,
  onNavigate,
  onSignOut
}) {
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [incidentResponseModal, setIncidentResponseModal] = useState({ isOpen: false, incident: null, plan: null });

  // RBAC Access Guard: Police page is restricted to role === 'POLICE'
  if (currentUser && currentUser.role !== 'POLICE') {
    return (
      <RoleAccessDenied
        currentUser={currentUser}
        targetRouteName="Police Dashboard"
        targetRole="POLICE"
        correctRoute={currentUser.role === 'LOGISTICS' ? '/logistics' : '/citizen'}
        correctRouteName={currentUser.role === 'LOGISTICS' ? 'Logistics Dashboard' : 'Citizen Dashboard'}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Route Sub-Header Bar */}
      <div className="bg-[#070b1a] border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wide flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            TRAFFIC POLICE COMMAND & EMERGENCY HUB
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
            Route: /police
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-400/40 font-bold">
            GRADE 1 AUTHORITY
          </span>
        </div>

        {/* Quick Nav Switcher */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Dashboards:</span>
          <button
            onClick={() => onNavigate('/citizen')}
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            /citizen
          </button>
          <button
            onClick={() => onNavigate('/police')}
            className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold"
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
        {/* Special Case Priority SOS Requests Queue */}
        <PoliceSosQueue
          requests={sosRequests}
          onSosUpdated={onSosUpdated}
          onEmergencyActivated={onEmergencyActivated}
        />

        {/* Live City Map Hero with Police Signal Click Controls */}
        <div className="rounded-2xl border border-indigo-500/40 overflow-hidden shadow-2xl relative bg-[#070a18]">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              POLICE MASTER TACTICAL MAP · Live Signals · Emergency Vectors · Preemptions
            </span>
            <span className="text-indigo-400 font-bold">Click any signal marker to override phase</span>
          </div>
          <div className="h-[440px] lg:h-[520px] w-full relative">
            <MapView
              signals={signals}
              incidents={incidents}
              routes={null}
              activeScenario={emergencyData ? 'SCENARIO_C_EMERGENCY_SOS' : vipData ? 'VIP_PRIORITY_ROUTE' : null}
              emergencyData={emergencyData}
              vipData={vipData}
              onSignalClick={onSelectSignal}
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

        {/* Active Emergency Green Corridor Flagship HUD */}
        {emergencyData && (
          <EmergencyCorridorHUD
            emergencyData={emergencyData}
            onDispatchEmergency={onDispatchEmergency}
            onClearEmergency={onClearEmergency}
            signals={signals}
          />
        )}

        {/* Police Tactical Command Controls Deck */}
        <PoliceDashboard
          signals={signals}
          selectedSignal={selectedSignal}
          onUpdateSignal={onUpdateSignal}
          emergencyData={emergencyData}
          onDispatchEmergency={onDispatchEmergency}
          onClearEmergency={onClearEmergency}
          onSimulateHotspot={onSimulateHotspot}
          hotspotData={hotspotData}
          interventionData={interventionData}
          isApplyingIntervention={isApplyingIntervention}
          onApplyIntervention={onApplyIntervention}
          onRevertIntervention={onRevertIntervention}
          onSimulateIncidentResponse={onSimulateIncidentResponse}
          onOpenIncidentPrediction={() => setIsPredictionModalOpen(true)}
          sosRequests={sosRequests}
          onSosUpdated={onSosUpdated}
          onEmergencyActivated={onEmergencyActivated}
        />
      </div>

      {/* Police Command Modals */}
      <IncidentPredictionModal
        isOpen={isPredictionModalOpen}
        onClose={() => setIsPredictionModalOpen(false)}
      />

      <ExplainableAIDecisionModal
        isOpen={isXAIModalOpen}
        onClose={() => setIsXAIModalOpen(false)}
        signalId={selectedSignal?.id || 'sig-barakhamba'}
        signalName={selectedSignal?.name || 'Signal #12: Barakhamba Junction'}
      />

      <DigitalTwinSimulatorModal
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      <IncidentResponseModal
        isOpen={incidentResponseModal.isOpen}
        onClose={() => setIncidentResponseModal({ isOpen: false, incident: null, plan: null })}
        incident={incidentResponseModal.incident}
        plan={incidentResponseModal.plan}
      />
    </div>
  );
}
