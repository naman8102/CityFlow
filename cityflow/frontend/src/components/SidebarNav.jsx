import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Radio, 
  Siren, 
  Truck, 
  ShieldAlert, 
  Sliders, 
  Zap,
  Activity,
  ChevronRight,
  Crown
} from 'lucide-react';

export default function SidebarNav({
  activeTab = 'dashboard',
  onSelectTab,
  metrics = {},
  emergencyCount = 0,
  riskPercent = 61,
  signalsCount = 126
}) {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'traffic', 
      label: 'Traffic', 
      icon: Car,
      badge: `${metrics.cityCongestionIndex || 72}%` 
    },
    { 
      id: 'signals', 
      label: 'Signals', 
      icon: Radio,
      badge: `${signalsCount || 126}` 
    },
    { 
      id: 'emergency', 
      label: 'Emergency', 
      icon: Siren,
      badge: emergencyCount > 0 ? `${emergencyCount} SOS` : null,
      badgeColor: 'rose'
    },
    { 
      id: 'logistics', 
      label: 'Logistics', 
      icon: Truck,
      badge: 'Shift AI' 
    },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      icon: ShieldAlert,
      badge: `${riskPercent}% Risk`,
      badgeColor: 'amber'
    },
    { 
      id: 'simulation', 
      label: 'Simulation', 
      icon: Sliders,
      badge: 'Twin' 
    },
    { 
      id: 'ai-actions', 
      label: 'AI Actions', 
      icon: Zap, 
      badge: 'Auto' 
    },
    { 
      id: 'vip-sos', 
      label: 'VIP SOS', 
      icon: Crown, 
      badge: 'Protocol',
      badgeColor: 'purple'
    }
  ];

  return (
    <aside className="w-56 sm:w-60 bg-[#090d1c] border-r border-slate-800/90 flex flex-col justify-between py-4 px-3 select-none shrink-0 h-full">
      <div className="flex flex-col gap-1.5">
        <div className="px-3 pb-3 mb-1 border-b border-slate-800/80">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Command Navigation
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isVip = item.id === 'vip-sos';

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab && onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-150 cursor-pointer group relative ${
                isActive
                  ? isVip
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : isVip
                  ? 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive
                    ? isVip ? 'text-purple-400' : 'text-cyan-400'
                    : isVip ? 'text-purple-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    item.badgeColor === 'purple'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse'
                      : item.badgeColor === 'rose'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-cyan-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isVip ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]' : 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                  }`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Status Box */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 uppercase text-[9px]">City Core</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            ONLINE
          </span>
        </div>
        <div className="text-slate-300 font-bold truncate">
          AI Agent Orchestrator
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          SIH26205 · v2.4 Live
        </div>
      </div>
    </aside>
  );
}
