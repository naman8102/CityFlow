import React, { useState } from 'react';
import { Truck, Leaf, Clock, Award, CheckCircle2, RotateCcw, Zap, Plus, X } from 'lucide-react';
import MLAnalyticsCard from '../components/MLAnalyticsCard';
import LogisticsAITrafficBridge from '../components/LogisticsAITrafficBridge';

const CARGO_TYPES = [
  'Cold Storage Food Supplies',
  'E-Commerce Parcel Batches',
  'Industrial Raw Materials',
  'Pharmaceutical Supplies',
  'Construction Equipment',
  'Petroleum Products',
  'Agricultural Produce',
  'Electronics & Appliances',
];

const ROUTES = [
  'Okhla Industrial Area → Azadpur Mandi',
  'Noida Sector 62 → Central Delhi Hub',
  'Gurgaon Industrial Zone → Connaught Place',
  'Faridabad Steel Complex → Naraina Vihar',
  'Greater Noida Logistics Park → Dilli Haat',
];

const PEAK_TIMES = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];
const OFFPEAK_TIMES = ['11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '09:30 PM'];

export default function LogisticsDashboard({
  trips = [],
  aggregateStats,
  onToggleShift,
  onOptimizeSchedule
}) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fleetCompany: 'Apex City Logistics',
    truckId: 'TRK-GAMMA-92',
    cargoType: CARGO_TYPES[0],
    tonnage: 6.0,
    route: ROUTES[0],
    requestedHour: 9,
  });

  const handleSubmitOptimize = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onOptimizeSchedule({
      ...formData,
      tonnage: Number(formData.tonnage),
      requestedHour: Number(formData.requestedHour),
    });
    setIsSubmitting(false);
    setShowForm(false);
  };

  const totalCarbon = trips.filter(t => t.isShifted).reduce((acc, t) => acc + (t.carbonSavedKg || 0), 0);
  const totalDelay = trips.filter(t => t.isShifted).reduce((acc, t) => acc + (t.delaySavedMinutes || 0), 0);
  const shiftedCount = trips.filter(t => t.isShifted).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">Freight & Logistics Coordination</span>
          <h2 className="text-lg font-bold text-white">Commercial Load Shifting & Emissions Optimization</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift commercial deliveries off-peak to earn carbon credits, reduce arterial congestion, and cut idle fuel burn.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add & Optimize Fleet Trip'}
        </button>
      </div>

      {/* Logistics-to-Traffic AI Correlation & Load Shifting Bridge (SIH Feature) */}
      <LogisticsAITrafficBridge />

      {/* ML Prediction & Analytics Telemetry Card */}
      <MLAnalyticsCard selectedTonnage={formData.tonnage} cargoType={formData.cargoType} />

      {/* Add New Trip Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitOptimize}
          className="glass-panel p-4 rounded-xl border border-emerald-500/30 flex flex-col gap-3 animate-in fade-in duration-150"
        >
          <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Schedule New Freight Trip for Off-Peak Shift
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Fleet Company</label>
              <input
                type="text"
                required
                value={formData.fleetCompany}
                onChange={e => setFormData({ ...formData, fleetCompany: e.target.value })}
                className="bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Truck ID</label>
              <input
                type="text"
                required
                value={formData.truckId}
                onChange={e => setFormData({ ...formData, truckId: e.target.value })}
                className="bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Cargo Type</label>
              <select
                value={formData.cargoType}
                onChange={e => setFormData({ ...formData, cargoType: e.target.value })}
                className="bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 appearance-none"
              >
                {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Tonnage (tons)</label>
              <input
                type="number"
                min="1"
                max="40"
                step="0.5"
                required
                value={formData.tonnage}
                onChange={e => setFormData({ ...formData, tonnage: e.target.value })}
                className="bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-slate-400 font-semibold">Route</label>
              <select
                value={formData.route}
                onChange={e => setFormData({ ...formData, route: e.target.value })}
                className="bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 appearance-none"
              >
                {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-slate-400 font-semibold">Requested Departure (Peak Window — to be shifted)</label>
              <div className="flex gap-2">
                {PEAK_TIMES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, requestedHour: parseInt(t) })}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition ${
                      String(formData.requestedHour) === String(parseInt(t))
                        ? 'bg-rose-500/30 border-rose-500/60 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 self-end"
          >
            {isSubmitting ? (
              <><Zap className="w-3.5 h-3.5 animate-spin" /> Computing Optimal Slot...</>
            ) : (
              <><Zap className="w-3.5 h-3.5" /> Optimize & Register Trip</>
            )}
          </button>
        </form>
      )}

      {/* Aggregate KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"><Truck className="w-5 h-5" /></div>
          <div>
            <div className="text-lg font-black text-white">{trips.length}</div>
            <div className="text-[11px] text-slate-400">Tracked Trips</div>
          </div>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><Leaf className="w-5 h-5" /></div>
          <div>
            <div className="text-lg font-black text-emerald-400">
              {(aggregateStats?.totalCarbonSavedKg || totalCarbon || 0).toFixed(1)} <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[11px] text-slate-400">CO₂ Mitigated</div>
          </div>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"><Clock className="w-5 h-5" /></div>
          <div>
            <div className="text-lg font-black text-cyan-400">
              {((aggregateStats?.totalDelaySavedHours) || (totalDelay / 60) || 0).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </div>
            <div className="text-[11px] text-slate-400">Idle Delay Saved</div>
          </div>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30"><Award className="w-5 h-5" /></div>
          <div>
            <div className="text-lg font-black text-amber-400">
              {(aggregateStats?.shiftedTripsCount || shiftedCount) * 150} <span className="text-xs font-normal">pts</span>
            </div>
            <div className="text-[11px] text-slate-400">Green Credits</div>
          </div>
        </div>
      </div>

      {/* Freight Fleet Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" /> Commercial Freight Load Allocation
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">{shiftedCount}/{trips.length} SHIFTED OFF-PEAK</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Truck / Operator</th>
                <th className="py-3 px-4">Cargo & Tonnes</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Requested Slot</th>
                <th className="py-3 px-4">Optimized Slot</th>
                <th className="py-3 px-4">Delay Saved</th>
                <th className="py-3 px-4">CO₂ Offset</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No freight trips yet. Click "Add & Optimize Fleet Trip" or trigger Scenario D above.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{trip.truckId}</div>
                      <div className="text-[11px] text-slate-400">{trip.fleetCompany}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{trip.cargoType}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{trip.tonnage} T</div>
                    </td>
                    <td className="py-3 px-4 max-w-[160px]">
                      <div className="truncate text-slate-300" title={trip.route}>{trip.route}</div>
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-mono whitespace-nowrap">{trip.requestedDeparture}</td>
                    <td className="py-3 px-4 text-emerald-400 font-mono font-semibold whitespace-nowrap">{trip.suggestedDeparture}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">-{trip.delaySavedMinutes} min</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{trip.carbonSavedKg} kg</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleShift(trip._id)}
                        className={`py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 border whitespace-nowrap ${
                          trip.isShifted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        {trip.isShifted
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Shifted</>
                          : <><RotateCcw className="w-3.5 h-3.5" /> Peak</>
                        }
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
