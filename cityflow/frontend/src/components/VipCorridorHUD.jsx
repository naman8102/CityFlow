import React from 'react';
import { 
  Crown, CheckCircle2, Shield, Radio, ArrowRight, Zap, X, AlertTriangle, Activity, Navigation, Compass 
} from 'lucide-react';

export default function VipCorridorHUD({
  vipData,
  onClearVip,
  signals = []
}) {
  if (!vipData) return null;

  const telemetry = vipData.telemetry || {};
  const corridorSignals = [
    { id: 'sig-ashoka-rd', name: 'Ashoka Road Security Gate', code: 'V1' },
    { id: 'sig-kg-marg', name: 'Kasturba Gandhi Arterial', code: 'V2' },
    { id: 'sig-barakhamba', name: 'Barakhamba Central Crossing', code: 'V3' },
    { id: 'sig-tolstoy', name: 'Tolstoy Marg Security Post', code: 'V4' },
    { id: 'sig-janpath', name: 'Janpath Convoy Feeder', code: 'V5' }
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-purple-500/50 bg-[#0d0a1c] shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-fadeIn">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 blur-sm" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl border bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-pulse">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                High-Security Protocol
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow-sm ${
                vipData.status === 'ARRIVED'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-purple-950/90 text-purple-300 border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
              }`}>
                {vipData.status === 'ARRIVED' ? '🏁 DESTINATION REACHED · AUTO-RELEASING' : 'Z+ STATE MOTORCADE ACTIVE'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border bg-amber-950/80 text-amber-300 border-amber-500/40">
                ROYAL CORRIDOR
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
              VIP High-Security Priority Corridor (Motorcade Cleared)
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={onClearVip}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
              vipData.status === 'ARRIVED'
                ? 'border-emerald-500/60 bg-emerald-950/80 text-emerald-200 animate-pulse'
                : 'border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${vipData.status === 'ARRIVED' ? 'text-emerald-400' : 'text-purple-400'}`} />
            <span>{vipData.status === 'ARRIVED' ? 'Arrived · Auto-Releasing' : 'Disengage VIP Escort'}</span>
          </button>
          <button
            onClick={onClearVip}
            title="Close VIP Corridor HUD"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safe Arrival Alert Banner */}
      {vipData.status === 'ARRIVED' && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-between animate-bounce shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-emerald-300">
                🏁 VIP MOTORCADE SAFELY ARRIVED AT DESTINATION
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                State security escort mission complete. Automatically turning off VIP SOS and releasing traffic signals...
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-400/40 animate-pulse font-bold">
            AUTO-OFF...
          </span>
        </div>
      )}

      {/* Real-Time VIP Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#080714] border border-purple-500/20">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>Convoy Speed</span>
            <span className="text-purple-400">⚡</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-300 font-mono">
            {telemetry.speedKmph || 54} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Green Wave Clearance Pace</div>
        </div>

        <div className="p-3 rounded-xl bg-[#080714] border border-purple-500/20">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>Security Index</span>
            <span className="text-cyan-400 font-bold">{telemetry.safetyIndex || 96}/100</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
            0 Hazards
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Deflected from All Incidents</div>
        </div>

        <div className="p-3 rounded-xl bg-[#080714] border border-purple-500/20">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>Risk Assessment</span>
            <span className="text-emerald-400 font-bold">LOW RISK</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
            Score {telemetry.riskScore || 14}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Multi-Lane Divided Boulevards</div>
        </div>

        <div className="p-3 rounded-xl bg-[#080714] border border-purple-500/20">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>Traffic Diverted</span>
            <span className="text-amber-400 font-bold">18%</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
            5 Signals
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Locked GREEN for Motorcade</div>
        </div>
      </div>

      {/* Preempted Intersections Progress Pipeline */}
      <div className="p-3 rounded-xl bg-[#080714] border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5 font-bold">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            SYNCHRONIZED SECURITY WAVE · 5 Intersections Locked GREEN
          </span>
          <span className="text-emerald-400 font-bold">100% PREEMPTED</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {corridorSignals.map((sig, idx) => (
            <div 
              key={sig.id}
              className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 flex flex-col justify-between text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-black text-purple-300">{sig.code}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  GREEN
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-200 truncate">{sig.name}</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Held Phase · 240s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
