'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { emergencyApi } from '@/lib/api';
import { EmergencyType, EmergencySeverity } from '@/lib/types';
import { emitEmergencyAlert } from '@/lib/socket';

interface Props {
  communityId: string;
  userLat?: number;
  userLng?: number;
}

export default function SOSButton({ communityId, userLat, userLng }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: EmergencyType.OTHER,
    severity: EmergencySeverity.HIGH,
    title: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userLat || !userLng) {
      alert('Location required to activate an emergency. Please allow location access.');
      return;
    }
    setLoading(true);
    try {
      const emergency = await emergencyApi.activate({
        ...form,
        communityId,
        latitude: userLat,
        longitude: userLng,
        radiusKm: 10,
      });
      emitEmergencyAlert(communityId, emergency);
      setIsOpen(false);
      setForm({ type: EmergencyType.OTHER, severity: EmergencySeverity.HIGH, title: '', description: '' });
    } catch (err) {
      alert('Failed to activate emergency. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative group flex items-center gap-3 bg-danger-600 hover:bg-danger-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-danger-500/30 hover:shadow-danger-500/50"
      >
        <span className="absolute inset-0 rounded-2xl bg-danger-500 animate-ping opacity-20 group-hover:opacity-30" />
        <AlertTriangle className="w-6 h-6 relative" />
        <span className="relative text-lg tracking-wide">ACTIVATE SOS</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-navy-900 border border-danger-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-danger-500/20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger-400" />
                <h2 className="text-white font-bold text-lg">Activate Emergency</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-5">
              This will alert your entire community. Only use for real emergencies.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Emergency Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EmergencyType })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  required
                >
                  {Object.values(EmergencyType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as EmergencySeverity })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  required
                >
                  {Object.values(EmergencySeverity).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief description of the emergency"
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Details</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide more details..."
                  rows={3}
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-danger-600 hover:bg-danger-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-base"
              >
                <AlertTriangle className="w-5 h-5" />
                {loading ? 'Activating...' : 'Confirm Emergency Alert'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
