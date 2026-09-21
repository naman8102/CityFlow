import React, { useState } from 'react';
import {
  Siren,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Radio,
  ArrowRight,
  ShieldAlert,
  RotateCw,
  Sparkles,
  Flame,
  Crown,
  Shield,
  Navigation,
  Compass
} from 'lucide-react';
import { sosAPI } from '../services/sosService';

export default function PoliceSosQueue({
  requests = [],
  onSosUpdated,
  onEmergencyActivated
}) {
  const [loadingId, setLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'VIP' | 'EMERGENCY'

  const activeOrPending = requests.filter(r => ['REQUESTED', 'VERIFIED', 'ACTIVE'].includes(r.status));
  const vipRequests = activeOrPending.filter(r => r.sosType === 'VIP');
  const emergencyRequests = activeOrPending.filter(r => r.sosType !== 'VIP');

  const handleVerify = async (reqId) => {
    try {
      setLoadingId(reqId);
      setActionError('');
      const res = await sosAPI.verifyRequest(reqId);
      if (res.success && res.request) {
        if (onSosUpdated) onSosUpdated(res.request);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to verify request.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleProceedEmergency = async (reqId) => {
    try {
      setLoadingId(reqId);
      setActionError('');
      const res = await sosAPI.proceedRequest(reqId);
      if (res.success && res.request) {
        if (onSosUpdated) onSosUpdated(res.request);
        if (onEmergencyActivated) onEmergencyActivated(res.emergencyData || res.mission);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to activate Emergency Green Corridor.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleActivateVip = async (reqId) => {
    try {
      setLoadingId(reqId);
      setActionError('');
      const res = await sosAPI.activateVipRequest(reqId);
      if (res.success && res.request) {
        if (onSosUpdated) onSosUpdated(res.request);
        if (onEmergencyActivated) onEmergencyActivated(res.vipData || res.vipRoute);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to activate VIP Priority Corridor.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (reqId) => {
    try {
      setLoadingId(reqId);
      setActionError('');
      const res = await sosAPI.resolveRequest(reqId);
      if (res.success && res.request) {
        if (onSosUpdated) onSosUpdated(res.request);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to resolve request.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-indigo-500/40 bg-[#090d1f] shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            <ShieldAlert className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                Delhi Police Traffic Command Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono">
                Real-Time Dual-Tab SSE Sync
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              Priority SOS Command & Preemption Queue
              {activeOrPending.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500 text-white animate-pulse">
                  {activeOrPending.length} ACTIVE
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Section Tabs: ALL | VIP SOS | EMERGENCY SOS */}
        <div className="flex items-center gap-1 bg-[#060a16] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Requests ({activeOrPending.length})
          </button>
          <button
            onClick={() => setActiveTab('VIP')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
              activeTab === 'VIP' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            VIP SOS ({vipRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('EMERGENCY')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
              activeTab === 'EMERGENCY' ? 'bg-rose-600 text-white shadow-md' : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <Siren className="w-3 h-3 text-rose-300" />
            Emergency ({emergencyRequests.length})
          </button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Empty State */}
      {activeOrPending.length === 0 && (
        <div className="p-6 rounded-xl border border-slate-800/80 bg-black/20 text-center flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-slate-600" />
          <p className="text-xs text-slate-400 font-medium">
            No pending SOS requests. Connected and waiting for Citizen or VIP transmissions.
          </p>
          <span className="text-[10px] font-mono text-slate-500">
            When a Special Case Citizen or VIP user clicks "Request SOS" in Tab 1, it arrives here instantly.
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 1: VIP SOS REQUESTS (Dedicated Section)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'ALL' || activeTab === 'VIP') && vipRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                VIP SOS Requests · High-Security Motorcade Escorts
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
              Protocol Level: Z+ Priority Corridor
            </span>
          </div>

          {vipRequests.map(req => {
            const reqId = req._id || req.requestId;
            const isRequested = req.status === 'REQUESTED';
            const isVerified = req.status === 'VERIFIED';
            const isActive = req.status === 'ACTIVE';
            const routeInfo = req.routeDetails;

            return (
              <div
                key={reqId}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-purple-950/30 border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                    : isVerified
                    ? 'bg-amber-950/25 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-purple-950/15 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-in fade-in'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: VIP Requester & Location/Destination Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : isVerified
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}>
                      <Crown className={`w-6 h-6 ${isActive ? 'animate-bounce text-amber-400' : isRequested ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* VIP User Name & Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{req.userName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50 font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          VIP PROTOCOL
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {req.requestId}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          Route ID: VIP_PRIORITY_ROUTE
                        </span>
                      </div>

                      {/* Origin and Destination */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs font-mono">
                        <div className="flex items-start gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Location</span>
                            <span className="font-semibold text-white">{req.location?.name || 'VIP Origin Compound'}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Destination</span>
                            <span className="font-semibold text-white">{req.destination?.name || 'PMO / Central Secretariat'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Calculated VIP Route, ETA, and Route Risk Telemetry */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-purple-500/30 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-purple-400 block font-bold uppercase">Calculated VIP Route</span>
                          <span className="text-white font-bold">{routeInfo?.name || 'VIP High-Security Priority Corridor (Motorcade Cleared)'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block">ETA</span>
                            <span className="text-cyan-300 font-bold">{routeInfo?.estimatedTimeMinutes || 8.4} min</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Convoy Speed</span>
                            <span className="text-emerald-400 font-bold">{routeInfo?.speedKmph || 54} km/h</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Route Risk</span>
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <Shield className="w-3 h-3 text-emerald-400" />
                              {routeInfo?.riskScore || 8}% (Low Risk)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Safety Score</span>
                            <span className="text-purple-300 font-bold">{routeInfo?.safetyIndex || 96}/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Request Time & Notes */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Requested: {new Date(req.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="italic text-slate-300">
                          "{req.notes || 'VIP Motorcade Security Priority Escort'}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & VIP Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
                    {/* Status Chip */}
                    <div className="text-right sm:mr-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                        isActive
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : isVerified
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-400 animate-ping' : isVerified ? 'bg-amber-400 animate-ping' : 'bg-purple-400 animate-ping'}`} />
                        {req.status}
                      </span>
                    </div>

                    {/* Action 1: VERIFY (when REQUESTED) */}
                    {isRequested && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleVerify(reqId)}
                        className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/50 active:scale-95 transition cursor-pointer"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>VERIFY</span>
                      </button>
                    )}

                    {/* Action 2: ACTIVATE VIP SOS (when VERIFIED) */}
                    {isVerified && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleActivateVip(reqId)}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/80 active:scale-95 transition cursor-pointer animate-pulse"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Crown className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>ACTIVATE VIP SOS 🚀</span>
                      </button>
                    )}

                    {/* Action 3: RESOLVE VIP ESCORT (when ACTIVE) */}
                    {isActive && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleResolve(reqId)}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>RESOLVE VIP ESCORT</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 2: EMERGENCY MEDICAL SOS REQUESTS
          ═══════════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'ALL' || activeTab === 'EMERGENCY') && emergencyRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-rose-400" />
                Emergency Medical SOS Requests · Green Wave Corridor
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
              Route ID: EMERGENCY_GREEN_CORRIDOR
            </span>
          </div>

          {emergencyRequests.map(req => {
            const reqId = req._id || req.requestId;
            const isRequested = req.status === 'REQUESTED';
            const isVerified = req.status === 'VERIFIED';
            const isActive = req.status === 'ACTIVE';

            return (
              <div
                key={reqId}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    : isVerified
                    ? 'bg-cyan-950/30 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-in fade-in'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Left Column: Requester Info */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      isActive
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : isVerified
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-amber-500/20 border-amber-500 text-amber-300'
                    }`}>
                      <Siren className={`w-5 h-5 ${isActive ? 'animate-bounce' : isRequested ? 'animate-pulse' : ''}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{req.userName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {req.requestId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                          SPECIAL CITIZEN
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {new Date(req.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {req.location?.name || 'Dr. Ram Manohar Lohia Hospital'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-cyan-400" />
                          Destination: {req.destination?.name || 'New Delhi Railway Station'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1.5 italic">
                        "{req.notes || 'Special Case Citizen Emergency Medical SOS'}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Status & Dual Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                    <div className="text-right sm:mr-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        isActive
                          ? 'bg-rose-500/30 text-rose-200 border-rose-500'
                          : isVerified
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-400 animate-ping' : isVerified ? 'bg-cyan-400 animate-ping' : 'bg-amber-400 animate-ping'}`} />
                        {req.status}
                      </span>
                    </div>

                    {/* Action 1: VERIFY */}
                    {isRequested && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleVerify(reqId)}
                        className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/50 active:scale-95 transition cursor-pointer"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>VERIFY</span>
                      </button>
                    )}

                    {/* Action 2: PROCEED EMERGENCY GREEN CORRIDOR */}
                    {isVerified && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleProceedEmergency(reqId)}
                        className="py-2 px-5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60 active:scale-95 transition cursor-pointer animate-pulse"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-amber-200" />
                        )}
                        <span>PROCEED & ACTIVATE 🚀</span>
                      </button>
                    )}

                    {/* Action 3: RESOLVE */}
                    {isActive && (
                      <button
                        disabled={loadingId === reqId}
                        onClick={() => handleResolve(reqId)}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                      >
                        {loadingId === reqId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>RESOLVE MISSION</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
