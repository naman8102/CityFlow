import React, { useState, useEffect } from 'react';
import {
  Siren,
  ShieldCheck,
  AlertCircle,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  ShieldAlert,
  RotateCw,
  Crown,
  Shield,
  Navigation
} from 'lucide-react';
import { sosAPI } from '../services/sosService';

const VIP_DESTINATIONS = [
  { id: 'pmo', name: 'PMO / Central Secretariat High Security Zone', address: 'Rajpath / Kartavya Path Arterial', lat: 28.6145, lng: 77.2090 },
  { id: 'rashtrapati', name: 'Rashtrapati Bhavan Protocol Sector', address: 'President Estate, Central Delhi', lat: 28.6143, lng: 77.1994 },
  { id: 'diplomatic', name: 'Diplomatic Enclave / Chanakyapuri Security Enclave', address: 'Shanti Path, Chanakyapuri', lat: 28.5950, lng: 77.1850 },
  { id: 'vigyan', name: 'Vigyan Bhawan Convention Hub', address: 'Maulana Azad Road', lat: 28.6129, lng: 77.2185 },
  { id: 'airport', name: 'IGI Airport VIP Terminal 3 Express', address: 'Terminal 3 Protocol Gate', lat: 28.5562, lng: 77.1000 }
];

export default function SosRequestPanel({
  currentUser,
  currentSos,
  onSosUpdated,
  onEmergencyActivated
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sosType, setSosType] = useState('EMERGENCY'); // 'EMERGENCY' | 'VIP'
  const [selectedVipDest, setSelectedVipDest] = useState(VIP_DESTINATIONS[0].id);
  const [notes, setNotes] = useState('Critical Medical Escort — Arterial Priority Requested');

  const status = currentSos?.status || 'INACTIVE';
  const isVipSos = (currentSos?.sosType === 'VIP') || (sosType === 'VIP');

  // Keep notes synchronized when switching types
  const handleTypeChange = (type) => {
    setSosType(type);
    if (type === 'VIP') {
      setNotes('VIP Motorcade / State Dignitary Escort — Security Priority Clear Request');
    } else {
      setNotes('Critical Medical Escort — Arterial Priority Requested');
    }
  };

  const handleRequestActivation = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const destinationObj = sosType === 'VIP'
        ? VIP_DESTINATIONS.find(d => d.id === selectedVipDest) || VIP_DESTINATIONS[0]
        : {
            lat: 28.6448,
            lng: 77.2167,
            name: 'New Delhi Railway Station Emergency Hub',
            address: 'Ajmeri Gate Arterial'
          };

      const locationObj = sosType === 'VIP'
        ? {
            lat: 28.6143,
            lng: 77.1994,
            name: 'Diplomatic Enclave / Chanakyapuri VIP Compound',
            address: 'Shanti Path, Chanakyapuri Security Sector'
          }
        : {
            lat: 28.6289,
            lng: 77.2065,
            name: 'Dr. Ram Manohar Lohia Hospital Corridor',
            address: 'Baba Kharak Singh Marg, Connaught Place Arterial'
          };

      const res = await sosAPI.createRequest({
        notes,
        sosType,
        destination: destinationObj,
        location: locationObj,
        emergencyType: sosType === 'VIP' ? 'VIP_STATE_ESCORT' : 'CRITICAL_MEDICAL_ESCORT'
      });

      if (res.success && res.request) {
        setSuccessMsg(
          sosType === 'VIP'
            ? 'VIP Priority SOS requested! Transmitted to Delhi Police Traffic Command Hub.'
            : 'Emergency SOS requested! Transmitted to Delhi Police Traffic Command Hub.'
        );
        if (onSosUpdated) onSosUpdated(res.request);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit SOS request.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Configuration
  const getStatusBadge = () => {
    const isVip = currentSos?.sosType === 'VIP' || sosType === 'VIP';
    switch (status) {
      case 'REQUESTED':
        return {
          label: isVip ? '👑 VIP SOS REQUESTED' : 'SOS REQUESTED',
          badgeClass: isVip
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
          dotClass: isVip ? 'bg-purple-400 animate-ping' : 'bg-amber-400 animate-ping',
          policeMsg: 'Pending Police Verification at Traffic Command Hub',
          desc: isVip
            ? 'VIP request queued with priority. Awaiting commanding officer route verification.'
            : 'Emergency request queued with high priority. Awaiting commanding officer review.'
        };
      case 'VERIFIED':
        return {
          label: isVip ? '👑 VIP SOS VERIFIED' : 'SOS VERIFIED',
          badgeClass: isVip
            ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
          dotClass: isVip ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping',
          policeMsg: `Verified by ${currentSos?.verifiedByName || 'Traffic Police HQ'}`,
          desc: isVip
            ? 'Verified! Police command is ready to activate the VIP Priority Route.'
            : 'Verified! Police command is queuing arterial green wave corridor.'
        };
      case 'ACTIVE':
        return {
          label: isVip
            ? '👑 VIP SOS ACTIVE — PRIORITY ESCORT CORRIDOR ENGAGED'
            : '🚨 SOS ACTIVE — GREEN CORRIDOR ENGAGED',
          badgeClass: isVip
            ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse'
            : 'bg-rose-600/30 text-rose-200 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse',
          dotClass: isVip ? 'bg-purple-400 animate-ping' : 'bg-rose-500 animate-ping',
          policeMsg: `Activated by ${currentSos?.activatedByName || 'Police Hub'} · ${isVip ? 'VIP Escort Active' : 'Sovereign Corridor Locked'}`,
          desc: isVip
            ? 'VIP PROTOCOL LIVE: High-Security Priority Corridor engaged. Dual motorcade escort clearing signals.'
            : 'SOVEREIGN CORRIDOR LIVE: 6 Arterial Signals pre-empted GREEN. Non-emergency traffic diverted.'
        };
      case 'RESOLVED':
        return {
          label: isVip ? '👑 VIP ESCORT RESOLVED' : 'SOS RESOLVED',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dotClass: 'bg-emerald-400',
          policeMsg: 'Mission Successfully Completed & Cleared',
          desc: 'Corridor preemption released back to autonomous AI adaptive control.'
        };
      case 'INACTIVE':
      default:
        return {
          label: isVip ? 'VIP SOS INACTIVE' : 'SOS INACTIVE',
          badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
          dotClass: 'bg-slate-500',
          policeMsg: 'Ready for Transmission',
          desc: isVip
            ? 'Request dedicated VIP priority route clearance with police motorcade escort.'
            : 'Request priority traffic clearing and arterial green wave from Delhi Traffic Police Command.'
        };
    }
  };

  const badgeInfo = getStatusBadge();

  // Progress Stepper steps
  const steps = [
    { key: 'INACTIVE', step: 1, title: 'Standby / Ready' },
    { key: 'REQUESTED', step: 2, title: 'Police Queued' },
    { key: 'VERIFIED', step: 3, title: 'Verified HQ' },
    { key: 'ACTIVE', step: 4, title: 'Corridor Active' }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'REQUESTED': return 1;
      case 'VERIFIED': return 2;
      case 'ACTIVE': return 3;
      case 'RESOLVED': return 0;
      case 'INACTIVE':
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(status);

  return (
    <div id="sos-request-panel" className={`glass-panel p-4 sm:p-5 rounded-2xl border shadow-2xl flex flex-col gap-4 transition-all ${
      isVipSos
        ? 'border-purple-500/50 bg-gradient-to-b from-[#110d24] to-[#070b1a]'
        : 'border-rose-500/40 bg-gradient-to-b from-[#140b17] to-[#070b1a]'
    }`}>
      {/* Top Header: Badge + Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isVipSos
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}>
            {isVipSos ? (
              <Crown className="w-6 h-6 animate-pulse text-amber-400" />
            ) : (
              <Siren className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                isVipSos ? 'text-purple-400' : 'text-rose-400'
              }`}>
                {isVipSos ? 'High-Security VIP Escort Protocol' : 'Emergency Special Case Citizen Portal'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                isVipSos
                  ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                  : 'bg-rose-950 text-rose-300 border-rose-500/40'
              }`}>
                {isVipSos ? 'Route: VIP_PRIORITY_ROUTE' : 'Route: EMERGENCY_GREEN_CORRIDOR'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              {isVipSos ? 'VIP Priority SOS Escort Panel' : 'Priority SOS Activation Command'}
            </h3>
          </div>
        </div>

        {/* SOS Type Switcher (when inactive) */}
        {(status === 'INACTIVE' || status === 'RESOLVED') ? (
          <div className="flex items-center gap-1 bg-[#060a16] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => handleTypeChange('EMERGENCY')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                sosType === 'EMERGENCY'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Emergency SOS</span>
            </button>
            <button
              onClick={() => handleTypeChange('VIP')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                sosType === 'VIP'
                  ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-md'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>VIP SOS</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 ${badgeInfo.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${badgeInfo.dotClass}`} />
              {badgeInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <div
                key={s.key}
                className={`p-2.5 rounded-xl border font-mono flex flex-col gap-1 transition-all ${
                  isCurrent
                    ? isVipSos
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-rose-950/40 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-black/20 border-slate-800/80 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">STEP {s.step}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className={`text-[11px] font-bold ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIP Destination Picker (visible when inactive and VIP mode selected) */}
      {(status === 'INACTIVE' || status === 'RESOLVED') && sosType === 'VIP' && (
        <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              Select VIP Escort Destination:
            </span>
            <span className="text-[10px] font-mono text-slate-400">Independent Security Arterial Calculation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VIP_DESTINATIONS.map(dest => (
              <button
                key={dest.id}
                onClick={() => setSelectedVipDest(dest.id)}
                className={`p-2 rounded-lg text-left text-xs font-mono border transition flex items-start gap-2 cursor-pointer ${
                  selectedVipDest === dest.id
                    ? 'bg-purple-950/60 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedVipDest === dest.id ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold leading-tight">{dest.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{dest.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-black/40 border border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">REQUEST TIMESTAMP</span>
          <span className="text-white font-mono font-bold flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            {currentSos?.requestedAt
              ? new Date(currentSos.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Not initiated yet'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono block">POLICE VERIFICATION STATUS</span>
          <span className="font-mono font-bold flex items-center gap-1 mt-0.5 truncate text-slate-200">
            <ShieldCheck className={`w-3 h-3 ${status === 'VERIFIED' || status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`} />
            {badgeInfo.policeMsg}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono block">ASSIGNED ROUTE</span>
          <span className="text-white font-mono font-bold flex items-center gap-1 mt-0.5 truncate">
            {isVipSos ? (
              <>
                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{currentSos?.destination?.name || 'PMO / Central Secretariat High Security Zone'}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{currentSos?.location?.name || 'Dr. Ram Manohar Lohia Hospital Corridor'}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* VIP Active Telemetry HUD (when active) */}
      {status === 'ACTIVE' && isVipSos && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-black to-purple-950/40 border border-purple-500/50 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
            <span className="font-bold text-white uppercase">State Motorcade Escort Active</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">ETA</span>
              <span className="text-cyan-300 font-bold">8.4 min</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Convoy Speed</span>
              <span className="text-emerald-400 font-bold">54 km/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Safety Score</span>
              <span className="text-purple-300 font-bold">96/100</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Security Protocol</span>
              <span className="text-amber-300 font-bold">Z+ GRADE</span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-300">
          {badgeInfo.desc}
        </p>

        {status === 'INACTIVE' || status === 'RESOLVED' ? (
          <button
            disabled={loading}
            onClick={handleRequestActivation}
            className={`w-full sm:w-auto py-2.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer shrink-0 ${
              sosType === 'VIP'
                ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white shadow-purple-950/80'
                : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/60'
            }`}
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Transmitting Request...</span>
              </>
            ) : sosType === 'VIP' ? (
              <>
                <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>REQUEST VIP SOS ACTIVATION</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Siren className="w-4 h-4 animate-pulse" />
                <span>REQUEST SOS ACTIVATION</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        ) : status === 'REQUESTED' ? (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg shrink-0 bg-amber-950/40 border border-amber-500/40 text-amber-300">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Transmitted · Awaiting Police Click on [VERIFY]</span>
          </div>
        ) : status === 'VERIFIED' ? (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg shrink-0 bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Verified · Awaiting Police Click on [{isVipSos ? 'ACTIVATE VIP SOS' : 'PROCEED'}]</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg shrink-0 animate-pulse bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isVipSos ? 'VIP Priority Escort Corridor Active' : 'Sovereign Green Corridor Active'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
