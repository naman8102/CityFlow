import React, { useState, useEffect } from 'react';
import {
  Activity,
  LockKeyhole,
  Mail,
  UserRound,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Copy,
  Shield,
  Truck,
  Users,
  Eye,
  EyeOff,
  Check,
  Siren,
  ShieldAlert,
  Crown
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { evaluatePasswordStrength } from '../utils/passwordPolicy';
import { setTabSession } from '../utils/sessionManager';

export default function AuthPage({ onAuthenticated, targetRoute = '/citizen' }) {
  // Modes: 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetCode: '',
    role: targetRoute === '/police' ? 'POLICE' : targetRoute === '/logistics' ? 'LOGISTICS' : 'USER',
    userType: 'NORMAL',
    accessKey: targetRoute === '/police' ? 'POLICE-DELHI-2026' : targetRoute === '/logistics' ? 'FLEET-LOGIX-2026' : ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [dbStatus, setDbStatus] = useState(null);

  // Sync form defaults if targetRoute changes
  useEffect(() => {
    if (targetRoute === '/police') {
      setForm(f => ({ ...f, role: 'POLICE', accessKey: 'POLICE-DELHI-2026' }));
    } else if (targetRoute === '/logistics') {
      setForm(f => ({ ...f, role: 'LOGISTICS', accessKey: 'FLEET-LOGIX-2026' }));
    } else {
      setForm(f => ({ ...f, role: 'USER' }));
    }
  }, [targetRoute]);

  // Fetch DB & Auth readiness on mount
  useEffect(() => {
    cityFlowAPI.getAuthStatus()
      .then(res => {
        if (res?.database) setDbStatus(res.database);
      })
      .catch(() => {
        // Fallback info if server offline
        setDbStatus({ connectedToMongo: false, state: 'Offline', localStoreActive: true });
      });
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  const fillDemoUser = (email, password) => {
    setForm(prev => ({ ...prev, email, password }));
    setError('');
  };

  const handleLoginOrSignup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccessMsg('');

    if (mode === 'signup') {
      const evalRes = evaluatePasswordStrength(form.password);
      if (!evalRes.isValid) {
        setError('Password must satisfy all 6 security requirements (8–15 chars, uppercase, lowercase, number, special char, no spaces).');
        setBusy(false);
        return;
      }
    }

    try {
      const result = mode === 'login'
        ? await cityFlowAPI.login({ email: form.email, password: form.password })
        : await cityFlowAPI.signup({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            userType: form.role === 'USER' ? form.userType : 'NORMAL',
            accessKey: form.accessKey
          });

      setTabSession(result.token, result.user);
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'Unable to connect to CityFlow. Please ensure the backend server is running.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await cityFlowAPI.forgotPassword({ email: form.email });
      const code = res.resetCode || res.resetToken;
      setGeneratedCode(code);
      setForm(prev => ({ ...prev, resetCode: code }));
      setSuccessMsg(`Reset code generated for ${form.email}. Code: ${code}`);
      // Transition to reset mode with pre-filled code
      setTimeout(() => {
        setMode('reset');
      }, 1200);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'Failed to generate password reset code. Please check your email.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    const evalRes = evaluatePasswordStrength(form.password);
    if (!evalRes.isValid) {
      setError('New password must satisfy all 6 security requirements (8–15 chars, uppercase, lowercase, number, special char, no spaces).');
      return;
    }

    setBusy(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await cityFlowAPI.resetPassword({
        email: form.email,
        code: form.resetCode,
        newPassword: form.password
      });

      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setForm(prev => ({ ...prev, password: '', confirmPassword: '', resetCode: '' }));
        setGeneratedCode('');
        switchMode('login');
      }, 2000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'Unable to reset password. Please check your reset code or request a new one.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel w-full max-w-md rounded-2xl border border-cyan-500/30 p-7 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Header with CityFlow Brand */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white">
                CITYFLOW <span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400">Secure Urban Mobility Operations</p>
            </div>
          </div>

          {/* Database Live Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border"
            title={dbStatus?.connectedToMongo ? 'Connected to MongoDB' : 'Active resilient datastore (MongoDB fallback)'}
            style={{
              borderColor: dbStatus?.connectedToMongo ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)',
              backgroundColor: dbStatus?.connectedToMongo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.1)',
              color: dbStatus?.connectedToMongo ? '#34d399' : '#38bdf8'
            }}
          >
            <Database className="w-3 h-3" />
            <span>{dbStatus?.connectedToMongo ? 'MongoDB' : 'DB Ready'}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbStatus?.connectedToMongo ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
              }`}
            />
          </div>
        </div>

        {/* ─── Mode 1: LOGIN or SIGNUP ─── */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleLoginOrSignup}>
            {/* Tab Selector */}
            <div className="flex gap-2 mb-5 p-1 bg-[#090e1c] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'signup'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Test Personas (Evaluator 1-Click Fill) */}
            {mode === 'login' && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#090e1c] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> DEMO PERSONAS (1-CLICK FILL)
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">SIH2026</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoUser('citizen@cityflow.ai', 'CityFlow@2026')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-left transition cursor-pointer ${
                      form.email === 'citizen@cityflow.ai'
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" /> Citizen
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Commuter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('special@cityflow.ai', 'CityFlow@2026')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-left transition cursor-pointer ${
                      form.email === 'special@cityflow.ai'
                        ? 'border-rose-400 bg-rose-950/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : 'border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                      <Siren className="w-3 h-3 text-rose-400 animate-pulse" /> Special Case
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Priority SOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('vip@cityflow.ai', 'CityFlow@2026')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-left transition cursor-pointer ${
                      form.email === 'vip@cityflow.ai'
                        ? 'border-purple-400 bg-purple-950/60 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-purple-400" /> VIP Escort
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Security Convoy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('police@cityflow.ai', 'CityFlow@2026')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-left transition cursor-pointer ${
                      form.email === 'police@cityflow.ai'
                        ? 'border-indigo-400 bg-indigo-950/60 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-indigo-400" /> Police
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Traffic Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('logistics@cityflow.ai', 'CityFlow@2026')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-left transition cursor-pointer ${
                      form.email === 'logistics@cityflow.ai'
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_10px_rgba(160,185,129,0.3)]'
                        : 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-emerald-400" /> Logistics
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Fleet Operator</span>
                  </button>
                </div>
              </div>
            )}

            {/* Signup: Full Name */}
            {mode === 'signup' && (
              <label className="block mb-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
                  <UserRound className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                </span>
                <input
                  required
                  placeholder="Officer Rohit Verma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                />
              </label>
            )}

            {/* Email Field */}
            <label className="block mb-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </span>
              <input
                required
                type="email"
                placeholder="name@cityflow.org"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </label>

            {/* Password Field */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> Password
                </span>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" /> Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  maxLength={15}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <div className="mt-2.5">
                  <PasswordStrengthIndicator password={form.password} />
                </div>
              )}
            </div>

            {/* Signup: Role Picker */}
            {mode === 'signup' && (
              <label className="block mb-3 text-xs text-slate-300 mt-3">
                <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
                  <UserRound className="w-3.5 h-3.5 text-cyan-400" /> Access Role
                </span>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                >
                  <option value="USER">Citizen / Commuter</option>
                  <option value="POLICE">Traffic Police / Emergency Hub</option>
                  <option value="LOGISTICS">Logistics & Fleet Operator</option>
                </select>
              </label>
            )}

            {/* Signup: Citizen Profile Category (Normal Citizen vs Emergency Special Case) */}
            {mode === 'signup' && form.role === 'USER' && (
              <div className="mb-3.5">
                <label className="block text-xs text-slate-300 mb-1.5 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Citizen Profile Category
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Select One</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, userType: 'NORMAL' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      form.userType === 'NORMAL'
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" /> Normal Citizen
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">Standard commuter navigation & route optimization</p>
                    </div>
                    {form.userType === 'NORMAL' && (
                      <span className="text-[9px] text-cyan-300 font-mono mt-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, userType: 'EMERGENCY_SPECIAL' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      form.userType === 'EMERGENCY_SPECIAL'
                        ? 'bg-rose-950/70 border-rose-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400'
                        : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        <Siren className="w-3 h-3 text-rose-400 animate-pulse" /> Emergency Special Case
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">Priority corridor & direct police SOS activation panel</p>
                    </div>
                    {form.userType === 'EMERGENCY_SPECIAL' && (
                      <span className="text-[9px] text-rose-300 font-mono mt-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, userType: 'VIP' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      form.userType === 'VIP'
                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400'
                        : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-purple-400" /> VIP Escort
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">Security arterial priority routing & police-only activation</p>
                    </div>
                    {form.userType === 'VIP' && (
                      <span className="text-[9px] text-purple-300 font-mono mt-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Signup: Department Authorization Key for Restricted Roles */}
            {mode === 'signup' && form.role !== 'USER' && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Department Authorization Passkey
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, accessKey: f.role === 'POLICE' ? 'POLICE-DELHI-2026' : 'FLEET-LOGIX-2026' }))}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                  >
                    Auto-Fill Passkey
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  {form.role === 'POLICE' 
                    ? 'Restricted to certified Traffic Police & Emergency dispatch personnel.'
                    : 'Restricted to licensed Commercial Logistics & Freight fleet operators.'}
                </p>
                <input
                  required
                  type="text"
                  placeholder={form.role === 'POLICE' ? 'POLICE-DELHI-2026' : 'FLEET-LOGIX-2026'}
                  value={form.accessKey}
                  onChange={e => setForm({ ...form, accessKey: e.target.value })}
                  className="w-full bg-[#080d1a] border border-amber-500/50 focus:border-amber-400 rounded-lg px-3 py-2 text-sm text-amber-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            )}

            {/* Feedback Alerts */}
            {error && (
              <div className="my-3 flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="my-3 flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              disabled={busy}
              type="submit"
              className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black py-3 text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-[0.99] disabled:opacity-50 transition"
            >
              {busy
                ? 'AUTHENTICATING...'
                : mode === 'login'
                ? 'ENTER CITYFLOW DASHBOARD'
                : 'CREATE OPERATOR ACCOUNT'}
            </button>
          </form>
        )}

        {/* ─── Mode 2: FORGOT PASSWORD ─── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-sm">
              <KeyRound className="w-4 h-4" /> Reset Account Access
            </div>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              Enter the email associated with your CityFlow account. A secure 6-digit verification code will be generated to reset your password.
            </p>

            <label className="block text-xs text-slate-300">
              <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Registered Email Address
              </span>
              <input
                required
                type="email"
                placeholder="name@cityflow.org"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </label>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p>{successMsg}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1">Switching to verification screen...</p>
                </div>
              </div>
            )}

            <button
              disabled={busy}
              type="submit"
              className="w-full mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 text-sm tracking-wide shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
            >
              {busy ? 'GENERATING CODE...' : 'GET RESET CODE'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white py-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        {/* ─── Mode 3: RESET PASSWORD ─── */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Create New Password
            </div>
            <p className="text-xs text-slate-400 mb-1">
              Resetting password for <span className="text-cyan-300 font-mono">{form.email}</span>
            </p>

            {/* Quick Helper Badge if reset code was just generated */}
            {generatedCode && (
              <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-500/40 rounded-lg p-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                  <span>Generated Code:</span>
                  <strong className="text-cyan-400 tracking-wider text-sm">{generatedCode}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, resetCode: generatedCode })}
                  className="text-[11px] text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Auto-Fill
                </button>
              </div>
            )}

            {/* Reset Code Input */}
            <label className="block text-xs text-slate-300">
              <span className="flex items-center gap-1.5 mb-1 text-slate-300 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> 6-Digit Reset Code or Token
              </span>
              <input
                required
                placeholder="e.g. 748291"
                value={form.resetCode}
                onChange={e => setForm({ ...form, resetCode: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg px-3.5 py-2 text-sm text-white font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </label>

            {/* New Password Input */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> New Password (8–15 characters)
                </span>
              </label>
              <div className="relative">
                <input
                  required
                  maxLength={15}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-3.5 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2">
                <PasswordStrengthIndicator password={form.password} />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <LockKeyhole className="w-3.5 h-3.5 text-cyan-400" /> Confirm New Password
                </span>
              </label>
              <div className="relative">
                <input
                  required
                  maxLength={15}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-[#080d1a] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-3.5 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && (
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  {form.password === form.confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Alerts */}
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

            <button
              disabled={busy}
              type="submit"
              className="w-full mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 text-sm tracking-wide shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
            >
              {busy ? 'UPDATING PASSWORD...' : 'RESET PASSWORD & CONTINUE'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white py-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Back to Sign In
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500">
            CityFlow AI · Smart India Hackathon 2026 · PS SIH26205 · NeuralKnights
          </p>
        </div>
      </div>
    </main>
  );
}
