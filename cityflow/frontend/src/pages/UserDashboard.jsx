import React, { useState } from 'react';
import RouteComparisonCard from '../components/RouteComparisonCard';
import SosRequestPanel from '../components/SosRequestPanel';
import { Navigation, AlertCircle, Compass, MapPin, ChevronDown, RefreshCw } from 'lucide-react';

const CITY_LANDMARKS = [
  { id: 'rml-hospital', label: 'Dr. RML Hospital', lat: 28.6289, lng: 77.2065 },
  { id: 'ndrs', label: 'New Delhi Railway Station', lat: 28.6448, lng: 77.2167 },
  { id: 'connaught-place', label: 'Connaught Place Hub', lat: 28.6328, lng: 77.2197 },
  { id: 'aiims', label: 'AIIMS Trauma Center', lat: 28.5684, lng: 77.2066 },
  { id: 'india-gate', label: 'India Gate Roundabout', lat: 28.6129, lng: 77.2295 },
  { id: 'okhla', label: 'Okhla Industrial Area', lat: 28.5355, lng: 77.2728 },
  { id: 'barakhamba', label: 'Barakhamba Junction', lat: 28.6280, lng: 77.2240 },
  { id: 'azadpur', label: 'Azadpur Mandi Terminal', lat: 28.7108, lng: 77.1785 },
];

export default function UserDashboard({ 
  routes, 
  onSelectRoute, 
  selectedRouteId, 
  onOpenReportModal,
  cityMetrics,
  onRequestRoute,
  currentUser,
  currentSos,
  onSosUpdated,
  onEmergencyActivated
}) {
  const [originId, setOriginId] = useState('rml-hospital');
  const [destId, setDestId] = useState('ndrs');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const originNode = CITY_LANDMARKS.find(l => l.id === originId);
  const destNode = CITY_LANDMARKS.find(l => l.id === destId);

  const handleRecalculate = async () => {
    if (originId === destId) {
      alert('Origin and destination must be different locations.');
      return;
    }
    setIsLoading(true);
    await onRequestRoute(originNode, destNode);
    setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
    setIsLoading(false);
  };

  const swapLocations = () => {
    setOriginId(destId);
    setDestId(originId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Special Case Citizen SOS Request Panel (Only rendered if EMERGENCY_SPECIAL) */}
      {currentUser?.userType === 'EMERGENCY_SPECIAL' && (
        <SosRequestPanel
          currentUser={currentUser}
          currentSos={currentSos}
          onSosUpdated={onSosUpdated}
          onEmergencyActivated={onEmergencyActivated}
        />
      )}

      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">Citizen & Commuter Portal</span>
          <h2 className="text-lg font-bold text-white">Smart Urban Navigation & Congestion Shield</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            CityFlow AI evaluates real-time arterial capacity using BPR delay estimation to route you around gridlock.
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="py-2 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md shrink-0"
        >
          <AlertCircle className="w-4 h-4 text-rose-400" />
          Report Road Incident
        </button>
      </div>

      {/* Interactive Origin & Destination Selector */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">Select Your Route</span>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Origin Selector */}
          <div className="flex-1 relative">
            <label className="absolute -top-2 left-2 text-[10px] text-emerald-400 font-mono font-bold bg-[#0d1526] px-1">FROM</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <select
                value={originId}
                onChange={e => setOriginId(e.target.value)}
                className="w-full bg-[#080d1a] border border-emerald-500/30 rounded-lg pl-9 pr-8 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-400 appearance-none cursor-pointer"
              >
                {CITY_LANDMARKS.map(l => (
                  <option key={l.id} value={l.id} disabled={l.id === destId}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapLocations}
            className="self-center sm:self-auto p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-90 shrink-0"
            title="Swap origin and destination"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>

          {/* Destination Selector */}
          <div className="flex-1 relative">
            <label className="absolute -top-2 left-2 text-[10px] text-cyan-400 font-mono font-bold bg-[#0d1526] px-1">TO</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <select
                value={destId}
                onChange={e => setDestId(e.target.value)}
                className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-lg pl-9 pr-8 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
              >
                {CITY_LANDMARKS.map(l => (
                  <option key={l.id} value={l.id} disabled={l.id === originId}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Recalculate Button */}
        <div className="flex items-center justify-between">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Last computed: {lastRefreshed}
            </span>
          )}
          <button
            onClick={handleRecalculate}
            disabled={isLoading || originId === destId}
            className="ml-auto py-2 px-5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-cyan-500/25"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Compass className="w-4 h-4" />
            )}
            {isLoading ? 'Computing BPR Routing...' : 'Calculate AI Alternative Route'}
          </button>
        </div>

        {/* Selected Coordinates Info */}
        <div className="flex gap-3 text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
          <span className="text-emerald-400">▲ {originNode?.lat?.toFixed(4)}, {originNode?.lng?.toFixed(4)}</span>
          <span className="text-cyan-400">▼ {destNode?.lat?.toFixed(4)}, {destNode?.lng?.toFixed(4)}</span>
        </div>
      </div>

      {/* Congestion Metrics Bar */}
      {cityMetrics && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${cityMetrics.cityCongestionIndex > 70 ? 'bg-red-500' : cityMetrics.cityCongestionIndex > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono">City Congestion</div>
              <div className={`font-bold ${cityMetrics.cityCongestionIndex > 70 ? 'text-red-400' : cityMetrics.cityCongestionIndex > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {cityMetrics.cityCongestionIndex}%
              </div>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono">Avg Network Speed</div>
              <div className="font-bold text-cyan-400">{cityMetrics.averageSpeedKmph} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* Route Comparison Card */}
      {routes ? (
        <RouteComparisonCard 
          routes={routes} 
          onSelectRoute={onSelectRoute}
          selectedRouteId={selectedRouteId}
          origin={originNode}
          destination={destNode}
        />
      ) : (
        <div className="glass-panel p-8 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center gap-2">
          <Compass className="w-8 h-8 text-cyan-500/40 animate-pulse" />
          <p className="text-sm font-semibold text-slate-300">Select origin & destination, then click Calculate</p>
          <p className="text-xs text-slate-500">CityFlow AI will compare routes using the BPR delay formulation.</p>
        </div>
      )}
    </div>
  );
}
