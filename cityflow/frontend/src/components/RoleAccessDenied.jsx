import React from 'react';
import { ShieldAlert, ArrowRight, LogOut, Radio, Lock } from 'lucide-react';

export default function RoleAccessDenied({
  currentUser,
  targetRouteName = 'Police Dashboard',
  targetRole = 'POLICE',
  correctRoute = '/citizen',
  correctRouteName = 'Citizen Dashboard',
  onNavigate,
  onSignOut
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/50 bg-[#0b0c1e]/95 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-4">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

        {/* Shield Icon */}
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            Role-Based Access Control (RBAC) Enforcement
          </span>
          <h2 className="text-xl font-black text-white mt-1">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            This dashboard requires <strong className="text-rose-300 font-mono">{targetRole}</strong> authorization credentials.
          </p>
        </div>

        {/* Current Identity Card */}
        <div className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-left text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
            <span>CURRENT TAB IDENTITY</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
            </span>
          </div>
          <div className="text-white font-bold truncate">{currentUser?.name || 'User'}</div>
          <div className="text-slate-400 text-[10px]">{currentUser?.email}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              ROLE: {currentUser?.role || 'USER'}
            </span>
            {currentUser?.userType === 'EMERGENCY_SPECIAL' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                SPECIAL CASE
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            onClick={() => onNavigate(correctRoute)}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition cursor-pointer"
          >
            <span>Go to Your Authorized {correctRouteName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSignOut}
            className="w-full py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch / Sign In with Different Role</span>
          </button>
        </div>
      </div>
    </div>
  );
}
