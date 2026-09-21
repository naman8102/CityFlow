import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Radio, 
  Route, 
  Siren, 
  Truck, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function AIRecommendationDeck({
  hotspotData,
  interventionData,
  isApplyingIntervention,
  onApplyIntervention,
  onOpenExplainModal,
  liveActions = []
}) {
  const [isActuating, setIsActuating] = useState(false);
  const [localApplied, setLocalApplied] = useState(false);

  // Default dynamic recommendations if no explicit scenario triggered
  const recommendationTitle = hotspotData?.message || interventionData?.plan?.reason || 'Critical Congestion Detected at Sector-18 / Barakhamba Corridor';
  const rootCause = hotspotData ? 'High inflow surge + downstream bottleneck' : 'Peak commuter convergence + arterial saturation';
  const actionsList = interventionData?.plan?.recommendedActions || [
    'Extend green time +18 sec (North approach)',
    'Divert 12% traffic via Janpath bypass',
    'Restrict heavy vehicles for 20 min',
    'Coordinate next 4 connected signals'
  ];
  const expectedImpact = interventionData?.plan?.expectedImpact || {
    queueReductionPercent: '31%',
    travelTimeReductionPercent: '18%',
    co2ReductionPercent: '12%'
  };

  const handleApply = async () => {
    setIsActuating(true);
    try {
      if (onApplyIntervention) {
        await onApplyIntervention();
      }
      setLocalApplied(true);
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    } finally {
      setIsActuating(false);
    }
  };

  // Sample live actions list if empty
  const actionsFeed = liveActions.length > 0 ? liveActions : [
    { id: 1, text: 'Signal +18 sec (Barakhamba North Green 42s)', time: 'Just now', type: 'signal', icon: Radio },
    { id: 2, text: 'Route changed (12% traffic diverted to Janpath)', time: '1m ago', type: 'route', icon: Route },
    { id: 3, text: 'Emergency Corridor active (Ambulance CATS-12)', time: '2m ago', type: 'emergency', icon: Siren },
    { id: 4, text: 'Freight shifted (86 trips → 11:30 PM night corridor)', time: '4m ago', type: 'logistics', icon: Truck },
    { id: 5, text: 'Preventive shield executed (NH-24 risk 87% → 32%)', time: '6m ago', type: 'safety', icon: ShieldCheck }
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 bg-[#080c1b]/95 border-t border-slate-800/90 text-slate-200 backdrop-blur-md">
      
      {/* ─── Left Box: AI RECOMMENDATION ─── */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                AI RECOMMENDATION
              </span>
            </div>
            <button
              onClick={onOpenExplainModal}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline transition cursor-pointer"
            >
              Why AI did this?
            </button>
          </div>

          {/* Condition & Cause */}
          <div className="mt-2.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{recommendationTitle}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <strong className="text-slate-300">Cause:</strong> {rootCause}
            </p>
          </div>

          {/* Prescribed Actions List */}
          <div className="mt-2 flex flex-col gap-1">
            {actionsList.slice(0, 3).map((act, i) => (
              <div key={i} className="text-[11px] font-mono text-cyan-300/90 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{act}</span>
              </div>
            ))}
          </div>

          {/* Expected Impact Badges */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-400 font-bold uppercase">Expected Impact:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              Queue ↓ {expectedImpact.queueReductionPercent}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Delay ↓ {expectedImpact.travelTimeReductionPercent}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
              CO₂ ↓ {expectedImpact.co2ReductionPercent}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleApply}
          disabled={isActuating || isApplyingIntervention || localApplied}
          className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98 ${
            localApplied
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 cursor-default'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)]'
          }`}
        >
          {isActuating || isApplyingIntervention ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Applying Closed-Loop Action...</span>
            </>
          ) : localApplied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>✓ AI Interventions Actuated Successfully</span>
            </>
          ) : (
            <>
              <span>Apply action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* ─── Right Box: LIVE ACTIONS ─── */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                LIVE ACTIONS
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              STREAMING
            </span>
          </div>

          {/* Feed of Live Autonomous Executions */}
          <div className="mt-2 flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {actionsFeed.map((action) => {
              const Icon = action.icon || Activity;
              return (
                <div 
                  key={action.id}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-white font-bold truncate">{action.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {action.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Actions Status Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Active closed-loop actuators: <strong className="text-emerald-400">126 Signals · 4 Corridors</strong></span>
          <span className="text-cyan-400 font-bold">100% In-Sync</span>
        </div>
      </div>

    </div>
  );
}
