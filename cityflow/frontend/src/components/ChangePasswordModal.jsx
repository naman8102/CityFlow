import React, { useState } from 'react';
import {
  LockKeyhole,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { evaluatePasswordStrength } from '../utils/passwordPolicy';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const evaluation = evaluatePasswordStrength(newPassword);
  const isMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!evaluation.isValid) {
      setError('New password does not meet all 6 required security criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password cannot be identical to your current password.');
      return;
    }

    setBusy(true);
    try {
      const res = await cityFlowAPI.changePassword({ currentPassword, newPassword });
      setSuccessMsg(res.message || 'Password changed successfully!');
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to change password. Please verify your current password.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-cyan-500/40 p-6 shadow-2xl relative bg-[#090e1c]/95 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">
                Change Operator Password
              </h3>
              <p className="text-[11px] text-slate-400">CityFlow Secure Authentication Policy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-4">
          {/* Current Password Field */}
          <label className="block text-xs text-slate-300">
            <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
              <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> Current Password
            </span>
            <div className="relative">
              <input
                required
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-3.5 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {/* New Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> New Password (8–15 chars)
              </span>
            </div>
            <div className="relative">
              <input
                required
                maxLength={15}
                type={showNew ? 'text' : 'password'}
                placeholder="New password (e.g. Secure#Pass9)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-3.5 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-Time Password Strength Meter & Live Checklist */}
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          {/* Confirm New Password Field */}
          <label className="block text-xs text-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> Confirm New Password
              </span>
              {confirmPassword.length > 0 && (
                <span className={`text-[10px] font-mono flex items-center gap-1 ${isMatch ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}`}>
                  {isMatch ? <><Check className="w-3 h-3" /> Passwords match</> : '✕ Does not match'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                required
                maxLength={15}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full bg-[#070b14] border rounded-lg pl-3.5 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition ${
                  confirmPassword.length > 0
                    ? isMatch
                      ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-emerald-400'
                      : 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-400'
                    : 'border-slate-700/80 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={busy || !evaluation.isValid || !isMatch}
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{busy ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
