import React from 'react';
import { AlertCircle, Route, Siren, Truck, Sparkles, Lock } from 'lucide-react';

export default function ScenarioSwitcher({ activeScenario, onSelectScenario, userRole = 'USER', loading }) {
  const scenarios = [
    {
      id: 'A',
      name: 'Scenario A',
      label: 'Peak Hour Hotspot',
      icon: AlertCircle,
      tag: 'Predict & Detect',
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40',
      activeColor: 'border-amber-500 bg-amber-950/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-amber-300',
      description: 'Ingest traffic surge, detect arterial bottleneck, trigger automated signal cycle alert.'
    },
    {
      id: 'B',
      name: 'Scenario B',
      label: 'Smart Alternative Routing',
      icon: Route,
      tag: 'BPR Optimization',
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40',
      activeColor: 'border-cyan-500 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-300',
      description: 'Dynamic comparative routing balancing delay, safety risk index, and carbon footprint.'
    },
    {
      id: 'C',
      name: 'Scenario C',
      label: 'Emergency Vehicle SOS',
      icon: Siren,
      tag: 'Green Wave Preemption',
      requiredRole: 'POLICE',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40',
      activeColor: 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-300',
      description: 'Instant ambulance dispatch with automated green corridor preemption across all intersections.'
    },
    {
      id: 'D',
      name: 'Scenario D',
      label: 'Logistics Load Shifting',
      icon: Truck,
      tag: 'Demand Scheduling',
      requiredRole: 'LOGISTICS',
      color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40',
      activeColor: 'border-indigo-500 bg-indigo-950/60 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-indigo-300',
      description: 'Shift commercial freight from peak hours to off-peak slots with incentive carbon credits.'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            SIH 2026 Test Scenarios (Problem SIH26205)
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          TEAM NEURALKNIGHTS
        </span>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          const isRestricted = sc.requiredRole && sc.requiredRole !== userRole;

          return (
            <button
              key={sc.id}
              disabled={loading}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 active:scale-95 ${
                isActive ? sc.activeColor : sc.color
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80 flex items-center gap-1.5">
                  {sc.name}
                  {isRestricted && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                      <Lock className="w-2 h-2" /> {sc.requiredRole}
                    </span>
                  )}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
              </div>

              <div>
                <h4 className="font-bold text-xs text-white leading-tight">{sc.label}</h4>
                <p className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {sc.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 text-[9px] font-mono uppercase tracking-wider opacity-70">
                {sc.tag}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
