'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, MapPin, Activity, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunities';
import { useEmergencies } from '@/hooks/useEmergencies';
import { useAuth } from '@/hooks/useAuth';
import EmergencyCard from '@/components/EmergencyCard';
import MapView from '@/components/MapView';
import { communityApi } from '@/lib/api';
import { EmergencySeverity } from '@/lib/types';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { community, loading, error } = useCommunity(id);
  const { emergencies, loading: emergLoading } = useEmergencies(id);
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    if (!user) { window.location.href = '/login'; return; }
    setJoining(true);
    try {
      await communityApi.join(id);
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to join community');
    } finally {
      setJoining(false);
    }
  }

  const mapPins = emergencies.map((e) => ({
    lat: e.latitude,
    lng: e.longitude,
    type: 'emergency' as const,
    label: e.title,
    severity: e.severity,
    id: e.id,
  }));

  if (community) {
    mapPins.push({
      lat: community.latitude,
      lng: community.longitude,
      type: 'shelter' as const,
      label: `${community.name} (center)`,
      severity: EmergencySeverity.LOW,
      id: community.id,
    });
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-navy-950 flex items-center justify-center">
        <div className="text-gray-400">Loading community...</div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-400 font-semibold">Community not found</p>
          <Link href="/communities" className="text-orange-400 hover:text-orange-300 text-sm mt-2 block">
            Back to communities
          </Link>
        </div>
      </div>
    );
  }

  const isMember = user?.communityId === id;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link href="/communities" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{community.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${community.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-700 text-gray-400'}`}>
                {community.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {community.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              {community.region}, {community.country}
            </div>
            <p className="text-gray-400 mt-3 max-w-2xl">{community.description}</p>
          </div>

          {!isMember && user && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex-shrink-0 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {joining ? 'Joining...' : 'Join Community'}
            </button>
          )}
          {isMember && (
            <span className="flex-shrink-0 px-4 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              You're a member
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Members', value: community.memberCount, icon: Users },
            { label: 'Coverage', value: `${community.radiusKm}km`, icon: MapPin },
            { label: 'Active Emergencies', value: emergencies.length, icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-navy-800 border border-navy-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-orange-400" />
                <span className="text-gray-400 text-xs">{label}</span>
              </div>
              <div className="text-xl font-bold text-white">{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <h2 className="text-white font-semibold text-lg mb-4">Community Map</h2>
            <MapView
              center={[community.latitude, community.longitude]}
              zoom={10}
              pins={mapPins}
              className="h-96"
            />
          </div>

          {/* Emergencies */}
          <div className="lg:col-span-2">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-danger-400" />
              Active Emergencies
            </h2>
            {emergLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-28 bg-navy-800 border border-navy-700 rounded-xl animate-pulse" />)}
              </div>
            ) : emergencies.length === 0 ? (
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-8 text-center">
                <Activity className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">All clear</p>
                <p className="text-gray-400 text-xs mt-1">No active emergencies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencies.map((e) => <EmergencyCard key={e.id} emergency={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
