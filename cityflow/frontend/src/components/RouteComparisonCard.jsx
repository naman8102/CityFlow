import React from 'react';
import { Clock, ShieldCheck, Leaf, Fuel, ArrowRight, Sparkles, AlertOctagon } from 'lucide-react';

export default function RouteComparisonCard({ routes, onSelectRoute, selectedRouteId }) {
  if (!routes) return null;

  const { conventionalRoute, aiOptimizedRoute } = routes;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Multi-Route Trade-off Analysis (Scenario B)
        </h3>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          BPR MODEL: ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conventional Congested Corridor */}
        <div 
          onClick={() => onSelectRoute && onSelectRoute(conventionalRoute.id)}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedRouteId === conventionalRoute.id 
              ? 'bg-red-950/20 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Conventional Route
            </span>
            <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50">
              LOS: {conventionalRoute.levelOfService || 'F'}
            </span>
          </div>

          <div className="text-2xl font-black text-white mb-1">
            {conventionalRoute.estimatedTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-red-400 font-mono mb-3">
            +{conventionalRoute.delayMinutes} min congestion delay
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3 text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{conventionalRoute.distanceKm} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Safety: {conventionalRoute.safetyIndex}/100</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-slate-500" />
              <span>{conventionalRoute.co2EmissionsKg} kg CO₂</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-slate-500" />
              <span>V/C: {conventionalRoute.volumeCapacityRatio || '1.25'}</span>
            </div>
          </div>
        </div>

        {/* CityFlow AI Coordinated Corridor */}
        <div 
          onClick={() => onSelectRoute && onSelectRoute(aiOptimizedRoute.id)}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            (selectedRouteId === aiOptimizedRoute.id || selectedRouteId === 'route-cityflow-ai') 
              ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
              : 'glass-panel border-cyan-500/30 hover:border-cyan-500/60'
          }`}
        >
          <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
            Recommended
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> CityFlow Coordinated
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              LOS: {aiOptimizedRoute.levelOfService || 'B'}
            </span>
          </div>

          <div className="text-2xl font-black text-cyan-400 mb-1">
            {aiOptimizedRoute.estimatedTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-emerald-400 font-mono mb-3 flex items-center gap-1 font-bold">
            ⚡ Save {aiOptimizedRoute.timeSavedMinutes} minutes travel time
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3 text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{aiOptimizedRoute.distanceKm} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safety: {aiOptimizedRoute.safetyIndex}/100</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>{aiOptimizedRoute.co2EmissionsKg} kg CO₂</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
              <span>V/C: {aiOptimizedRoute.volumeCapacityRatio || '0.62'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
