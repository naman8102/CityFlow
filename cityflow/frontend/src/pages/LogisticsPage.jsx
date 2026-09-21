import React from 'react';
import MapView from '../components/MapView';
import LogisticsDashboard from './LogisticsDashboard';
import RoleAccessDenied from '../components/RoleAccessDenied';
import { Truck, Radio, Zap, Fuel, Activity } from 'lucide-react';

export default function LogisticsPage({
  currentUser,
  signals = [],
  incidents = [],
  logisticsTrips = [],
  aggregateLogistics,
  onToggleLogisticsShift,
  onOptimizeFreight,
  onNavigate,
  onSignOut
}) {
  // RBAC Access Guard: Logistics page is restricted to role === 'LOGISTICS'
  if (currentUser && currentUser.role !== 'LOGISTICS') {
    return (
      <RoleAccessDenied
        currentUser={currentUser}
        targetRouteName="Logistics Dashboard"
        targetRole="LOGISTICS"
        correctRoute={currentUser.role === 'POLICE' ? '/police' : '/citizen'}
        correctRouteName={currentUser.role === 'POLICE' ? 'Police Dashboard' : 'Citizen Dashboard'}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Route Sub-Header Bar */}
      <div className="bg-[#061412] border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wide flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            COMMERCIAL FREIGHT & LOGISTICS OPERATIONS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            Route: /logistics
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-400/40 font-bold">
            FLEET COORDINATION ACTIVE
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
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            /police
          </button>
          <button
            onClick={() => onNavigate('/logistics')}
            className="px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold"
          >
            /logistics
          </button>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-4">
        {/* Live Freight Corridor Map */}
        <div className="rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl relative bg-[#070a18]">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              FREIGHT CORRIDOR & ARTERIAL DELAY MAP · Heavy Vehicle Shifting
            </span>
            <span className="text-emerald-400 font-bold">{logisticsTrips.length} Fleet Trucks Tracked</span>
          </div>
          <div className="h-[420px] lg:h-[480px] w-full relative">
            <MapView
              signals={signals}
              incidents={incidents}
              routes={null}
              activeScenario="SCENARIO_D_LOGISTICS_DELAY"
              emergencyData={null}
            />
          </div>
        </div>

        {/* Logistics Operations Deck */}
        <LogisticsDashboard
          trips={logisticsTrips}
          aggregateStats={aggregateLogistics}
          onToggleShift={onToggleLogisticsShift}
          onOptimizeSchedule={onOptimizeFreight}
        />
      </div>
    </div>
  );
}
