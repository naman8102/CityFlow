import React from 'react';
import { Sliders, Cpu, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SignalController({ selectedSignal, onUpdateSignal }) {
  if (!selectedSignal) {
    return (
      <div className="glass-panel p-5 rounded-xl border border-slate-800 text-slate-400 flex flex-col items-center justify-center text-center h-full">
        <Sliders className="w-10 h-10 text-cyan-500/50 mb-2 animate-pulse" />
        <h4 className="text-slate-200 font-semibold text-sm">Select Intersection on Map</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Click any pulsing signal node on the arterial map to inspect real-time phase timing and execute AI overrides.
        </p>
      </div>
    );
  }

  const isPreempted = selectedSignal.preemptedByEmergency;
  const isGreen = selectedSignal.currentState === 'GREEN';
  const isYellow = selectedSignal.currentState === 'YELLOW';
  const isRed = selectedSignal.currentState === 'RED';

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Intersection Signal Unit</span>
          <h3 className="text-base font-bold text-white leading-tight">{selectedSignal.name}</h3>
          <span className="text-xs text-slate-400 font-mono">ID: {selectedSignal.id}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
          isPreempted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' :
          isGreen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
          isYellow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
          'bg-rose-500/20 text-rose-400 border border-rose-500/40'
        }`}>
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#ef4444' }}></span>
          {isPreempted ? 'EMERGENCY PREEMPTION' : selectedSignal.currentState}
        </div>
      </div>

      {/* Visual Signal Head Graphic */}
      <div className="bg-[#070b14] p-3 rounded-lg border border-slate-800/80 flex items-center justify-around">
        <div className="flex items-center gap-3">
          {/* Signal housing */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-2 flex flex-col gap-2 shadow-inner">
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${isRed ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]' : 'bg-rose-950/40 opacity-40'}`}></div>
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${isYellow ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]' : 'bg-amber-950/40 opacity-40'}`}></div>
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${isGreen ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-emerald-950/40 opacity-40'}`}></div>
          </div>
          <div>
            <div className="text-3xl font-mono font-black text-white">{selectedSignal.remainingSeconds || 0}s</div>
            <div className="text-[11px] text-slate-400">Remaining in Phase</div>
          </div>
        </div>

        <div className="border-l border-slate-800 pl-4 flex flex-col gap-1">
          <div className="text-[11px] text-slate-400">Total Cycle: <span className="text-slate-200 font-mono font-semibold">{selectedSignal.cycleSeconds || 80}s</span></div>
          <div className="text-[11px] text-slate-400">North-South Vol: <span className="text-cyan-400 font-mono font-semibold">{selectedSignal.phaseVolume?.northSouth || 1840} vph</span></div>
          <div className="text-[11px] text-slate-400">East-West Vol: <span className="text-indigo-400 font-mono font-semibold">{selectedSignal.phaseVolume?.eastWest || 920} vph</span></div>
        </div>
      </div>

      {/* AI Webster Optimization Status */}
      <div className="bg-slate-900/60 p-3 rounded-lg border border-cyan-500/20 text-xs">
        <div className="flex items-center justify-between text-cyan-400 mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Cpu className="w-3.5 h-3.5" /> AI Split Allocation
          </span>
          <span className="font-mono text-[11px] text-emerald-400">+18.5% throughput</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Dynamic Webster split optimizes arterial clearance while preventing secondary queue buildup.
        </p>
      </div>

      {/* Manual Override Controls */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Manual Officer Override</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onUpdateSignal && onUpdateSignal({ signalId: selectedSignal.id, state: 'RED' })}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition active:scale-95"
          >
            Force RED
          </button>
          <button
            onClick={() => onUpdateSignal && onUpdateSignal({ signalId: selectedSignal.id, state: 'YELLOW' })}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition active:scale-95"
          >
            Hold YELLOW
          </button>
          <button
            onClick={() => onUpdateSignal && onUpdateSignal({ signalId: selectedSignal.id, state: 'GREEN' })}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition active:scale-95"
          >
            Clear GREEN
          </button>
        </div>

        <button
          onClick={() => onUpdateSignal && onUpdateSignal({ 
            signalId: selectedSignal.id, 
            aiAdaptiveEnabled: !selectedSignal.aiAdaptiveEnabled 
          })}
          className={`mt-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition active:scale-95 ${
            selectedSignal.aiAdaptiveEnabled 
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${selectedSignal.aiAdaptiveEnabled ? 'animate-spin' : ''}`} />
          {selectedSignal.aiAdaptiveEnabled ? 'AI Adaptive Autonomous Control: ACTIVE' : 'Enable AI Adaptive Control'}
        </button>
      </div>
    </div>
  );
}
