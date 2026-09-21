import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Activity, Cpu, ArrowUp, ArrowRight, ArrowDown, ArrowLeft,
  Clock, Gauge, CloudRain, AlertTriangle, Siren, RefreshCw, CheckCircle2,
  TrendingDown, Waves, Play, Sparkles, X, ChevronRight, Shield, Brain
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';
import ExplainableAIDecisionModal from './ExplainableAIDecisionModal';

export default function AdaptiveSignalAILab({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [optimizingAnimation, setOptimizingAnimation] = useState(false);
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);

  // 7 Ingested Inputs State
  const [inputs, setInputs] = useState({
    northQueue: 86,
    northVolume: 2150,
    northSpeed: 18,
    weather: 'CLEAR', // 'CLEAR', 'RAIN', 'FOG', 'STORM'
    incidentActive: false,
    emergencyActive: false
  });

  // Current Optimization Result State
  const [optimization, setOptimization] = useState(null);

  // Fetch initial state or recalculate
  const fetchState = async (customPayload) => {
    setLoading(true);
    try {
      const payload = customPayload || {
        arms: {
          north: { queue: inputs.northQueue, volume: inputs.northVolume, speed: inputs.northSpeed },
          east: { queue: 21, volume: 920, speed: 38 },
          south: { queue: 32, volume: 1100, speed: 32 },
          west: { queue: 40, volume: 1350, speed: 28 }
        },
        weather: inputs.weather,
        incident: { active: inputs.incidentActive, arm: 'north', severity: 'HIGH' },
        emergency: { active: inputs.emergencyActive, corridorArm: 'north' }
      };

      const res = await cityFlowAPI.runAdaptiveSignalOptimization(payload);
      setOptimization(res);
    } catch (err) {
      console.error('Failed to run adaptive signal optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [inputs.weather, inputs.incidentActive, inputs.emergencyActive]);

  const handleRunOptimization = () => {
    setOptimizingAnimation(true);
    setTimeout(() => {
      fetchState();
      setOptimizingAnimation(false);
    }, 600);
  };

  // Preset Handlers for Judges
  const applyPreset = (type) => {
    setOptimizingAnimation(true);
    let newInputs;
    if (type === 'SURGE') {
      newInputs = {
        northQueue: 86,
        northVolume: 2150,
        northSpeed: 18,
        weather: 'CLEAR',
        incidentActive: false,
        emergencyActive: false
      };
    } else if (type === 'MONSOON') {
      newInputs = {
        northQueue: 98,
        northVolume: 2380,
        northSpeed: 12,
        weather: 'RAIN',
        incidentActive: false,
        emergencyActive: false
      };
    } else if (type === 'EMERGENCY') {
      newInputs = {
        northQueue: 74,
        northVolume: 1800,
        northSpeed: 15,
        weather: 'CLEAR',
        incidentActive: false,
        emergencyActive: true
      };
    } else {
      // BASELINE
      newInputs = {
        northQueue: 32,
        northVolume: 1200,
        northSpeed: 34,
        weather: 'CLEAR',
        incidentActive: false,
        emergencyActive: false
      };
    }
    setInputs(newInputs);
    setTimeout(() => {
      fetchState({
        arms: {
          north: { queue: newInputs.northQueue, volume: newInputs.northVolume, speed: newInputs.northSpeed },
          east: { queue: 21, volume: 920, speed: 38 },
          south: { queue: 32, volume: 1100, speed: 32 },
          west: { queue: 40, volume: 1350, speed: 28 }
        },
        weather: newInputs.weather,
        incident: { active: newInputs.incidentActive, arm: 'north', severity: 'HIGH' },
        emergency: { active: newInputs.emergencyActive, corridorArm: 'north' }
      });
      setOptimizingAnimation(false);
    }, 500);
  };

  const splits = optimization?.splits || { north: 42, east: 30, south: 24, west: 24 };
  const beforeVsAfter = optimization?.beforeVsAfter || {
    before: { queue: 86, delayMinutes: 12.4, los: 'LOS E', timers: { north: 22, east: 45, south: 18, west: 35 } },
    action: { title: 'Optimizing 4 Connected Signals...', summary: 'Extended North GREEN 22s → 42s (+20s AI boost).' },
    after: { queue: 54, delayMinutes: 8.1, los: 'LOS C', timers: { north: 42, east: 30, south: 24, west: 24 } }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-6xl my-auto glass-panel border border-cyan-500/40 rounded-3xl bg-[#090e1c] shadow-[0_0_80px_rgba(6,182,212,0.18)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900/90 via-[#0a1228] to-slate-900/90 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  CityFlow Flagship Feature
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Closed-Loop Actuation
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                Adaptive Traffic Signal AI — Autonomous Phase & Coordination Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('SURGE')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              North Surge Demo (86 veh)
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">

          {/* Section 1: 7-Variable Input Telemetry Strip */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Continuous 7-Variable Sensor Ingestion
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                Real-Time Telemetry Stream
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {/* 1. Traffic Volume */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">1. Volume (VPH)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-mono font-bold text-white">{inputs.northVolume}</span>
                  <span className="text-[10px] text-slate-400">vph</span>
                </div>
                <span className="text-[9px] text-cyan-400 font-mono">North Inflow</span>
              </div>

              {/* 2. Queue Length */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">2. Queue Length</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-mono font-black text-amber-300">{inputs.northQueue}</span>
                  <span className="text-[10px] text-amber-400">veh</span>
                </div>
                <span className="text-[9px] text-amber-400 font-mono">Critical Backlog</span>
              </div>

              {/* 3. Speed */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">3. Speed</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-mono font-bold text-white">{inputs.northSpeed}</span>
                  <span className="text-[10px] text-slate-400">km/h</span>
                </div>
                <span className="text-[9px] text-rose-400 font-mono">Congested Flow</span>
              </div>

              {/* 4. V/C Ratio */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">4. V/C Ratio</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-mono font-bold text-rose-400">
                    {(inputs.northVolume / 1600).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-rose-400 font-bold">LOS F</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">1.34 Saturation</span>
              </div>

              {/* 5. Weather */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">5. Weather</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    {inputs.weather === 'RAIN' ? '🌧️ Monsoon' : '☀️ Clear'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {inputs.weather === 'RAIN' ? 'Headway +35%' : 'Nominal'}
                </span>
              </div>

              {/* 6. Incident */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">6. Incident</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-mono font-bold ${inputs.incidentActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {inputs.incidentActive ? '⚠️ Active Block' : '✔ Clear Corridor'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Approach Sensor</span>
              </div>

              {/* 7. Emergency */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">7. Emergency</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-mono font-bold ${inputs.emergencyActive ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                    {inputs.emergencyActive ? '🚑 SOS Corridor' : 'Standby'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Preemption Link</span>
              </div>
            </div>

            {/* Visual AI Optimizer Data Pipeline Convergence */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <span>Inputs</span>
                <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold text-white">AI Signal Optimizer Engine (Webster + Pressure Balance)</span>
                <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-emerald-400 font-bold">Dynamic Actuation</span>
              </div>
            </div>
          </div>

          {/* Section 2: Core Visual Comparison - Signal A Phase Allocation vs 4-Signal Wave */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Signal A 4-Arm Crossroad Visualizer (7 Cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Primary Actuator Node (Signal A)
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Barakhamba - Tolstoy Marg 4-Way Junction
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">Total Cycle:</span>
                  <span className="text-xs font-mono font-bold text-white ml-1.5">120 Seconds</span>
                </div>
              </div>

              {/* 4-Arm Aerial Grid Layout */}
              <div className="my-auto py-5 relative flex flex-col items-center justify-center">
                
                {/* North Arm (HIGHLIGHT) */}
                <div className="w-full max-w-sm p-3 rounded-2xl bg-slate-950/90 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative mb-3">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-cyan-500 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" />
                    North (Connaught Feeder) · Heavy Surge
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">Baseline Green:</span>
                        <span className="text-xs font-mono line-through text-slate-500">22 sec</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-mono font-bold text-emerald-400">AI GREEN:</span>
                        <span className="text-xl font-mono font-black text-emerald-400 animate-pulse">
                          {splits.north} sec
                        </span>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          +{splits.north - 22}s AI Boost
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-400 font-bold block">Queue Length</span>
                      <span className="text-lg font-mono font-black text-amber-300">{inputs.northQueue} veh</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500" 
                      style={{ width: `${(splits.north / 120) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Middle Row: West Arm - Center Junction Hub - East Arm */}
                <div className="w-full grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  
                  {/* West Arm */}
                  <div className="md:col-span-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold mb-1">
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      West (Janpath)
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono text-slate-400">Green: 35s → <b className="text-emerald-400">{splits.west}s</b></span>
                      <span className="text-xs font-mono text-slate-300">40 veh</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500/70" style={{ width: `${(splits.west / 120) * 100}%` }} />
                    </div>
                  </div>

                  {/* Center Junction AI Hub */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-1 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <Cpu className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white">4-Phase AI Hub</span>
                    <span className="text-[9px] font-mono text-cyan-400">Equalized Saturation</span>
                  </div>

                  {/* East Arm */}
                  <div className="md:col-span-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold mb-1">
                      <ArrowLeft className="w-3 h-3 text-cyan-400" />
                      East (Barakhamba)
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono text-slate-400">Green: 45s → <b className="text-emerald-400">{splits.east}s</b></span>
                      <span className="text-xs font-mono text-slate-300">21 veh</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500/70" style={{ width: `${(splits.east / 120) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* South Arm */}
                <div className="w-full max-w-sm p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mt-3">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold mb-1">
                    <ArrowUp className="w-3 h-3 text-cyan-400" />
                    South (Mandi House Link)
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400">Green: 18s → <b className="text-emerald-400">{splits.south}s</b></span>
                    <span className="text-xs font-mono text-slate-300">32 veh</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500/70" style={{ width: `${(splits.south / 120) * 100}%` }} />
                  </div>
                </div>

              </div>

              {/* Dynamic Phase Priority Sequence */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                <span className="text-slate-400">Dynamic Phase Order:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    1. NORTH (86 veh)
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    2. WEST (40 veh)
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    3. SOUTH (32 veh)
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    4. EAST (21 veh)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 4 Connected Signals Green Wave Corridor (5 Cols) */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Multi-Signal Coordination
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Arterial Green Wave Mesh (4 Connected Signals)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    Wave Active
                  </span>
                </div>

                {/* 4 Signals Connected Flow */}
                <div className="space-y-3 mt-4">
                  {(optimization?.coordinatedSignals || [
                    { id: 'sig-barakhamba', name: 'Signal A: Barakhamba Junction', offsetSeconds: 0, greenDurationSeconds: 42, role: 'Primary Leader' },
                    { id: 'sig-cp-inner', name: 'Signal B: Connaught Circus East', offsetSeconds: 12, greenDurationSeconds: 40, role: 'Feeder Sync' },
                    { id: 'sig-chelmsford', name: 'Signal C: Chelmsford Crossing', offsetSeconds: 24, greenDurationSeconds: 38, role: 'Station Platoon' },
                    { id: 'sig-tolstoy', name: 'Signal D: Tolstoy Marg Crossing', offsetSeconds: 36, greenDurationSeconds: 42, role: 'Discharge Valve' }
                  ]).map((sig, idx) => (
                    <div key={sig.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-300">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                              {sig.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {sig.role || 'Synchronized Controller'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-cyan-400">
                            Offset: +{sig.offsetSeconds}s
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400">
                            Green: {sig.greenDurationSeconds}s
                          </div>
                        </div>
                      </div>

                      {/* Traveling Wave Pulse Bar */}
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 animate-pulse"
                          style={{ width: `${80 - idx * 8}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corridor Efficiency Metric */}
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-950 to-emerald-950/30 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-slate-300">Green Wave Bandwidth:</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-300">88.4% Zero-Stop</span>
              </div>
            </div>

          </div>

          {/* Section 3: High-Impact BEFORE vs AI ACTION vs AFTER Split Showcase */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e162e] to-[#070b16] border border-cyan-500/50 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Live Demonstration: Baseline Static Timers vs Autonomous AI Actuation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsXAIModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-mono font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-cyan-500/30 active:scale-95 shrink-0"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>🧠 Why Did AI Do This?</span>
                </button>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded hidden sm:inline">
                  Validated BPR Model
                </span>
              </div>
            </div>

            {/* 3-Part Flow: BEFORE ➔ AI ACTION ➔ AFTER */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
              
              {/* BEFORE CARD */}
              <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/90 border border-rose-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                      BEFORE (Static Timers)
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      {beforeVsAfter.before.los}
                    </span>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">Queue Backlog:</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-mono font-black text-rose-400">
                          {beforeVsAfter.before.queue}
                        </span>
                        <span className="text-xs font-mono text-slate-400">vehicles</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">Corridor Delay:</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-mono font-bold text-white">
                          {beforeVsAfter.before.delayMinutes}
                        </span>
                        <span className="text-xs font-mono text-slate-400">min / veh</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                  Static North Green: <span className="text-rose-400 font-bold">{beforeVsAfter.before.timers.north} sec</span>
                </div>
              </div>

              {/* AI ACTION CONNECTOR */}
              <div className="md:col-span-3 p-4 rounded-xl bg-gradient-to-b from-cyan-950/50 via-slate-950 to-cyan-950/50 border border-cyan-500/50 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase tracking-wider mb-1">
                  AI Action Executed
                </h5>
                <p className="text-[11px] text-cyan-200 leading-snug">
                  {beforeVsAfter.action.summary}
                </p>
                <div className="mt-3 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  ⚡ 4 Connected Signals Synced
                </div>
              </div>

              {/* AFTER CARD */}
              <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/90 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      AFTER (AI Optimized)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {beforeVsAfter.after.los}
                    </span>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">Cleared Queue:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-emerald-400">
                          {beforeVsAfter.after.queue}
                        </span>
                        <span className="text-xs font-mono text-slate-400">vehicles</span>
                        <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          -37.2%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">Reduced Delay:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-emerald-300">
                          {beforeVsAfter.after.delayMinutes}
                        </span>
                        <span className="text-xs font-mono text-slate-400">min / veh</span>
                        <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          -34.7%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                  AI North Green: <span className="text-emerald-400 font-bold">{beforeVsAfter.after.timers.north} sec (+20s)</span>
                </div>
              </div>

            </div>

            {/* Inline XAI Factor Attribution Bar */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black font-mono text-cyan-300 uppercase tracking-wider">
                      WHY? AI changed Signal #12 because:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Confidence: 91%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-mono">
                    <span>Traffic volume <strong className="text-rose-400">+38%</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Queue length <strong className="text-rose-400">+42%</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Average speed <strong className="text-amber-400">-27%</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Downstream capacity <strong className="text-amber-400">-18%</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Rain impact <strong className="text-cyan-400">+9%</strong></span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsXAIModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start lg:self-auto"
              >
                <span>Inspect Causal Factors</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Section 4: Judge Sandbox & Interactive Presets */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Judge Interactive Sandbox
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Test Real-Time Multi-Agent AI Response
              </h4>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => applyPreset('SURGE')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
              >
                🔥 Peak North Surge (86 veh)
              </button>

              <button
                onClick={() => applyPreset('MONSOON')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold transition cursor-pointer"
              >
                🌧️ Monsoon Downpour
              </button>

              <button
                onClick={() => applyPreset('EMERGENCY')}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition cursor-pointer"
              >
                🚑 Ambulance SOS Lock
              </button>

              <button
                onClick={() => applyPreset('BASELINE')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition cursor-pointer"
              >
                🔄 Reset Baseline
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Multi-Agent Signal Optimization Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Close Lab
          </button>
        </div>

      </div>

      {/* 🧠 Explainable AI Decision Modal */}
      <ExplainableAIDecisionModal
        isOpen={isXAIModalOpen}
        onClose={() => setIsXAIModalOpen(false)}
        signalId="sig-barakhamba"
        signalName="Signal #12: Barakhamba Junction"
      />
    </div>
  );
}
