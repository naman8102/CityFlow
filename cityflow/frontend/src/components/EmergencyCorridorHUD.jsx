import React, { useState, useEffect } from 'react';
import { 
  Siren, CheckCircle2, Clock, Zap, ArrowRight, Shield, AlertTriangle, 
  Activity, Navigation, Compass, Radio, HeartPulse, RefreshCw, X, Play
} from 'lucide-react';

export default function EmergencyCorridorHUD({
  emergencyData,
  onDispatchEmergency,
  onClearEmergency,
  signals = []
}) {
  const [trafficDivertedActive, setTrafficDivertedActive] = useState(true);

  const isArrived = emergencyData?.mission?.status === 'ARRIVED';
  const isEnRoute = !!emergencyData && !isArrived;

  // Auto-close HUD after arrival celebration
  useEffect(() => {
    if (isArrived && onClearEmergency) {
      const timer = setTimeout(() => {
        onClearEmergency();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isArrived, onClearEmergency]);

  // 6 Signals along the corridor
  const corridorSignals = [
    { id: 'sig-rml-gate', name: 'RML Hospital Exit Gate', code: 'N1' },
    { id: 'sig-janpath', name: 'Janpath Arterial Crossing', code: 'N2' },
    { id: 'sig-tolstoy', name: 'Tolstoy Marg Junction', code: 'N3' },
    { id: 'sig-barakhamba', name: 'Barakhamba Central Crossing', code: 'N4' },
    { id: 'sig-cp-inner', name: 'Connaught Circus Feeder', code: 'N5' },
    { id: 'sig-chelmsford', name: 'Chelmsford Railway Gate', code: 'N6' }
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-rose-500/40 bg-[#0c0a17] shadow-2xl relative overflow-hidden flex flex-col gap-4">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-emerald-400 to-rose-500 blur-sm" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${
            isArrived
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : isEnRoute
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Siren className={`w-6 h-6 ${isEnRoute ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                Flagship Emergency System
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isArrived
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : isEnRoute
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isArrived ? 'MISSION ARRIVED' : isEnRoute ? 'SOVEREIGN GREEN WAVE' : 'STANDBY'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
              Sovereign Emergency Green Corridor Hub
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {emergencyData ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onClearEmergency}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isArrived 
                    ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArrived ? 'Arrived · Auto-Releasing SOS...' : 'Release Corridor'}</span>
              </button>
              <button
                onClick={onClearEmergency}
                title="Close Emergency Corridor Panel"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onDispatchEmergency}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-mono font-black flex items-center gap-2 transition cursor-pointer shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 animate-pulse"
            >
              <Siren className="w-4 h-4" />
              <span>Trigger Ambulance SOS</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Corridor Diagram: 🚑 Ambulance ━━━━━━ GREEN CORRIDOR ━━━━━━> 🚦 GREEN */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 relative overflow-hidden">
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>Corridor Signal Actuation Diagram</span>
          <span className="text-emerald-400">100% Locked Green Wave</span>
        </div>

        {/* The Graphic Pipeline */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {/* 1. Ambulance Icon */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 shrink-0">
              <span className="text-base">🚑</span>
              <span className="text-xs font-mono font-bold">Ambulance</span>
            </div>

            {/* Connecting Green Corridor Line */}
            <div className="flex-1 flex items-center justify-center relative min-w-[100px] px-2">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 via-emerald-400 to-emerald-500 animate-pulse w-full" />
              </div>
              <span className="absolute text-[9px] font-mono uppercase tracking-widest text-emerald-300 font-black bg-[#0c0a17] px-2 py-0.5 rounded border border-emerald-500/30">
                GREEN CORRIDOR
              </span>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          {/* 6 Connected Signals Indicators */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
            {corridorSignals.map((sig) => (
              <div 
                key={sig.id}
                className="p-2 rounded-lg bg-[#070b14] border border-emerald-500/50 text-center flex flex-col items-center justify-center relative group shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs">🚦</span>
                  <span className="text-[10px] font-mono font-black text-emerald-400">
                    GREEN
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-300 truncate w-full mt-0.5">
                  {sig.code}: {sig.name.split(' ')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel ETA Comparison Card & Impact Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* Left: Emergency ETA Before vs After (7 Cols) */}
        <div className="md:col-span-7 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Emergency Transit ETA Comparison
              </span>
              <span className="text-[9px] font-mono text-cyan-400">RML ➔ New Delhi Railway Stn</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Before AI */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-900/40">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Before AI (Gridlock)</span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-rose-400">
                  18:42
                </div>
                <span className="text-[10px] font-mono text-slate-400">min : sec</span>
              </div>

              {/* After AI */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">After AI (Green Wave)</span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                  11:26
                </div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold">min : sec</span>
              </div>
            </div>
          </div>

          {/* Time Saved Highlight */}
          <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-200">Golden Hour Critical Delay Saved:</span>
            </div>
            <span className="text-base font-mono font-black text-emerald-300">
              ⏱️ 7:16 min
            </span>
          </div>
        </div>

        {/* Right: Key Measurable Impact Stats (5 Cols) */}
        <div className="md:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2.5">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold pb-2 border-b border-slate-800">
            Measurable System Metrics
          </div>

          {/* Signals Affected */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-300 font-mono">Signals Affected:</span>
            <span className="text-sm font-mono font-black text-cyan-300">6 Intersections</span>
          </div>

          {/* Traffic Diverted */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-300 font-mono">Traffic Diverted:</span>
            <span className="text-sm font-mono font-black text-emerald-300">14% Non-Emergency</span>
          </div>

          {/* Average Corridor Speed */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-300 font-mono">Corridor Speed:</span>
            <span className="text-sm font-mono font-black text-emerald-400">48.5 km/h (+92%)</span>
          </div>

          {/* Survival Probability */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-300 font-mono">Survival Preservation:</span>
            <span className="text-sm font-mono font-black text-emerald-300">94.2% Golden Hour</span>
          </div>
        </div>

      </div>

      {/* 8-Stage Autonomous Lifecycle Strip */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="text-[9px] font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center justify-between">
          <span>8-Stage Autonomous Life-Saving Lifecycle</span>
          <span className="text-cyan-400">Closed-Loop Multi-Agent Execution</span>
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 overflow-x-auto gap-1 py-0.5">
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">1. SOS</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">2. AI Detects</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">3. Fastest Route</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">4. Traffic Predict</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">5. Corridor</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">6. 6 Signals</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">7. Divert 14%</span>
          <span>→</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold">8. Auto-Release</span>
        </div>
      </div>
    </div>
  );
}
