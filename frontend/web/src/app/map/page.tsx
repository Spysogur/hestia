'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, X, Layers } from 'lucide-react';
import { useEmergencies } from '@/hooks/useEmergencies';
import { useCommunities } from '@/hooks/useCommunities';
import MapView from '@/components/MapView';
import { EmergencySeverity, EmergencyStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type FilterSeverity = EmergencySeverity | 'ALL';

export default function MapPage() {
  const { emergencies, loading: emergLoading } = useEmergencies();
  const { communities, loading: commLoading } = useCommunities();
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('ALL');
  const [showCommunities, setShowCommunities] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const filteredEmergencies = emergencies.filter((e) => {
    if (e.status !== EmergencyStatus.ACTIVE) return false;
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    return true;
  });

  const emergencyPins = showEmergencies
    ? filteredEmergencies.map((e) => ({
        lat: e.latitude,
        lng: e.longitude,
        type: 'emergency' as const,
        label: `${e.title} (${e.severity})`,
        severity: e.severity,
        id: e.id,
      }))
    : [];

  const communityPins = showCommunities
    ? communities.map((c) => ({
        lat: c.latitude,
        lng: c.longitude,
        type: 'shelter' as const,
        label: `${c.name} (${c.memberCount} members)`,
        severity: undefined,
        id: c.id,
      }))
    : [];

  const allPins = [...emergencyPins, ...communityPins];

  const criticalCount = filteredEmergencies.filter((e) => e.severity === EmergencySeverity.CRITICAL).length;

  return (
    <div className="h-[calc(100vh-64px)] bg-navy-950 flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-navy-900 border-b border-navy-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-bold text-lg">Live Situation Map</h1>
            {(emergLoading || commLoading) && (
              <span className="text-gray-400 text-sm animate-pulse">Loading...</span>
            )}
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-danger-500/20 text-danger-400 border border-danger-500/30 px-2.5 py-1 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 bg-danger-400 rounded-full" />
                {criticalCount} critical
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-danger-500" /> Emergency
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-teal-500" /> Community
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                showFilters
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-navy-800 border-navy-600 text-gray-300 hover:border-navy-500'
              )}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-navy-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-medium">Severity:</span>
              {(['ALL', ...Object.values(EmergencySeverity)] as FilterSeverity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                    filterSeverity === s
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                      : 'bg-navy-800 border-navy-600 text-gray-400 hover:border-navy-500'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-medium">Layers:</span>
              <button
                onClick={() => setShowEmergencies(!showEmergencies)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                  showEmergencies
                    ? 'bg-danger-500/20 border-danger-500/40 text-danger-400'
                    : 'bg-navy-800 border-navy-600 text-gray-400'
                )}
              >
                Emergencies
              </button>
              <button
                onClick={() => setShowCommunities(!showCommunities)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                  showCommunities
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                    : 'bg-navy-800 border-navy-600 text-gray-400'
                )}
              >
                Communities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={[20, 0]}
          zoom={2}
          pins={allPins}
          className="h-full rounded-none"
          onEmergencyClick={(id) => router.push(`/emergency/${id}`)}
        />

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-[400]">
          <div className="bg-navy-900/90 backdrop-blur-sm border border-navy-700 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">Active Emergencies</div>
            <div className="text-2xl font-bold text-danger-400">{filteredEmergencies.length}</div>
          </div>
          <div className="bg-navy-900/90 backdrop-blur-sm border border-navy-700 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">Communities</div>
            <div className="text-2xl font-bold text-teal-400">{communities.length}</div>
          </div>
        </div>

        {/* Emergency list sidebar */}
        {filteredEmergencies.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[400] max-w-xs w-full space-y-2 max-h-60 overflow-y-auto">
            {filteredEmergencies.slice(0, 5).map((e) => (
              <button
                key={e.id}
                onClick={() => router.push(`/emergency/${e.id}`)}
                className="w-full bg-navy-900/90 backdrop-blur-sm border border-navy-700 hover:border-orange-500/50 rounded-xl px-4 py-3 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium truncate">{e.title}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0',
                    e.severity === EmergencySeverity.CRITICAL ? 'bg-danger-500/20 text-danger-400' :
                    e.severity === EmergencySeverity.HIGH ? 'bg-orange-500/20 text-orange-400' :
                    'bg-amber-500/20 text-amber-400'
                  )}>
                    {e.severity}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{e.type}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
