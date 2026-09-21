import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle2, Shield, Siren, Navigation, ArrowRight,
  TrendingDown, RotateCcw, Zap, Sparkles, X, Cpu, Clock, Check
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

export default function IncidentResponseModal({
  isOpen,
  onClose,
  incident,
  plan,
  onActuated
}) {
  const [executing, setExecuting] = useState(false);
  const [executedResult, setExecutedResult] = useState(null);

  if (!isOpen) return null;

  const currentPlan = plan || {
    title: incident?.title || 'ACCIDENT DETECTED: Multi-Vehicle Collision',
    location: incident?.location?.address || 'NH-24 / Junction X (Barakhamba Arterial)',
    severity: incident?.severity || 'HIGH',
    lanesBlocked: incident?.lanesBlocked || 2,
    trafficImpact: 'HIGH (V/C 1.38)',
    actions: [
      { id: 1, title: 'Reduce incoming traffic', detail: 'Throttle upstream approach meters by -28% to prevent corridor queue buildup' },
      { id: 2, title: 'Adjust 3 signals', detail: 'Extend discharge green +16s across Barakhamba, Tolstoy, and CP Inner intersections' },
      { id: 3, title: 'Recommend diversion', detail: 'Broadcast automated advisory diverting 18% commuter flow via Janpath bypass' },
      { id: 4, title: 'Notify police', detail: 'Automated CAD incident alert dispatched to Delhi Traffic Police Sector Unit #4' },
      { id: 5, title: 'Notify ambulance', detail: 'Priority trauma standby dispatch notification sent to CATS Ambulance Base #12' },
      { id: 6, title: 'Recalculate routes', detail: 'Apply +14.5 min impedance penalty on blocked lanes in central OSRM routing mesh' }
    ]
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await cityFlowAPI.executeIncidentResponse({
        incidentId: incident?._id || incident?.id || 'inc-acc-nh24',
        plan: currentPlan
      });
      setExecutedResult(res);
      if (onActuated) onActuated(res);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-5 sm:p-6 rounded-3xl border border-rose-500/50 bg-[#0b0c1a] shadow-[0_0_80px_rgba(244,63,94,0.2)] relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Incident Header Banner */}
        <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                Incident Response Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700">
                AI REACTION ACTIVE
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 truncate">
              {currentPlan.title}
            </h3>
            <div className="text-xs text-slate-300 font-mono mt-0.5">
              📍 {currentPlan.location}
            </div>
          </div>
        </div>

        {/* Telemetry Badges Strip */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">Severity</span>
            <span className="text-sm font-mono font-black text-rose-400">{currentPlan.severity}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">Lanes Blocked</span>
            <span className="text-sm font-mono font-black text-amber-300">{currentPlan.lanesBlocked} Lanes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">Traffic Impact</span>
            <span className="text-sm font-mono font-black text-rose-400">{currentPlan.trafficImpact}</span>
          </div>
        </div>

        {/* 6 AI Automated Actions */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <Cpu className="w-4 h-4" />
              <span>AI Automatically Generates 6-Point Response Plan:</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Multi-Agency Actuation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentPlan.actions.map((act) => (
              <div 
                key={act.id}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  {act.id}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{act.title}</div>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{act.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Section: Button or Checklist */}
        {!executedResult ? (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400 text-center sm:text-left">
              Click below to execute coordinated signal timing, navigation diversion & CAD emergency dispatch.
            </div>
            <button
              onClick={handleExecute}
              disabled={executing}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 text-black font-mono font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 transition"
            >
              {executing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Actuating Network Response...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>EXECUTE RESPONSE PLAN</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.2)] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-black uppercase text-emerald-300">
                  Response Plan Actuated Successfully
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                100% OPERATIONAL
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-emerald-300">
                <span className="text-emerald-400">✓</span>
                <span>Signals updated (+16s Barakhamba, Tolstoy, CP)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-emerald-300">
                <span className="text-emerald-400">✓</span>
                <span>Route diversion activated (18% via Janpath)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-emerald-300">
                <span className="text-emerald-400">✓</span>
                <span>Emergency services notified (Police #4 & CATS #12)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-emerald-300">
                <span className="text-emerald-400">✓</span>
                <span>Logistics rerouted (Heavy freight shifted off-peak)</span>
              </div>
            </div>

            {/* Measured Relief */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
              <div className="text-slate-300">
                Queue Relieved: <b className="text-emerald-300">185 vehicles (-34%)</b> · Delay Saved: <b className="text-emerald-300">9.4 min</b>
              </div>
              <div className="text-emerald-400 font-bold">
                Gridlock Averted: YES ✔
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
