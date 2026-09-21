import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Send } from 'lucide-react';

export default function IncidentReporterModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'CONGESTION',
    severity: 'MEDIUM',
    address: 'Connaught Place Radial Arterial',
    lat: 28.6328,
    lng: 77.2197
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      title: formData.title || 'Road Obstruction Alert',
      type: formData.type,
      severity: formData.severity,
      location: {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        address: formData.address
      }
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-cyan-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-cyan-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Broadcast Road Incident</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Incident Headline</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Broken Down Heavy Vehicle, Waterlogging"
              className="w-full bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="CONGESTION">Heavy Congestion</option>
                <option value="ACCIDENT">Accident / Collision</option>
                <option value="CONSTRUCTION">Roadwork / Hazard</option>
                <option value="HAZARD">Waterlogging / Blockage</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Severity</label>
              <select 
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="LOW">Low (Slowdown)</option>
                <option value="MEDIUM">Medium (Single Lane)</option>
                <option value="HIGH">High (Major Jam)</option>
                <option value="CRITICAL">Critical (Total Block)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Address / Landmark</label>
            <div className="relative">
              <input 
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#080d1a] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Broadcasting...' : 'Broadcast to City Mesh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
