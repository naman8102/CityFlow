import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Activity, 
  X, 
  Zap, 
  Sparkles, 
  CloudRain, 
  Eye, 
  Truck, 
  Gauge, 
  Sliders, 
  ArrowRight,
  Radio,
  Siren
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

const CORRIDORS = [
  { id: 'nh-24', name: 'NH-24 Express Corridor' },
  { id: 'ashram-flyover', name: 'Ashram Flyover Descent' }
];

export default function IncidentPredictionModal({ isOpen, onClose }) {
  const [selectedCorridor, setSelectedCorridor] = useState('nh-24');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const fetchRiskData = async (corridorId) => {
    setLoading(true);
    try {
      const res = await cityFlowAPI.getIncidentPrediction(corridorId);
      setData(res);
      if (res?.isPrevented) {
        setExecutionResult({
          riskBeforePercent: res.baselineRiskPercent || 87,
          riskAfterPercent: res.riskPercent || 32,
          riskReductionPercent: (res.baselineRiskPercent || 87) - (res.riskPercent || 32)
        });
      } else {
        setExecutionResult(null);
      }
    } catch (err) {
      console.error('Failed to load incident prediction data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRiskData(selectedCorridor);
    }
  }, [isOpen, selectedCorridor]);

  const handleExecutePrevention = async () => {
    setIsExecuting(true);
    try {
      const res = await cityFlowAPI.applyPreventiveAction(selectedCorridor);
      setExecutionResult(res);
      await fetchRiskData(selectedCorridor);
    } catch (err) {
      console.error('Failed to execute preventive plan:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  const currentRisk = data?.riskPercent || 87;
  const isSafe = data?.isPrevented || currentRisk <= 40;

  // 10-block ASCII gauge
  const filledBlocks = Math.round((currentRisk / 100) * 10);
  const emptyBlocks = 10 - filledBlocks;
  const asciiGauge = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  const getReasonIcon = (id) => {
    switch (id) {
      case 'congestion': return <Gauge className="w-4 h-4 text-rose-400" />;
      case 'speed_variance': return <Activity className="w-4 h-4 text-amber-400" />;
      case 'heavy_vehicles': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'rain': return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'visibility': return <Eye className="w-4 h-4 text-slate-300" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl p-5 sm:p-6 rounded-2xl border border-rose-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isSafe 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}>
              {isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  AI Incident Prediction & Preventive Safety Shield
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isSafe
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse'
                }`}>
                  {isSafe ? 'HAZARD MITIGATED' : 'PRE-COLLISION WARNING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="line-through text-slate-500">Reactive (Post-Crash Response)</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-bold">Predictive + Preventive System</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corridor Switcher */}
        <div className="flex items-center gap-2">
          {CORRIDORS.map(corridor => (
            <button
              key={corridor.id}
              onClick={() => setSelectedCorridor(corridor.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                selectedCorridor === corridor.id
                  ? 'bg-rose-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {corridor.name}
            </button>
          ))}
        </div>

        {/* Top Risk Gauge & Paradigm Banner */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isSafe 
            ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border-emerald-500/50' 
            : 'bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/60 border-rose-500/50'
        }`}>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Corridor Hazard Probability Engine
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                ACCIDENT RISK:
              </span>
              <span className={`text-2xl sm:text-3xl font-mono font-black ${
                isSafe ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {currentRisk}%
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${
                isSafe 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                {isSafe ? 'STABLE' : 'CRITICAL HAZARD'}
              </span>
            </div>
            <div className="font-mono text-sm tracking-widest mt-1.5" style={{ color: isSafe ? '#10b981' : '#f43f5e' }}>
              {asciiGauge} <span className="text-xs text-slate-400 font-sans">({currentRisk}% Risk Probability)</span>
            </div>
          </div>

          <div className="md:text-right text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Target Corridor:</span>
            <span className="font-bold text-white text-sm">{data?.name || 'NH-24'}</span>
            <span className="text-[11px] text-cyan-300 font-mono mt-0.5">
              {isSafe ? '✓ Hazard Eliminated Pre-Incident' : '⚠️ Intercept Window: ~25-40 min'}
            </span>
          </div>
        </div>

        {/* 2-Column Split: Reasons (Left) vs Preventive Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: 5 Causal Reasons */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Root Cause Attribution (Why Risk is 87%)
              </span>
              <span className="text-[10px] font-mono text-slate-400">5 Hazard Vectors</span>
            </div>

            <div className="flex flex-col gap-2">
              {data?.reasons?.map((reason) => (
                <div 
                  key={reason.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                >
                  <div className="p-1 rounded bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getReasonIcon(reason.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{reason.title}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        reason.severity === 'CRITICAL' ? 'text-rose-300 bg-rose-950 border border-rose-500/40' :
                        reason.severity === 'HIGH' ? 'text-amber-300 bg-amber-950 border border-amber-500/40' :
                        'text-cyan-300 bg-cyan-950 border border-cyan-500/40'
                      }`}>
                        {reason.severity}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-amber-300/90 mt-0.5">
                      {reason.metric}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {reason.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 4 Preventive Actions */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-2">
                <span className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Preventive Action Plan (Pre-Incident)
                </span>
                <span className="text-[10px] font-mono text-slate-400">4 Interventions</span>
              </div>

              <div className="flex flex-col gap-2">
                {data?.preventiveActions?.map((action, i) => (
                  <div 
                    key={action.id || i}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 text-xs transition-all ${
                      isSafe
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSafe ? 'text-emerald-400' : 'text-slate-600'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{action.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                          {action.agency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {action.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Impact Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Risk Reduction</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    87% → 32% (-55%)
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Crashes Averted</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    2-3 in next 45 min
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExecutePrevention}
                disabled={isExecuting || isSafe}
                className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95 ${
                  isSafe
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 cursor-default'
                    : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:from-rose-400 hover:to-emerald-400 text-black shadow-[0_0_25px_rgba(244,63,94,0.35)]'
                }`}
              >
                {isExecuting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Executing 4 Preventive Actions...</span>
                  </>
                ) : isSafe ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Preventive Safety Shield Active · Risk 32%</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>🛡️ Execute Preventive Safety Plan (Crush Risk 87% → 32%)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Confirmation Banner */}
        {isSafe && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="font-bold text-white block">
                  ✓ Autonomous Preventive Shield Executed: Inflow Metered · Patrol Alerted · Freight Shifted · Signals Buffered
                </strong>
                <span className="text-[11px] text-emerald-300/90">
                  NH-24 crash risk dropped from 87% to 32% · Secondary bottleneck averted before collision occurrence
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-500/40 shrink-0">
              Risk: 32% (SAFE)
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
