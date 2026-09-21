import React from 'react';
import { 
  Activity, 
  Siren, 
  ShieldAlert, 
  Gauge, 
  CloudRain, 
  Sun, 
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function CityHealthBar({
  congestionIndex = 72,
  emergencyCount = 2,
  riskPercent = 61,
  averageSpeedKmph = 26.4,
  weatherCondition = 'CLEAR',
  signalsCount = 126,
  onOpenTraffic,
  onOpenEmergency,
  onOpenRisk
}) {
  const isHighTraffic = congestionIndex > 70;
  const hasEmergency = emergencyCount > 0;
  const isHighRisk = riskPercent > 65;

  return (
    <div className="w-full bg-[#0d1226]/90 border-b border-slate-800/80 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md backdrop-blur-md">
      
      {/* Title & Section Tag */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider">
            CITY HEALTH
          </span>
        </div>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="text-xs text-slate-400 hidden lg:inline font-mono">
          Metropolitan Mobility Telemetry
        </span>
      </div>

      {/* Dynamic Key Metrics Strip */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs font-mono">
        
        {/* Metric 1: Traffic */}
        <button 
          onClick={onOpenTraffic}
          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer group"
          title="Click to inspect Traffic & Public Transit Layer"
        >
          <span className="text-slate-400 font-bold group-hover:text-cyan-300">Traffic:</span>
          <span className={`font-black flex items-center gap-1 ${
            isHighTraffic ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {congestionIndex}%
            {isHighTraffic ? (
              <TrendingUp className="w-3 h-3 text-amber-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-400" />
            )}
          </span>
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Metric 2: Emergencies */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer group"
          title="Click to inspect Emergency Green Corridor"
        >
          <span className="text-slate-400 font-bold group-hover:text-rose-300">Emergencies:</span>
          <span className={`font-black flex items-center gap-1 ${
            hasEmergency ? 'text-rose-400 animate-pulse' : 'text-slate-300'
          }`}>
            <Siren className="w-3 h-3" />
            {emergencyCount}
          </span>
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Metric 3: Risk */}
        <button
          onClick={onOpenRisk}
          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer group"
          title="Click to view AI Incident Prediction & Preventive Safety Shield"
        >
          <span className="text-slate-400 font-bold group-hover:text-amber-300">Risk:</span>
          <span className={`font-black flex items-center gap-1 ${
            isHighRisk ? 'text-rose-400' : 'text-amber-300'
          }`}>
            <ShieldAlert className="w-3 h-3" />
            {riskPercent}%
          </span>
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Metric 4: Speed */}
        <div className="flex items-center gap-1.5 hidden md:flex">
          <span className="text-slate-400 font-bold">Speed:</span>
          <span className="text-cyan-300 font-black">{averageSpeedKmph} km/h</span>
        </div>

        <span className="text-slate-700 hidden lg:inline">|</span>

        {/* Metric 5: Managed Signals */}
        <div className="flex items-center gap-1.5 hidden lg:flex">
          <span className="text-slate-400 font-bold">Signals:</span>
          <span className="text-emerald-400 font-black">🚦 {signalsCount}</span>
        </div>
      </div>
    </div>
  );
}
