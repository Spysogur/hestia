'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Users, Map, Activity, TrendingUp, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEmergencies } from '@/hooks/useEmergencies';
import { useCommunities } from '@/hooks/useCommunities';
import EmergencyCard from '@/components/EmergencyCard';
import SOSButton from '@/components/SOSButton';
import { connectSocket, joinCommunityRoom } from '@/lib/socket';
import { EmergencySeverity } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { emergencies, loading: emergLoading } = useEmergencies(user?.communityId ?? undefined);
  const { communities, loading: commLoading } = useCommunities();
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();

  const userCommunity = communities.find((c) => c.id === user?.communityId);

  useEffect(() => {
    if (user) {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      connectSocket(token);
      if (user.communityId) {
        joinCommunityRoom(user.communityId);
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, []);

  const criticalCount = emergencies.filter((e) => e.severity === EmergencySeverity.CRITICAL).length;
  const activeCount = emergencies.length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user ? `Welcome, ${user.fullName.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {userCommunity
                ? `Community: ${userCommunity.name}`
                : 'You are not part of a community yet'}
            </p>
          </div>

          {user?.communityId && (
            <SOSButton
              communityId={user.communityId}
              userLat={userLat}
              userLng={userLng}
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Active Emergencies',
              value: emergLoading ? '—' : activeCount,
              icon: AlertTriangle,
              className: activeCount > 0 ? 'text-danger-400 bg-danger-500/10' : 'text-gray-400 bg-gray-700/30',
            },
            {
              label: 'Critical Alerts',
              value: emergLoading ? '—' : criticalCount,
              icon: Bell,
              className: criticalCount > 0 ? 'text-danger-400 bg-danger-500/10' : 'text-gray-400 bg-gray-700/30',
            },
            {
              label: 'Communities',
              value: commLoading ? '—' : communities.length,
              icon: Users,
              className: 'text-teal-400 bg-teal-500/10',
            },
            {
              label: 'Your Role',
              value: user?.role ?? '—',
              icon: Shield,
              className: 'text-orange-400 bg-orange-500/10',
            },
          ].map(({ label, value, icon: Icon, className }) => (
            <div key={label} className="bg-navy-800 border border-navy-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${className}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{String(value)}</div>
            </div>
          ))}
        </div>

        {/* No community prompt */}
        {user && !user.communityId && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Join a community</h3>
              <p className="text-gray-400 text-sm mt-0.5">
                You're not part of any community yet. Join one to receive emergency alerts and coordinate with neighbors.
              </p>
            </div>
            <Link
              href="/communities"
              className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Browse Communities
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergencies */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-danger-400" />
                Active Emergencies
              </h2>
              <Link href="/map" className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1">
                <Map className="w-4 h-4" />
                View Map
              </Link>
            </div>

            {emergLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-navy-800 border border-navy-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : emergencies.length === 0 ? (
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-10 text-center">
                <Shield className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                <p className="text-white font-semibold">All clear</p>
                <p className="text-gray-400 text-sm mt-1">No active emergencies in your area</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencies.map((e) => (
                  <EmergencyCard key={e.id} emergency={e} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/communities" className="flex items-center gap-3 bg-navy-800 border border-navy-700 hover:border-navy-600 rounded-xl p-4 transition-all group">
                  <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Browse Communities</p>
                    <p className="text-gray-500 text-xs">Find your neighborhood</p>
                  </div>
                </Link>
                <Link href="/map" className="flex items-center gap-3 bg-navy-800 border border-navy-700 hover:border-navy-600 rounded-xl p-4 transition-all group">
                  <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Map className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Live Map</p>
                    <p className="text-gray-500 text-xs">See real-time situation</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Nearby communities */}
            {communities.length > 0 && (
              <div>
                <h2 className="text-white font-semibold text-lg mb-4">Communities</h2>
                <div className="space-y-2">
                  {communities.slice(0, 4).map((c) => (
                    <Link
                      key={c.id}
                      href={`/communities/${c.id}`}
                      className="flex items-center justify-between bg-navy-800 border border-navy-700 hover:border-navy-600 rounded-xl p-3 transition-all"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{c.name}</p>
                        <p className="text-gray-500 text-xs">{c.memberCount} members</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-700 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
