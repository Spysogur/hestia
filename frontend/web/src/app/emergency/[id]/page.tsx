'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ArrowLeft, Zap, Users, Plus, X, TrendingUp, CheckCircle
} from 'lucide-react';
import { useEmergency } from '@/hooks/useEmergencies';
import { useHelpRequests, useHelpOffers } from '@/hooks/useHelp';
import { useAuth } from '@/hooks/useAuth';
import HelpRequestCard from '@/components/HelpRequestCard';
import HelpOfferCard from '@/components/HelpOfferCard';
import MapView from '@/components/MapView';
import { helpApi, emergencyApi } from '@/lib/api';
import {
  EmergencySeverity, EmergencyStatus, HelpRequestType, HelpRequestPriority,
  HelpOfferStatus
} from '@/lib/types';
import { joinEmergencyRoom, getSocket, emitHelpRequest, emitHelpOffer } from '@/lib/socket';
import clsx from 'clsx';

const severityColors: Record<EmergencySeverity, string> = {
  [EmergencySeverity.LOW]: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  [EmergencySeverity.MEDIUM]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  [EmergencySeverity.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [EmergencySeverity.CRITICAL]: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
};

type Tab = 'requests' | 'offers';
type Modal = 'request' | 'offer' | null;

export default function EmergencyPage() {
  const params = useParams();
  const id = params.id as string;
  const { emergency, loading, error } = useEmergency(id);
  const { requests, loading: reqLoading, refetch: refetchReqs } = useHelpRequests(id);
  const { offers, loading: offLoading, refetch: refetchOffers } = useHelpOffers(id);
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('requests');
  const [modal, setModal] = useState<Modal>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [reqForm, setReqForm] = useState({
    type: HelpRequestType.OTHER,
    priority: HelpRequestPriority.MEDIUM,
    title: '',
    description: '',
    numberOfPeople: 1,
  });

  const [offerForm, setOfferForm] = useState({
    type: HelpRequestType.OTHER,
    description: '',
    capacity: 1,
  });

  useEffect(() => {
    if (id) joinEmergencyRoom(id);
  }, [id]);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emergency) return;
    setActionLoading(true);
    try {
      const req = await helpApi.createRequest({
        ...reqForm,
        emergencyId: id,
        latitude: emergency.latitude,
        longitude: emergency.longitude,
      });
      emitHelpRequest(id, req);
      await refetchReqs();
      setModal(null);
      setReqForm({ type: HelpRequestType.OTHER, priority: HelpRequestPriority.MEDIUM, title: '', description: '', numberOfPeople: 1 });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create help request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOfferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emergency) return;
    setActionLoading(true);
    try {
      const offer = await helpApi.createOffer({
        ...offerForm,
        emergencyId: id,
        latitude: emergency.latitude,
        longitude: emergency.longitude,
      });
      emitHelpOffer(id, offer);
      await refetchOffers();
      setModal(null);
      setOfferForm({ type: HelpRequestType.OTHER, description: '', capacity: 1 });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create help offer');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAutoMatch() {
    setAutoMatchLoading(true);
    try {
      const result = await helpApi.autoMatch(id);
      alert(`Auto-matched ${result.matches.length} pairs!`);
      await Promise.all([refetchReqs(), refetchOffers()]);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Auto-match failed');
    } finally {
      setAutoMatchLoading(false);
    }
  }

  async function handleMatch(requestId: string) {
    const availableOffers = offers.filter((o) => o.status === HelpOfferStatus.AVAILABLE);
    if (availableOffers.length === 0) {
      alert('No available offers to match with this request');
      return;
    }
    setMatchLoading(true);
    try {
      await helpApi.match(requestId, availableOffers[0].id);
      await Promise.all([refetchReqs(), refetchOffers()]);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Match failed');
    } finally {
      setMatchLoading(false);
    }
  }

  async function handleResolve() {
    if (!confirm('Mark this emergency as resolved?')) return;
    try {
      await emergencyApi.resolve(id);
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to resolve emergency');
    }
  }

  async function handleEscalate() {
    if (!confirm('Escalate severity of this emergency?')) return;
    try {
      await emergencyApi.escalate(id);
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to escalate emergency');
    }
  }

  const mapPins = emergency
    ? [{ lat: emergency.latitude, lng: emergency.longitude, type: 'emergency' as const, label: emergency.title, severity: emergency.severity, id: emergency.id }]
    : [];

  requests.forEach((r) => {
    mapPins.push({ lat: r.latitude, lng: r.longitude, type: 'hazard' as const, label: r.title, severity: undefined, id: r.id });
  });
  offers.forEach((o) => {
    mapPins.push({ lat: o.latitude, lng: o.longitude, type: 'shelter' as const, label: o.type, severity: undefined, id: o.id });
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-navy-950 flex items-center justify-center">
        <div className="text-gray-400">Loading emergency...</div>
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-400 font-semibold">Emergency not found</p>
          <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 text-sm mt-2 block">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const isActive = emergency.status === EmergencyStatus.ACTIVE;
  const openReqs = requests.filter((r) => r.status === 'OPEN').length;
  const availOffers = offers.filter((o) => o.status === HelpOfferStatus.AVAILABLE).length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Emergency header */}
        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">{emergency.title}</h1>
                <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full border', severityColors[emergency.severity])}>
                  {emergency.severity}
                </span>
                <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', isActive ? 'bg-danger-500/20 text-danger-400' : 'bg-gray-700 text-gray-400')}>
                  {emergency.status}
                </span>
              </div>
              <p className="text-gray-400 max-w-2xl">{emergency.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span>Type: <span className="text-gray-300">{emergency.type}</span></span>
                <span>Radius: <span className="text-gray-300">{emergency.radiusKm}km</span></span>
                <span>Since: <span className="text-gray-300">{new Date(emergency.createdAt).toLocaleDateString()}</span></span>
              </div>
            </div>

            {user && isActive && (
              <div className="flex flex-wrap gap-2">
                <button onClick={handleEscalate} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-all">
                  <TrendingUp className="w-4 h-4" />
                  Escalate
                </button>
                <button onClick={handleResolve} className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-lg text-sm font-medium transition-all">
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Map + Stats */}
          <div className="lg:col-span-2 space-y-6">
            <MapView
              center={[emergency.latitude, emergency.longitude]}
              zoom={12}
              pins={mapPins}
              className="h-72"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open Requests', value: openReqs, color: 'text-orange-400' },
                { label: 'Available Offers', value: availOffers, color: 'text-teal-400' },
                { label: 'Total Requests', value: requests.length, color: 'text-gray-300' },
                { label: 'Total Offers', value: offers.length, color: 'text-gray-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-navy-800 border border-navy-700 rounded-xl p-4">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-gray-400 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Auto-match */}
            {user && isActive && (
              <button
                onClick={handleAutoMatch}
                disabled={autoMatchLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                <Zap className="w-5 h-5" />
                {autoMatchLoading ? 'Matching...' : 'Auto-Match All'}
              </button>
            )}
          </div>

          {/* Right: Requests/Offers board */}
          <div className="lg:col-span-3">
            {/* Tab bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 bg-navy-800 border border-navy-700 rounded-xl p-1">
                {(['requests', 'offers'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                      tab === t ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Help {t} ({t === 'requests' ? requests.length : offers.length})
                  </button>
                ))}
              </div>

              {user && isActive && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal('request')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Need Help
                  </button>
                  <button
                    onClick={() => setModal('offer')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Offer Help
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            {tab === 'requests' && (
              <div>
                {reqLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-navy-800 border border-navy-700 rounded-xl animate-pulse" />)}
                  </div>
                ) : requests.length === 0 ? (
                  <div className="bg-navy-800 border border-navy-700 rounded-xl p-10 text-center">
                    <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-white font-semibold">No help requests</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to request or offer help</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((r) => (
                      <HelpRequestCard
                        key={r.id}
                        request={r}
                        showMatchButton={!!user && isActive}
                        onMatch={handleMatch}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'offers' && (
              <div>
                {offLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-navy-800 border border-navy-700 rounded-xl animate-pulse" />)}
                  </div>
                ) : offers.length === 0 ? (
                  <div className="bg-navy-800 border border-navy-700 rounded-xl p-10 text-center">
                    <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-white font-semibold">No help offers</p>
                    <p className="text-gray-400 text-sm mt-1">Volunteers can offer help here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offers.map((o) => (
                      <HelpOfferCard key={o.id} offer={o} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Request Modal */}
      {modal === 'request' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Request Help</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Type</label>
                <select value={reqForm.type} onChange={(e) => setReqForm({ ...reqForm, type: e.target.value as HelpRequestType })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  {Object.values(HelpRequestType).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Priority</label>
                <select value={reqForm.priority} onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value as HelpRequestPriority })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  {Object.values(HelpRequestPriority).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Title</label>
                <input type="text" value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
                  placeholder="Need evacuation assistance" required
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Description</label>
                <textarea value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                  placeholder="Describe what you need..." rows={3} required
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Number of People</label>
                <input type="number" min="1" value={reqForm.numberOfPeople} onChange={(e) => setReqForm({ ...reqForm, numberOfPeople: parseInt(e.target.value) })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <button type="submit" disabled={actionLoading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Help Offer Modal */}
      {modal === 'offer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Offer Help</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Type of Help</label>
                <select value={offerForm.type} onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value as HelpRequestType })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  {Object.values(HelpRequestType).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Description</label>
                <textarea value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Describe what you can offer..." rows={3} required
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Capacity</label>
                <input type="number" min="1" value={offerForm.capacity} onChange={(e) => setOfferForm({ ...offerForm, capacity: parseInt(e.target.value) })}
                  className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <button type="submit" disabled={actionLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {actionLoading ? 'Submitting...' : 'Submit Offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
