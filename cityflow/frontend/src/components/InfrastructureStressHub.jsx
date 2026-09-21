import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Car, 
  Truck, 
  Zap, 
  Bus, 
  ParkingCircle, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingDown, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  RotateCcw 
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

const ZONES = [
  { id: 'sector-62', name: 'Sector-62 (Noida Hub)' },
  { id: 'connaught-place', name: 'Connaught Place' },
  { id: 'ashram-flyover', name: 'Ashram Flyover' },
  { id: 'azadpur-mandi', name: 'Azadpur Mandi' },
  { id: 'okhla-phase3', name: 'Okhla Phase-III' }
];

export default function InfrastructureStressHub({ onReliefActuated }) {
  const [activeZone, setActiveZone] = useState('sector-62');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [reliefResult, setReliefResult] = useState(null);

  const fetchStressData = async (zoneId) => {
    setLoading(true);
    try {
      const res = await cityFlowAPI.getInfrastructureStress(zoneId);
      setData(res);
      if (res?.isRelieved) {
        setReliefResult({
          stressBeforePercent: 86,
          stressAfterPercent: 64,
          actuatedChecklist: {
            freightShiftedToNight: true,
            signalThroughputIncreased: true,
            alternateRouteActivated: true,
            secondaryFreightGateOpened: true
          }
        });
      } else {
        setReliefResult(null);
      }
    } catch (err) {
      console.error('Failed to load infrastructure stress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStressData(activeZone);
  }, [activeZone]);

  const handleApplyRelief = async () => {
    setIsApplying(true);
    try {
      const res = await cityFlowAPI.applyInfrastructureRelief(activeZone);
      setReliefResult(res);
      await fetchStressData(activeZone);
      if (onReliefActuated) onReliefActuated(res);
    } catch (err) {
      console.error('Failed to apply infrastructure relief:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Render a 10-block ASCII / Unicode progress bar
  const renderStressBlocks = (percent) => {
    const filledCount = Math.round(percent / 10);
    const filled = '█'.repeat(filledCount);
    const empty = '░'.repeat(10 - filledCount);
    return `${filled}${empty}`;
  };

  const overallStress = data?.overallStress || 86;
  const isCritical = overallStress >= 80;

  return (
    <div className="glass-panel rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#0e1424] via-[#090d1c] to-[#050812] p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                SIH Problem Pillar 3
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                Transport + Logistics + Infrastructure Pressure
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              Urban Infrastructure Stress Identification & Autonomous Relief
            </h3>
            <p className="text-xs text-slate-400">
              Correlating Road Capacity, Bridge Load, Parking, EV Charging, Public Transit, and Freight Hubs.
            </p>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeZone === zone.id
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Overall Stress Meter Display */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isCritical 
          ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
          : 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
                {data?.zoneName || 'Sector-62 (Noida)'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="font-mono text-sm uppercase text-slate-400">
                Overall Stress:
              </div>
              <div className={`font-mono text-2xl sm:text-3xl font-black tracking-widest ${
                isCritical ? 'text-rose-400' : 'text-emerald-300'
              }`}>
                {renderStressBlocks(overallStress)} {overallStress}%
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider border inline-block ${
              isCritical
                ? 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
            }`}>
              {data?.stressStatus || (isCritical ? 'CRITICAL BOTTLENECK' : 'CONTROLLED')}
            </span>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {isCritical ? 'Multi-agency mitigation recommended' : 'Infrastructure operating within capacity'}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Infrastructure Telemetry Dimensions */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">
          6 Core Infrastructure Pressure Telemetry Dimensions:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(data?.metrics || [
            { label: 'Road Capacity', valuePercent: 91, status: 'CRITICAL', barColor: 'rose', description: 'V/C ratio = 0.91' },
            { label: 'Bridge Load', valuePercent: 84, status: 'CRITICAL', barColor: 'amber', description: 'Elevated overpass queue' },
            { label: 'Parking Pressure', valuePercent: 87, status: 'CRITICAL', barColor: 'rose', description: 'Curbside & multi-level' },
            { label: 'EV Demand', valuePercent: 72, status: 'WARNING', barColor: 'cyan', description: 'Fast-charger draw' },
            { label: 'Public Transport', valuePercent: 81, status: 'CRITICAL', barColor: 'indigo', description: 'Transit bus crowding' },
            { label: 'Freight Hub', valuePercent: 78, status: 'WARNING', barColor: 'amber', description: 'Inbound yard dock line' }
          ]).map((metric) => (
            <div 
              key={metric.label}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate">{metric.label}</span>
                </div>
                <div className={`text-xl font-black font-mono mt-1 ${
                  metric.valuePercent >= 85 ? 'text-rose-400' :
                  metric.valuePercent >= 75 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {metric.valuePercent}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric.valuePercent >= 85 ? 'bg-rose-500' :
                    metric.valuePercent >= 75 ? 'bg-amber-500' :
                    'bg-emerald-400'
                  }`}
                  style={{ width: `${metric.valuePercent}%` }}
                />
              </div>

              <span className="text-[9px] font-mono text-slate-500 mt-1.5 truncate">
                {metric.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations Card & Action Bar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Automated Infrastructure Recommendations:</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Multi-Agency Coordinated Plan
          </span>
        </div>

        {/* 4 Action Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${reliefResult ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <span className="font-bold text-white">Shift freight → 11 PM–5 AM</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Reroutes heavy logistics to night freight window, slashing yard queues by 33%.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${reliefResult ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <span className="font-bold text-white">Increase signal throughput</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Webster adaptive algorithm allocates +18s green time to feeder intersection.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${reliefResult ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <span className="font-bold text-white">Activate alternate route</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Broadcasts navigation advisory diverting 16% commuter traffic via Electronic City.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${reliefResult ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <span className="font-bold text-white">Open secondary freight entry</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Unlocks Gate #3 to clear arterial shoulder parking and delivery truck spillback.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Confirmation */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            {reliefResult ? (
              <div className="text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Relief Plan Actuated: Overall Stress Reduced 86% → 64%</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">
                Execute multi-agency coordinated intervention to mitigate infrastructure bottleneck.
              </span>
            )}
          </div>

          <button
            onClick={handleApplyRelief}
            disabled={isApplying || Boolean(reliefResult)}
            className={`py-2 px-4 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 shadow-lg ${
              reliefResult
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 cursor-default'
                : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-black shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isApplying ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Actuating Infrastructure Relief...</span>
              </>
            ) : reliefResult ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Interventions Active (64% Stress)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Apply Infrastructure Relief Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
