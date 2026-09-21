import React, { useState } from 'react';
import SignalController from '../components/SignalController';
import EmergencyCorridorHUD from '../components/EmergencyCorridorHUD';
import ExplainableAIDecisionModal from '../components/ExplainableAIDecisionModal';
import PoliceSosQueue from '../components/PoliceSosQueue';
import { Shield, Siren, AlertTriangle, Zap, CheckCircle2, Radio, Activity, Cpu, RotateCcw, RefreshCw, Brain, ShieldAlert } from 'lucide-react';

const STATE_COLOR = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-500',
  RED: 'bg-rose-500'
};

export default function PoliceDashboard({
  signals = [],
  selectedSignal,
  onUpdateSignal,
  emergencyData,
  onDispatchEmergency,
  onClearEmergency,
  onSimulateHotspot,
  hotspotData,
  interventionData,
  isApplyingIntervention,
  onApplyIntervention,
  onRevertIntervention,
  onSimulateIncidentResponse,
  onOpenIncidentPrediction,
  sosRequests = [],
  onSosUpdated,
  onEmergencyActivated
}) {
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">Traffic Police Command Authority</span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono px-2 py-0.5 rounded">
              GRADE 1 JURISDICTION
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Central Arterial Signal & Emergency Command Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate green corridors, monitor arterial volume thresholds, and execute manual or autonomous signal overrides.
          </p>
        </div>

        {/* Emergency SOS Trigger & Incident Response Demo */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {emergencyData ? (
            <button
              onClick={onClearEmergency}
              className="py-2 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Clear Corridor Preemption
            </button>
          ) : (
            <button
              onClick={onDispatchEmergency}
              className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-rose-600/30 animate-pulse"
            >
              <Siren className="w-4 h-4 text-white" />
              Trigger Ambulance SOS
            </button>
          )}

          <button
            onClick={() => setIsXAIModalOpen(true)}
            className="py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            title="Explainable AI: View Why Did AI Do This for Signal #12"
          >
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>🧠 Why AI Decision?</span>
          </button>

          <button
            onClick={onSimulateIncidentResponse}
            className="py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            title="Simulate Accident on NH-24 and trigger automated 6-point AI response plan"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>🚨 Incident AI Response</span>
          </button>

          <button
            onClick={onOpenIncidentPrediction}
            className="py-2 px-3 rounded-lg bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-rose-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 border border-rose-400/50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            title="Predict and prevent incidents before they occur (NH-24 Risk 87%)"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>🛡️ Predict & Prevent</span>
          </button>

          <button
            onClick={onSimulateHotspot}
            className="py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Inject Peak Surge (A)
          </button>
        </div>
      </div>

      {/* Special Case Priority SOS Requests Queue */}
      <PoliceSosQueue
        requests={sosRequests}
        onSosUpdated={onSosUpdated}
        onEmergencyActivated={onEmergencyActivated}
      />

      {/* Active Emergency Green Corridor Flagship HUD */}
      {emergencyData && (
        <EmergencyCorridorHUD
          emergencyData={emergencyData}
          onDispatchEmergency={onDispatchEmergency}
          onClearEmergency={onClearEmergency}
          signals={signals}
        />
      )}

      {/* AI Closed-Loop Action Center */}
      {hotspotData && (
        <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 animate-in fade-in ${
          interventionData 
            ? 'border-emerald-500/70 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.15)]' 
            : 'border-amber-500/60 bg-gradient-to-br from-amber-950/25 via-slate-900/60 to-slate-950/80 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
        }`}>
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg shrink-0 ${
                interventionData ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {interventionData ? <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" /> : <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    interventionData ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-amber-900/60 text-amber-200 border border-amber-500/40'
                  }`}>
                    {interventionData ? '🟢 CLOSED-LOOP INTERVENTION ACTUATED' : '⚠️ BOTTLENECK SURGE DETECTED'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                    {hotspotData.intersectionName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>AI Closed-Loop Urban Actuation System</span>
                </h3>
              </div>
            </div>

            {interventionData ? (
              <button
                onClick={onRevertIntervention}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Revert to Baseline</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 self-start sm:self-auto">
                Stage 3 / 6: Action Prescribed
              </span>
            )}
          </div>

          {/* Body */}
          {!interventionData ? (
            <div className="flex flex-col gap-4 mt-3">
              {/* Step 1 & 2: Telemetry + Root Cause */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-Time Anomaly Telemetry</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-400">Current Inflow</div>
                      <div className="text-sm font-mono font-bold text-amber-400">{hotspotData.currentVolumeVPH} vph</div>
                      <div className="text-[9px] text-slate-500">Cap: {hotspotData.nominalCapacityVPH} vph (132%)</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">BPR Queue Delay</div>
                      <div className="text-sm font-mono font-bold text-rose-400">+{hotspotData.estimatedDelayMinutes} min</div>
                      <div className="text-[9px] text-rose-400/80">LOS: {hotspotData.levelOfService}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Diagnostic Root Cause</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {hotspotData.rootCause || "High arterial inflow surge compounded by downstream bottleneck impedance at Tolstoy Marg."}
                  </p>
                </div>
              </div>

              {/* Step 3: Prescribed 4-Point AI Action Plan */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] font-mono uppercase font-bold text-indigo-300 mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    Prescribed 4-Point Automated Intervention:
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Multi-Agent Actuation Mesh</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-base leading-none">🟢</span>
                    <div>
                      <span className="font-bold text-slate-200">1. Adaptive Green Split (+18s):</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Extend NS green to {hotspotData.recommendedSignalPhase?.nsGreenSeconds || 52}s. Flushes 380 queued vehicles/cycle.
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-base leading-none">🔀</span>
                    <div>
                      <span className="font-bold text-slate-200">2. Dynamic Commuter Diversion:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Broadcast automated guidance diverting 12% flow (~285 vph) via Janpath bypass.
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-base leading-none">🚛</span>
                    <div>
                      <span className="font-bold text-slate-200">3. Commercial Freight Shifting:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enforce 20-min temporary off-peak shift for commercial trucks (removes 4.2% heavy vehicle lane occupancy).
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-base leading-none">🚦</span>
                    <div>
                      <span className="font-bold text-slate-200">4. Green Wave Progression:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Synchronize offsets across Barakhamba, Connaught, and Chelmsford crossings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Projected Impact & The BIG Execute Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-slate-900/60 border border-cyan-500/30">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Projected Queue</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">↓ 31%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Travel Delay</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">↓ 18%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">CO₂ Mitigation</span>
                    <span className="text-sm font-mono font-bold text-emerald-300">↓ 12%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Service</span>
                    <span className="text-sm font-mono font-bold text-indigo-300">LOS C</span>
                  </div>
                </div>

                <button
                  onClick={onApplyIntervention}
                  disabled={isApplyingIntervention}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isApplyingIntervention ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Actuating Mesh...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white animate-bounce" />
                      <span>Apply AI Intervention (Execute Action)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Post-Actuation Measured Results */
            <div className="mt-4 flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Intervention Successfully Executed:</strong> Split adjusted (+18s Green allocated). 3 signals coordinated in green wave. 2 commercial freight trips shifted off-peak. 285 vph commuters rerouted.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Queue Reduction</div>
                  <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
                    -{interventionData.measuredImpact?.queueReductionPercent || 31.4}%
                  </div>
                  <div className="text-[9px] text-emerald-300/80 font-mono mt-0.5">FLUSHED FROM MESH</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Delay Saved</div>
                  <div className="text-lg font-mono font-black text-cyan-400 mt-0.5">
                    -{interventionData.measuredImpact?.delayReductionMinutes || 10.1} min
                  </div>
                  <div className="text-[9px] text-cyan-300/80 font-mono mt-0.5">PER COMMUTER VEHICLE</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-500/30 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Traffic Diverted</div>
                  <div className="text-lg font-mono font-black text-teal-400 mt-0.5">
                    {interventionData.actuationSummary?.trafficDivertedVPH || 285} vph
                  </div>
                  <div className="text-[9px] text-teal-300/80 font-mono mt-0.5">VIA JANPATH BYPASS</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Service Level</div>
                  <div className="text-lg font-mono font-black text-indigo-300 mt-0.5">
                    LOS F → LOS C
                  </div>
                  <div className="text-[9px] text-indigo-400/80 font-mono mt-0.5">FLOW RESTORED</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Signal Grid — Click to select */}
      {signals.length > 0 && (
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">Live Signal Mesh — Click to Inspect & Override</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {signals.map(sig => {
              const isSelected = selectedSignal?.id === sig.id;
              const isPreempted = sig.preemptedByEmergency;
              return (
                <button
                  key={sig.id}
                  onClick={() => onUpdateSignal({ signalId: sig.id, _selectOnly: true })}
                  className={`p-3 rounded-lg border text-left flex items-center gap-3 transition active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="relative shrink-0">
                    <span className={`w-3 h-3 rounded-full block ${STATE_COLOR[sig.currentState] || 'bg-slate-500'}`}></span>
                    {isPreempted && <span className="absolute -top-1 -right-1 text-[8px] text-emerald-400 font-black">⚡</span>}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>{sig.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className={isPreempted ? 'text-emerald-400' : ''}>
                        {isPreempted ? '⚡ SOS LOCK' : sig.currentState}
                      </span>
                      <span>·</span>
                      <span>{sig.remainingSeconds || 0}s</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Signal Controller Panel */}
      <SignalController
        selectedSignal={selectedSignal}
        onUpdateSignal={onUpdateSignal}
      />

      {/* 🧠 Explainable AI Decision Modal */}
      <ExplainableAIDecisionModal
        isOpen={isXAIModalOpen}
        onClose={() => setIsXAIModalOpen(false)}
        signalId={selectedSignal?.id || 'sig-barakhamba'}
        signalName={selectedSignal?.name || 'Signal #12: Barakhamba Junction'}
      />
    </div>
  );
}
