import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  TrendingDown, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Leaf, 
  Fuel, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

export default function LogisticsAITrafficBridge({ onShiftApplied, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedResult, setAppliedResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadAnalysis = async () => {
      try {
        const correlation = await cityFlowAPI.getLogisticsTrafficCorrelation();
        if (isMounted && correlation) {
          setData(correlation);
          if (correlation.isPlanApplied) {
            setAppliedResult({
              tripsShifted: correlation.recommendedShiftsCount || 86,
              shiftedWindow: `${correlation.causalChain?.step4_recommendation?.slotFrom || '10:00 AM'} → ${correlation.causalChain?.step4_recommendation?.slotTo || '11:30 PM'}`
            });
          }
        }
      } catch (err) {
        console.error('Failed to load logistics traffic correlation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAnalysis();
    return () => { isMounted = false; };
  }, []);

  const handleApplyShift = async () => {
    setIsApplying(true);
    try {
      const result = await cityFlowAPI.applyLogisticsAITimeShift();
      setAppliedResult(result);
      if (onShiftApplied) onShiftApplied(result);
    } catch (err) {
      console.error('Failed to apply time-shift plan:', err);
    } finally {
      setIsApplying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="glass-panel p-4 rounded-xl border border-slate-800 animate-pulse text-slate-400 text-xs flex items-center gap-2">
        <Truck className="w-4 h-4 text-amber-400 animate-bounce" />
        <span>Correlating macro city traffic with commercial freight routes...</span>
      </div>
    );
  }

  const tripsAnalyzed = data?.totalTripsAnalyzed || 1240;
  const peakFreight = data?.peakHourFreightCount || 312;
  const recommendedShifts = data?.recommendedShiftsCount || 86;
  const impact = data?.expectedImpact || {
    trafficReductionPercent: 9.4,
    fuelReductionPercent: 6.8,
    co2ReductionPercent: 8.2
  };

  return (
    <div className="glass-panel rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0c1222] via-[#090e1a] to-[#071714] p-4 md:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient backdrop glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                Logistics AI Engine
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                SIH Problem Solver
              </span>
            </div>
            <h3 className="text-sm md:text-base font-black text-white mt-0.5">
              City Traffic ↔ Heavy Freight Time-Shifting Bridge
            </h3>
            <p className="text-[11px] text-slate-400">
              Mitigates urban transport + logistics + infrastructure pressure by shifting heavy freight out of peak morning bottlenecks.
            </p>
          </div>
        </div>

        {/* Shift Window Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono shrink-0">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-400 font-bold">10:00 AM</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">11:30 PM</span>
        </div>
      </div>

      {/* 4-Step Causal Chain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
        {/* Step 1: City Traffic */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>1. City Traffic</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-xs font-bold text-white">Peak Gridlock Detected</div>
          <div className="text-[11px] text-slate-400">
            Arterial links operating at LOS E/F with high volume-to-capacity ratios.
          </div>
        </div>

        {/* Step 2: AI Detects Peak Congestion */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase text-amber-400 flex items-center justify-between">
            <span>2. AI Spatial Detection</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-white">Critical Corridor Overload</div>
          <div className="text-[11px] text-slate-400">
            Convergence at Ring Road, Ashram, NH-24, and Azadpur freight corridors.
          </div>
        </div>

        {/* Step 3: Heavy Freight Routes Identified */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase text-cyan-400 flex items-center justify-between">
            <span>3. Freight Identified</span>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-white">312 Peak-Hour Trips</div>
          <div className="text-[11px] text-slate-400">
            Non-perishable freight &gt; 5T identified from 1,240 active trips.
          </div>
        </div>

        {/* Step 4: AI Recommends Time Shifting */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center justify-between">
            <span>4. Time Shift Plan</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-emerald-300">Shift 86 Heavy Trips</div>
          <div className="text-[11px] text-emerald-200/80">
            Move to 11:30 PM off-peak night green corridor with fuel credits.
          </div>
        </div>
      </div>

      {/* Key Numbers & Impact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Trips Analyzed</span>
          <span className="text-lg font-black font-mono text-white">{tripsAnalyzed.toLocaleString()}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-[10px] text-rose-400 uppercase font-mono block">Peak-Hour Freight</span>
          <span className="text-lg font-black font-mono text-rose-400">{peakFreight}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
          <span className="text-[10px] text-amber-300 uppercase font-mono block">AI Recommend Shift</span>
          <span className="text-lg font-black font-mono text-amber-300">{recommendedShifts} trips</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
          <span className="text-[10px] text-emerald-300 uppercase font-mono block flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" /> Traffic Impact
          </span>
          <span className="text-lg font-black font-mono text-emerald-400">↓ {impact.trafficReductionPercent}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center">
          <span className="text-[10px] text-cyan-300 uppercase font-mono block flex items-center justify-center gap-1">
            <Fuel className="w-3 h-3" /> Fuel Burn
          </span>
          <span className="text-lg font-black font-mono text-cyan-400">↓ {impact.fuelReductionPercent}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/40 text-center">
          <span className="text-[10px] text-teal-300 uppercase font-mono block flex items-center justify-center gap-1">
            <Leaf className="w-3 h-3" /> CO₂ Mitigation
          </span>
          <span className="text-lg font-black font-mono text-teal-300">↓ {impact.co2ReductionPercent}%</span>
        </div>
      </div>

      {/* Actuation Action Bar / Success Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          {appliedResult ? (
            <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>✓ Plan Actuated: 86 Trips Shifted to 11:30 PM Night Corridor · Arterial Traffic Relieved (-9.4%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Click to execute scheduled fleet time-shifting and notify commercial logistics operators.</span>
            </div>
          )}
        </div>

        <button
          onClick={handleApplyShift}
          disabled={isApplying || Boolean(appliedResult)}
          className={`py-2 px-4 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 shadow-lg ${
            appliedResult
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-emerald-500/10 cursor-default'
              : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-black shadow-amber-500/20 active:scale-95'
          }`}
        >
          {isApplying ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              <span>Actuating Fleet Shift...</span>
            </>
          ) : appliedResult ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>86 Trips Shifted Off-Peak</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Apply AI Fleet Shift Plan (86 Trips)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
