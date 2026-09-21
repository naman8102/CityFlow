import React, { useState } from 'react';
import { 
  Radio, 
  Siren, 
  Truck, 
  Activity, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Gauge, 
  X, 
  TrendingDown, 
  Layers, 
  Navigation,
  Sliders,
  Cpu,
  Sparkles,
  Brain,
  Building2,
  Bus,
  ShieldAlert
} from 'lucide-react';
import LogisticsAITrafficBridge from './LogisticsAITrafficBridge';
import ExplainableAIDecisionModal from './ExplainableAIDecisionModal';
import InfrastructureStressHub from './InfrastructureStressHub';

export default function AIControlCenter({
  cityMetrics,
  signals = [],
  emergencyData,
  hotspotData,
  interventionData,
  logisticsTrips = [],
  aggregateLogistics,
  onSelectSignal,
  onTriggerEmergency,
  onOpenLogistics,
  onApplyIntervention,
  onSelectScenario,
  onOpenAdaptiveLab,
  onOpenDigitalTwin,
  onOpenPublicTransit,
  onOpenIncidentPrediction
}) {
  const [activeModal, setActiveModal] = useState(null); // 'signals' | 'emergencies' | 'logistics' | 'roads'
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);

  // Dynamic calculations
  const congestionScore = cityMetrics?.cityCongestionIndex || 64;
  
  // Dynamic City Status
  let cityStatus = {
    badge: '🟢 STABLE',
    color: 'emerald',
    text: 'Nominal Traffic Flow',
    bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
  };

  if (interventionData) {
    cityStatus = {
      badge: '🟢 AI OPTIMIZED',
      color: 'emerald',
      text: 'Closed-Loop Actuation Active',
      bg: 'bg-emerald-950/50 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    };
  } else if (emergencyData) {
    cityStatus = {
      badge: '🔴 EMERGENCY CORRIDOR',
      color: 'rose',
      text: 'Green Wave Preemption Active',
      bg: 'bg-rose-950/50 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
    };
  } else if (hotspotData) {
    cityStatus = {
      badge: '⚠️ BOTTLENECK DETECTED',
      color: 'amber',
      text: 'LOS F Surge at Barakhamba',
      bg: 'bg-amber-950/50 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    };
  } else if (congestionScore > 75) {
    cityStatus = {
      badge: '🟠 ELEVATED CONGESTION',
      color: 'amber',
      text: 'Peak Surge Approaching Threshold',
      bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300'
    };
  }

  // Dynamic counts
  const totalSignalsCount = 122 + signals.length;
  const activeEmergenciesCount = emergencyData ? 1 : 4;
  const totalLogisticsTrips = 1840 + (logisticsTrips.length || 2);
  const shiftedTripsCount = aggregateLogistics?.shiftedTripsCount || (interventionData ? 8 : 2);
  const criticalRoadsCount = 68;

  // Critical arterial roads mock data for Inspector
  const arterialRoads = [
    { name: 'Barakhamba Road - Tolstoy Marg', vph: hotspotData ? hotspotData.currentVolumeVPH : 2100, cap: 1800, los: hotspotData ? hotspotData.levelOfService : 'D', status: hotspotData ? 'CRITICAL' : 'MODERATE' },
    { name: 'Connaught Circus Inner Ring', vph: 1840, cap: 1600, los: 'D', status: 'HEAVY' },
    { name: 'Chelmsford Road Crossing', vph: 1450, cap: 1500, los: 'C', status: 'OPTIMAL' },
    { name: 'Janpath - Windsor Place', vph: 1250, cap: 1600, los: 'B', status: 'FLOWING' },
    { name: 'Ashoka Road Corridor', vph: 1320, cap: 1500, los: 'B', status: 'FLOWING' },
    { name: 'Vikas Marg Arterial', vph: 1980, cap: 1700, los: 'E', status: 'HEAVY' }
  ];

  return (
    <>
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 shadow-2xl bg-[#090d19]/90 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-sm"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  CityFlow AI Command Center
                </span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  SIH 2026 · PS SIH26205
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                Metropolitan Mobility & Multi-Agent AI Control Hub
              </h2>
            </div>
          </div>

          {/* City Status Pill & Adaptive Signal Lab Trigger */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
            <button
              onClick={onOpenAdaptiveLab}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Adaptive Signal AI</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>

            <button
              onClick={onOpenDigitalTwin}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-400/50 text-purple-300 text-xs font-mono font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.25)] active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>City Digital Twin</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-mono font-bold">NEW</span>
            </button>

            <button
              onClick={onOpenPublicTransit}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-95"
            >
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transit AI Layer</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 font-mono font-bold">+34% Surge</span>
            </button>

            <button
              onClick={onOpenIncidentPrediction}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-rose-500/20 hover:from-rose-500/30 hover:to-amber-500/30 border border-rose-400/50 text-rose-300 text-xs font-mono font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.25)] active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>AI Risk Shield</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 font-mono font-bold">87% NH-24</span>
            </button>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${cityStatus.bg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{cityStatus.badge}</span>
              <span className="text-[10px] opacity-80 hidden md:inline font-normal">({cityStatus.text})</span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Clickable Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5">
          {/* Card 1: 🚦 Signals */}
          <button
            onClick={() => setActiveModal('signals')}
            className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-cyan-500/50 text-left transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold group-hover:text-cyan-400 transition">
                AI Signal Mesh
              </span>
              <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition">
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>🚦 {totalSignalsCount}</span>
              <span className="text-[10px] font-sans text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-normal">
                100% Sync
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{signals.length} Local Core · 122 Mesh</span>
              <span className="text-[10px] font-mono text-cyan-400 underline opacity-0 group-hover:opacity-100 transition">
                Inspect
              </span>
            </div>
          </button>

          {/* Card 2: 🚑 Emergencies */}
          <button
            onClick={() => setActiveModal('emergencies')}
            className={`group p-3.5 rounded-xl text-left transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden border ${
              emergencyData
                ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold group-hover:text-rose-400 transition">
                Emergency Corridors
              </span>
              <span className="text-xs text-slate-500 group-hover:text-rose-400 transition">
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>🚑 {activeEmergenciesCount}</span>
              <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-normal ${
                emergencyData ? 'text-rose-300 bg-rose-900/60 animate-pulse' : 'text-slate-300 bg-slate-800/60'
              }`}>
                {emergencyData ? '1 Live Active' : 'Standby Mesh'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Level 1 Preemption</span>
              <span className="text-[10px] font-mono text-rose-400 underline opacity-0 group-hover:opacity-100 transition">
                Manage
              </span>
            </div>
          </button>

          {/* Card 3: 🚚 Logistics Trips */}
          <button
            onClick={() => setActiveModal('logistics')}
            className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-500/50 text-left transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold group-hover:text-emerald-400 transition">
                Logistics Freight
              </span>
              <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition">
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>🚚 {totalLogisticsTrips.toLocaleString()}</span>
              <span className="text-[10px] font-sans text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-normal">
                {shiftedTripsCount} Shifted
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Off-Peak Shifting Enabled</span>
              <span className="text-[10px] font-mono text-emerald-400 underline opacity-0 group-hover:opacity-100 transition">
                Optimize
              </span>
            </div>
          </button>

          {/* Card 4: 🏗️ Infrastructure Stress & Critical Arterials */}
          <button
            onClick={() => setActiveModal('roads')}
            className={`group p-3.5 rounded-xl text-left transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden border ${
              hotspotData
                ? 'bg-amber-950/30 border-amber-500/60'
                : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold group-hover:text-cyan-400 transition flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" />
                Infra & Roads
              </span>
              <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition">
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>🚗 {criticalRoadsCount}</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded font-normal text-rose-300 bg-rose-950/60 border border-rose-500/40">
                🏗️ 86% Stress
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>BPR · Bridge · Parking</span>
              <span className="text-[10px] font-mono text-cyan-400 underline opacity-0 group-hover:opacity-100 transition">
                Inspect AI
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ─── Modal 1: 🚦 Signals Mesh Inspector ─── */}
      {activeModal === 'signals' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl p-5 rounded-2xl border border-cyan-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚦</span>
                <div>
                  <h3 className="text-base font-bold text-white">Metropolitan Traffic Signal Mesh</h3>
                  <p className="text-xs text-slate-400">126 Signals Total · 4 Core Active Controller Nodes</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Featured Hero Banner for Adaptive Signal AI Lab */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/50 border border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Adaptive Traffic Signal AI Lab
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold">
                      FLAGSHIP DEMO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    4-Arm Splits (North 22s → 42s), Dynamic Phase Reordering & 4-Signal Green Wave
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  onOpenAdaptiveLab && onOpenAdaptiveLab();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch Lab
              </button>
            </div>

            {/* 🧠 Explainable AI Quick Trigger for Signal #12 */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Brain className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>WHY DID AI DO THIS? (Signal #12)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      91% Conf.
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Volume (+38%), Queue (+42%), Speed (-27%), Downstream (-18%), Rain (+9%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsXAIModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition cursor-pointer shrink-0 shadow active:scale-95 flex items-center gap-1"
              >
                <span>Explain Decision</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {signals.map(sig => (
                <div
                  key={sig.id}
                  onClick={() => {
                    onSelectSignal && onSelectSignal(sig);
                    setActiveModal(null);
                  }}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{sig.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Cycle: {sig.cycleSeconds}s · Left: <span className="text-cyan-400">{sig.remainingSeconds}s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      sig.currentState === 'GREEN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                      sig.currentState === 'YELLOW' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                      'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                    }`} />
                    <span className="text-[10px] font-mono font-bold text-slate-300">{sig.currentState}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 flex items-center justify-between">
              <span>Webster Formula Cycle Optimization is active across all 126 network nodes.</span>
              <button
                onClick={() => {
                  onSelectScenario && onSelectScenario('A');
                  setActiveModal(null);
                }}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold shrink-0 cursor-pointer"
              >
                Test Surge (Scenario A)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: 🚑 Emergency Operations Hub ─── */}
      {activeModal === 'emergencies' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl p-5 rounded-2xl border border-rose-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚑</span>
                <div>
                  <h3 className="text-base font-bold text-white">Emergency Green Wave Command</h3>
                  <p className="text-xs text-slate-400">Level 1 Sovereign Preemption & Hospital Arterial Corridors</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emergencyData ? (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">ACTIVE DISPATCH IN PROGRESS</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ETA: {emergencyData.telemetry?.etaAfterAI || '11:26'} (Saved {emergencyData.telemetry?.timeSavedFormatted || '7:16 min'})
                  </span>
                </div>
                <div className="text-sm font-bold text-white">Ambulance DL-01-EQ-8812 (Cardiovascular Trauma)</div>
                <div className="text-xs text-slate-300">
                  Corridor: Ram Manohar Lohia Hospital → New Delhi Railway Station Trauma Gate
                </div>

                {/* Corridor Flow Diagram */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>🚑 Ambulance</span>
                    <span className="text-emerald-400 animate-pulse">━━━━━━ GREEN CORRIDOR ━━━━━━&gt;</span>
                    <span className="text-white">Hospital</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>🚦 GREEN</span>
                    <span>🚦 GREEN</span>
                    <span>🚦 GREEN</span>
                    <span>🚦 GREEN</span>
                    <span>🚦 GREEN</span>
                    <span>🚦 GREEN</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Before AI</span>
                    <span className="text-sm font-bold text-rose-400">18:42</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">After AI</span>
                    <span className="text-sm font-bold text-emerald-400">11:26</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Signals Affected</span>
                    <span className="text-sm font-bold text-cyan-400">6 Connected</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Traffic Diverted</span>
                    <span className="text-sm font-bold text-amber-300">14% Inflow</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center gap-2">
                <Siren className="w-8 h-8 text-slate-500" />
                <div className="text-sm font-bold text-white">No Emergency Corridor Currently Active</div>
                <p className="text-xs text-slate-400 max-w-md">
                  Emergency green wave corridor preempts 6 connected signals and diverts 14% non-emergency flow to save 7:16 minutes.
                </p>
                <button
                  onClick={() => {
                    onTriggerEmergency && onTriggerEmergency();
                    setActiveModal(null);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dispatch Ambulance Green Corridor (Scenario C)</span>
                </button>
              </div>
            )}

            <div className="text-xs text-slate-400">
              Corridor algorithms preserve previous signal cycles and automatically restore standard adaptive timing when the vehicle reaches destination.
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: 🚚 Logistics Freight Fleet Hub ─── */}
      {activeModal === 'logistics' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl p-5 rounded-2xl border border-emerald-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚚</span>
                <div>
                  <h3 className="text-base font-bold text-white">Commercial Logistics & Freight Shifting</h3>
                  <p className="text-xs text-slate-400">1,842 Active Trips · Off-Peak Incentivized Load Balancing</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SIH Flagship: Logistics-to-Traffic AI Correlation Bridge */}
            <LogisticsAITrafficBridge />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Shifted Off-Peak</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{shiftedTripsCount} Trips</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Carbon Saved</div>
                <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                  {aggregateLogistics?.totalCarbonSavedKg || 42.8} kg
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Incentives Given</div>
                <div className="text-lg font-mono font-bold text-indigo-300 mt-0.5">₹ 2,450</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-300">Active Freight Corridors:</div>
              {logisticsTrips.slice(0, 3).map(trip => (
                <div key={trip._id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{trip.fleetCompany} ({trip.truckId})</div>
                    <div className="text-[10px] text-slate-400">{trip.route} · {trip.tonnage} tons</div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    trip.isShifted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    {trip.isShifted ? 'OFF-PEAK SHIFTED' : 'PEAK SCHEDULE'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300">Switch 10 more commercial carriers to 11:30 AM slot.</span>
              <button
                onClick={() => {
                  onSelectScenario && onSelectScenario('D');
                  setActiveModal(null);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
              >
                Open Freight Optimization (Scenario D)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 4: 🏗️ Infrastructure Stress & Critical Arterials Inspector ─── */}
      {activeModal === 'roads' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-4xl p-5 rounded-2xl border border-cyan-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Municipal Infrastructure Stress & Arterial Bottlenecks
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                      Transport · Logistics · Infrastructure
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Road Capacity, Bridge Load, Parking, EV Charging, Public Transport, and Freight Hubs</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 🏗️ Core Municipal Infrastructure Stress Engine */}
            <InfrastructureStressHub />

            {/* 🚗 Monitored Metropolitan Roadway Network */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
                  <span>🚗</span>
                  68 Critical Arterial Links · Real-Time BPR Congestion Ratio
                </span>
                <span className="text-[11px] text-slate-500">Live Micro-Sensors</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {arterialRoads.map((road, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{road.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Volume: <span className="text-amber-400">{road.vph} vph</span> · Cap: {road.cap} vph ({(road.vph / road.cap * 100).toFixed(0)}%)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        road.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse' :
                        road.status === 'HEAVY' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        LOS {road.los}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300">
              <span>Automated multimodal diversion redistributes arterial and freight pressure dynamically.</span>
              <button
                onClick={() => {
                  onSelectScenario && onSelectScenario('B');
                  setActiveModal(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
              >
                Compare AI Routes (Scenario B)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 Explainable AI Decision Modal */}
      <ExplainableAIDecisionModal
        isOpen={isXAIModalOpen}
        onClose={() => setIsXAIModalOpen(false)}
        signalId="sig-barakhamba"
        signalName="Signal #12: Barakhamba Junction"
      />
    </>
  );
}
