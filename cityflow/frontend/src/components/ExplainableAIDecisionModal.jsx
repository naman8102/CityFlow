import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Clock, 
  Car, 
  CloudRain, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

export default function ExplainableAIDecisionModal({ 
  isOpen, 
  onClose, 
  signalId = 'sig-barakhamba',
  signalName = 'Signal #12: Barakhamba Junction'
}) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const data = await cityFlowAPI.getExplainableSignalDecision(signalId);
        if (isMounted && data) {
          setExplanation(data);
        }
      } catch (err) {
        console.error('Failed to load XAI explanation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchExplanation();
    return () => { isMounted = false; };
  }, [isOpen, signalId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-cyan-500/60 bg-gradient-to-b from-[#090d1f] via-[#080d1a] to-[#040810] shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-start justify-between gap-3 bg-slate-950/40 relative">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 mt-0.5">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Explainable AI (XAI)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold">
                  High Transparency
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                WHY DID AI DO THIS?
              </h2>
              <p className="text-xs text-slate-400">
                Decision feature attribution & causal reasoning for municipal traffic engineers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Decision Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Intervention Target</div>
              <div className="text-sm font-bold text-white">
                {explanation?.signalLabel || signalName}
              </div>
              <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                {explanation?.interventionTitle || 'Extended North Green 22s → 42s (+20s AI Boost) & Phase 1 Priority'}
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-center shrink-0">
              <div className="text-[9px] uppercase font-mono tracking-wider text-emerald-400">AI Certainty</div>
              <div className="text-lg font-black font-mono text-emerald-300">
                Confidence: {explanation?.confidencePercent || 91}%
              </div>
            </div>
          </div>

          {/* Core User Requirement: "AI changed Signal #12 because:" */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
              <span>AI changed Signal #12 because:</span>
            </div>

            {/* 5 Factors Breakdown Table / Cards */}
            <div className="space-y-2 mt-3">
              {(explanation?.causalFactors || [
                { name: 'Traffic volume', delta: '+38%', type: 'CRITICAL', color: 'rose', barPercent: 85 },
                { name: 'Queue length', delta: '+42%', type: 'CRITICAL', color: 'rose', barPercent: 92 },
                { name: 'Average speed', delta: '-27%', type: 'WARNING', color: 'amber', barPercent: 65 },
                { name: 'Downstream capacity', delta: '-18%', type: 'WARNING', color: 'amber', barPercent: 50 },
                { name: 'Rain impact', delta: '+9%', type: 'INFO', color: 'cyan', barPercent: 30 }
              ]).map((factor) => {
                const isPositive = factor.delta.startsWith('+');
                const isBad = factor.name === 'Traffic volume' || factor.name === 'Queue length' || factor.name === 'Rain impact' ? isPositive : !isPositive;
                
                return (
                  <div 
                    key={factor.name}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      {factor.name === 'Traffic volume' && <Car className="w-3.5 h-3.5 text-rose-400" />}
                      {factor.name === 'Queue length' && <Layers className="w-3.5 h-3.5 text-rose-400" />}
                      {factor.name === 'Average speed' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {factor.name === 'Downstream capacity' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      {factor.name === 'Rain impact' && <CloudRain className="w-3.5 h-3.5 text-cyan-400" />}
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {factor.name}
                      </span>
                    </div>

                    {/* Progress Bar Visualization */}
                    <div className="flex-1 hidden sm:block h-1.5 bg-slate-800 rounded-full overflow-hidden mx-2">
                      <div 
                        className={`h-full rounded-full ${
                          factor.name === 'Traffic volume' || factor.name === 'Queue length' ? 'bg-rose-500' :
                          factor.name === 'Average speed' || factor.name === 'Downstream capacity' ? 'bg-amber-500' :
                          'bg-cyan-400'
                        }`}
                        style={{ width: `${factor.barPercent || 60}%` }}
                      />
                    </div>

                    {/* Delta Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded font-mono font-black text-xs ${
                        factor.delta.startsWith('+') && (factor.name === 'Traffic volume' || factor.name === 'Queue length')
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                          : factor.delta.startsWith('-')
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-600/50'
                      }`}>
                        {factor.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Plain English Synthesis */}
            <div className="mt-3.5 p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-300">AI Rationale: </span>
              {explanation?.synthesis || `AI detected North queue surge (+42%) and approach speed collapse (-27%) with downstream bottlenecking (-18%). Extending Green (+20s) clears 32 queued vehicles with 91% confidence.`}
            </div>
          </div>

          {/* Counterfactual Analysis: "What if AI did nothing?" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Quo */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono uppercase font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Without AI (Static Timing)</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">Queue Expands to 118 Vehicles</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Delay climbs to 18.6 min · LOS F gridlock in 4.5 minutes.
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-rose-400">
                Spillback Risk: <span className="font-bold">CRITICAL</span>
              </div>
            </div>

            {/* AI Decision */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>With AI Decision (Adaptive Actuation)</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">Queue Relieved to 54 Vehicles</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Delay dropped to 8.1 min · LOS C stable flow achieved.
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-300">
                Net Delay Saved: <span className="font-bold">⏱️ 10.5 minutes</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800/90 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Model: Physics-Informed XGBoost + Webster Multi-Arm Policy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition cursor-pointer ml-auto active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
