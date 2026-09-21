import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Train, 
  Car, 
  Truck, 
  Siren, 
  X, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  Zap,
  Users,
  Activity,
  Layers,
  RotateCcw
} from 'lucide-react';
import { cityFlowAPI } from '../services/api';

const CORRIDORS = [
  { id: 'sector-62', name: 'Sector-62 ↔ Electronic City Metro' },
  { id: 'ring-road', name: 'Ring Road Trunk (Moolchand ↔ Ashram)' },
  { id: 'connaught-place', name: 'Connaught Place Radial Hub' }
];

export default function PublicTransportModal({ isOpen, onClose }) {
  const [selectedCorridor, setSelectedCorridor] = useState('sector-62');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActuating, setIsActuating] = useState(false);
  const [actuationResult, setActuationResult] = useState(null);

  const fetchTransitData = async (corridorId) => {
    setLoading(true);
    try {
      const res = await cityFlowAPI.getPublicTransport(corridorId);
      setData(res);
      if (res?.isAugmented) {
        setActuationResult({
          busesAdded: 4,
          newIntervalMinutes: 6,
          oldIntervalMinutes: 10,
          roadCongestionBefore: 84,
          roadCongestionAfter: 68
        });
      } else {
        setActuationResult(null);
      }
    } catch (err) {
      console.error('Failed to load transit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransitData(selectedCorridor);
    }
  }, [isOpen, selectedCorridor]);

  const handleApplyAugmentation = async () => {
    setIsActuating(true);
    try {
      const res = await cityFlowAPI.applyTransitAugmentation(selectedCorridor);
      setActuationResult(res);
      await fetchTransitData(selectedCorridor);
    } catch (err) {
      console.error('Failed to apply transit augmentation:', err);
    } finally {
      setIsActuating(false);
    }
  };

  if (!isOpen) return null;

  const getLayerIcon = (id) => {
    switch (id) {
      case 'metro': return <Train className="w-4 h-4 text-blue-400" />;
      case 'bus': return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'auto': return <Car className="w-4 h-4 text-amber-400" />;
      case 'private': return <Users className="w-4 h-4 text-rose-400" />;
      case 'freight': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'emergency': return <Siren className="w-4 h-4 text-cyan-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl p-5 sm:p-6 rounded-2xl border border-emerald-500/50 bg-[#090d1c] shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Bus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Public Transport Integration Layer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Multimodal Resource Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic Mode Balancing: Metro · Bus · Auto · Private · Freight · Emergency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corridor Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CORRIDORS.map(corridor => (
            <button
              key={corridor.id}
              onClick={() => setSelectedCorridor(corridor.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCorridor === corridor.id
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {corridor.name}
            </button>
          ))}
        </div>

        {/* 6 Multimodal Mode Split Visualizer */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              6 Urban Multimodal Layers (Mode Share Split)
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              City-Wide Resource Orchestration
            </span>
          </div>

          {/* Proportional Mode Split Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 shadow-inner">
            {data?.modalLayers?.map((layer) => (
              <div 
                key={layer.id}
                style={{ 
                  width: `${layer.modeSharePercent}%`,
                  backgroundColor: layer.color 
                }}
                className="h-full relative group transition-all duration-300"
                title={`${layer.name}: ${layer.modeSharePercent}%`}
              />
            ))}
          </div>

          {/* 6 Dimension Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {data?.modalLayers?.map((layer) => (
              <div 
                key={layer.id}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getLayerIcon(layer.id)}
                    <span className="text-[11px] font-bold text-slate-200 truncate">{layer.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-black" style={{ color: layer.color }}>
                    {layer.modeSharePercent}%
                  </span>
                </div>
                <div className="text-xs font-mono text-white font-black mt-1">
                  {layer.activeVehicles.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  {layer.unit}
                </div>
                <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500">Load:</span>
                  <span className={layer.capacityLoadPercent > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {layer.capacityLoadPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Dynamic Recommendation Engine Showcase (User's Exact Benchmark) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Panel: High Road Congestion & Surge Detection */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-900/60 border border-amber-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Road Congestion Alert
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse">
                  HIGH SURGE
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                Road Congestion High → Expected Transit Demand Surge
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Arterial traffic congestion on {data?.corridorName || 'Sector-62'} has reached <span className="text-rose-400 font-mono font-bold">{data?.arterialCongestion || 84}%</span>. Commuter modal shift toward public transit is expanding rapidly.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Expected Demand Surge</span>
                <span className="text-2xl font-mono font-black text-amber-300 tracking-tight">
                  +{data?.expectedDemandDeltaPercent || 34}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Corridor Congestion</span>
                <span className="text-lg font-mono font-bold text-rose-400">
                  {data?.arterialCongestion || 84}% SATURATED
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-amber-300 font-bold">AI Detection:</span> Unmanaged demand will trigger 18-minute bus stop platform dwell queues and force commuters into private vehicles.
            </div>
          </div>

          {/* Right Panel: AI Recommendation & Dispatch Plan */}
          <div className="lg:col-span-7 p-4 rounded-xl bg-gradient-to-b from-emerald-950/20 to-slate-900/60 border border-emerald-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  AI Dynamic Frequency Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Automated Fleet Dispatch
                </span>
              </div>
              
              {/* Benchmark Numbers Highlighted */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Fleet Augmentation</span>
                  <div className="text-2xl font-mono font-black text-emerald-300 flex items-center gap-2 mt-0.5">
                    <span>+4 Buses</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({data?.fleetStatus?.activeBuses || 12} Total)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Low-Floor Electric Fleet</span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Peak Interval Compression</span>
                  <div className="text-2xl font-mono font-black text-cyan-300 flex items-center gap-1.5 mt-0.5">
                    <span className="line-through text-slate-500 text-lg">10 min</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>6 min</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 mt-1 block">-40% Headway Wait Time</span>
                </div>
              </div>

              {/* 4 Actionable Checklist Items */}
              <div className="flex flex-col gap-1.5 mt-3">
                {data?.aiRecommendation?.actions?.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-slate-950/50 border border-slate-800/80">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                      actuationResult || data?.isAugmented ? 'text-emerald-400' : 'text-slate-500'
                    }`} />
                    <span className="font-bold text-white">{act.label}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">— {act.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected City-Wide Impact */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Throughput</span>
                <span className="text-xs font-mono font-bold text-emerald-300">+3,850 pax/hr</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Road Congestion</span>
                <span className="text-xs font-mono font-bold text-rose-300">↓ 15.2% Relieved</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Private Mode Shift</span>
                <span className="text-xs font-mono font-bold text-cyan-300">-19% Private Trips</span>
              </div>
            </div>

            {/* Actuation Button */}
            <button
              onClick={handleApplyAugmentation}
              disabled={isActuating || data?.isAugmented}
              className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95 ${
                data?.isAugmented
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.35)]'
              }`}
            >
              {isActuating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Dispatching Electric Fleet (+4 Buses)...</span>
                </>
              ) : data?.isAugmented ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Transit Augmentation Active · Interval 6 min</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ Dispatch AI Transit Augmentation (+4 Buses)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Banner when Actuated */}
        {(actuationResult || data?.isAugmented) && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="font-bold text-white block">
                  ✓ Autonomous Fleet Dispatch Completed: +4 Buses Deployed to Route
                </strong>
                <span className="text-[11px] text-emerald-300/90">
                  Peak headway compressed from 10 min → 6 min · Metro feeder gates synced · Corridor congestion dropped 84% → 68%
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-500/40 shrink-0">
              Corridor Relieved (68%)
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
