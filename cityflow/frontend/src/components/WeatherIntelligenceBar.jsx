import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Sun, CloudFog, CloudLightning, Wind, Activity, 
  ArrowRight, ShieldAlert, Clock, Gauge, ChevronRight, Sparkles, Check
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

export default function WeatherIntelligenceBar({ onWeatherChange }) {
  const [activeWeather, setActiveWeather] = useState('CLEAR');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (condition) => {
    setLoading(true);
    try {
      let res;
      if (condition) {
        res = await cityFlowAPI.setWeatherIntelligence(condition);
      } else {
        res = await cityFlowAPI.getWeatherIntelligence();
      }
      setWeatherData(res);
      setActiveWeather(res.condition);
      if (onWeatherChange) onWeatherChange(res);
    } catch (err) {
      console.error('Weather intelligence error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSelectCondition = (cond) => {
    setActiveWeather(cond);
    fetchWeather(cond);
  };

  const current = weatherData || {
    condition: 'CLEAR',
    precipitationProbability: 10,
    averageSpeedKmph: 42,
    expectedTrafficImpactPercent: 0,
    effectiveCapacityVPH: 1800,
    signalClearanceSeconds: 4.0,
    logisticsWarning: 'Optimal conditions. Standard schedules maintained.',
    emergencyETABufferMinutes: 0.0,
    causalChain: {
      step1_weather: 'Normal Weather Detected (10% Precipitation)',
      step2_trafficPrediction: 'Nominal traffic flow. Average speed 42 km/h.',
      step3_signalDecision: 'Standard 4.0s yellow clearance cycle maintained.',
      step4_routeDecision: 'Direct primary arterials operating without weather impedance penalties.'
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 bg-[#090e1f]/90 shadow-xl relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/3 w-1/3 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm" />

      {/* Header & Condition Selector Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            {current.condition === 'RAIN' ? <CloudRain className="w-5 h-5 text-blue-400 animate-bounce" /> :
             current.condition === 'FOG' ? <CloudFog className="w-5 h-5 text-slate-300 animate-pulse" /> :
             current.condition === 'STORM' ? <CloudLightning className="w-5 h-5 text-amber-400 animate-pulse" /> :
             <Sun className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Causal Weather Intelligence
              </span>
              <span className="text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                Active Prediction Input
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
              Weather → Traffic Prediction → Signal Decision → Route Decision
            </h3>
          </div>
        </div>

        {/* 4 Interactive Condition Buttons for Judges */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => handleSelectCondition('CLEAR')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeWeather === 'CLEAR'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Normal (42 km/h)</span>
          </button>

          <button
            onClick={() => handleSelectCondition('RAIN')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeWeather === 'RAIN'
                ? 'bg-blue-500/30 text-blue-200 border border-blue-400/70 shadow-[0_0_20px_rgba(59,130,246,0.35)] animate-pulse'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Heavy Rain (78% · 27 km/h)</span>
          </button>

          <button
            onClick={() => handleSelectCondition('FOG')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeWeather === 'FOG'
                ? 'bg-slate-700/50 text-slate-200 border border-slate-500/60 shadow-[0_0_15px_rgba(148,163,184,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5" />
            <span>Winter Fog (31 km/h)</span>
          </button>

          <button
            onClick={() => handleSelectCondition('STORM')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeWeather === 'STORM'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>Storm (22 km/h)</span>
          </button>
        </div>
      </div>

      {/* 4-Step Causal Chain Flow Graphic */}
      <div className="py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          
          {/* Step 1: Weather Detection */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold text-cyan-400">1. WEATHER DETECTION</span>
              <span className="text-[10px]">{current.precipitationProbability}% Prob</span>
            </div>
            <div className="font-bold text-white text-xs truncate">
              {current.causalChain?.step1_weather || `${current.name}`}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Condition: <b className="text-cyan-300">{current.name}</b>
            </div>
          </div>

          {/* Step 2: Traffic Prediction Impact */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold text-amber-400">2. TRAFFIC PREDICTION</span>
              <span className="text-[10px] text-amber-400 font-bold">+{current.expectedTrafficImpactPercent}% Impact</span>
            </div>
            <div className="font-bold text-white text-xs">
              Speed: <span className={current.averageSpeedKmph < 30 ? 'text-rose-400' : 'text-emerald-400'}>{current.averageSpeedKmph} km/h</span>
              <span className="text-[10px] text-slate-400 ml-1">(Baseline: 42)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Road Capacity: <b className="text-slate-200">{current.effectiveCapacityVPH} vph</b> (-{Math.round((1 - current.effectiveCapacityVPH/1800)*100)}%)
            </div>
          </div>

          {/* Step 3: Signal Decision */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold text-emerald-400">3. SIGNAL DECISION</span>
              <span className="text-[10px] text-emerald-300 font-bold">Clearance Actuated</span>
            </div>
            <div className="font-bold text-white text-xs">
              Clearance Time: <span className="text-emerald-400 font-bold">{current.signalClearanceSeconds}s</span>
              <span className="text-[10px] text-slate-400 ml-1">(+{(current.signalClearanceSeconds - 4.0).toFixed(1)}s safe)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Braking Distance Buffer: <b className="text-emerald-300">+35% Wet Tarmac</b>
            </div>
          </div>

          {/* Step 4: Route Decision */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold text-purple-400">4. ROUTE DECISION</span>
              <span className="text-[10px] text-purple-300 font-bold">Bypass Active</span>
            </div>
            <div className="font-bold text-white text-xs truncate">
              {current.condition === 'RAIN' ? 'Bypass Minto Bridge Underpass' : 'Standard Arterials Clear'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              Logistics Warned · SOS ETA Recalculated
            </div>
          </div>

        </div>
      </div>

      {/* Logistics & Emergency Action Banner */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2 text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${current.condition === 'RAIN' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="truncate max-w-xl">{current.logisticsWarning}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Emergency ETA Buffer: <b className="text-cyan-300">+{current.emergencyETABufferMinutes} min</b></span>
        </div>
      </div>
    </div>
  );
}
