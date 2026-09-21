import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { evaluatePasswordStrength, CHECKLIST_ITEMS } from '../utils/passwordPolicy';

export default function PasswordStrengthIndicator({ password = '', showOnlyWhenTyping = false }) {
  const evaluation = evaluatePasswordStrength(password);
  const isTyping = password.length > 0;

  if (showOnlyWhenTyping && !isTyping) {
    return null;
  }

  // Tier configuration for colors and badges
  const tierConfig = {
    1: {
      label: 'Weak',
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      badgeBg: 'bg-rose-950/60',
      icon: ShieldAlert,
      message: 'Does not meet required security criteria'
    },
    2: {
      label: 'Medium',
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-950/60',
      icon: Shield,
      message: 'Meets minimum security requirements'
    },
    3: {
      label: 'Strong',
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      badgeBg: 'bg-cyan-950/60',
      icon: ShieldCheck,
      message: 'Good password complexity'
    },
    4: {
      label: 'Very Strong',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-950/60',
      icon: ShieldCheck,
      message: 'Maximum security rating'
    }
  };

  const currentTier = isTyping ? tierConfig[evaluation.tier] : tierConfig[1];
  const TierIcon = currentTier.icon;

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-[#090e1c]/90 border border-slate-800/90 text-xs flex flex-col gap-2.5 transition-all">
      {/* Top Row: Strength Meter Bar & Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TierIcon className={`w-3.5 h-3.5 ${isTyping ? currentTier.textColor : 'text-slate-500'}`} />
          <span className="text-[11px] font-mono text-slate-300">
            Strength:
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
              isTyping
                ? `${currentTier.badgeBg} ${currentTier.textColor} ${currentTier.borderColor}`
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            {isTyping ? currentTier.label : 'Required'}
          </span>
        </div>

        {/* Requirements counter */}
        <span className="text-[10px] font-mono text-slate-400">
          <b className={evaluation.isValid ? 'text-emerald-400 font-bold' : 'text-slate-300 font-medium'}>
            {evaluation.validCount}
          </b>
          /6 criteria
        </span>
      </div>

      {/* 4-Segment Strength Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
        {[1, 2, 3, 4].map(step => {
          const active = isTyping && evaluation.tier >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                active ? currentTier.color : 'bg-slate-800/80'
              }`}
            />
          );
        })}
      </div>

      {/* Live Requirement Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60">
        {CHECKLIST_ITEMS.map(({ key, label }) => {
          const isFulfilled = evaluation.checks[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-2 py-1 px-1.5 rounded transition-colors ${
                isFulfilled
                  ? 'bg-emerald-950/20 text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold border transition-all ${
                  isFulfilled
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                {isFulfilled ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
              </div>
              <span className={`text-[10px] leading-tight ${isFulfilled ? 'font-medium text-emerald-300' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
