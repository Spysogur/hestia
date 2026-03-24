'use client';

import Link from 'next/link';
import { MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { Community } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  community: Community;
  onJoin?: (id: string) => void;
  showJoinButton?: boolean;
}

export default function CommunityCard({ community, onJoin, showJoinButton }: Props) {
  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-5 hover:border-teal-500/40 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <Link href={`/communities/${community.id}`}>
            <h3 className="text-white font-semibold text-base hover:text-orange-400 transition-colors truncate">
              {community.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{community.region}, {community.country}</span>
          </div>
        </div>
        <span
          className={clsx(
            'text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0',
            community.isActive
              ? 'bg-teal-500/20 text-teal-400'
              : 'bg-gray-700 text-gray-400'
          )}
        >
          {community.isActive ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {community.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{community.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {community.memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {community.radiusKm}km radius
          </span>
        </div>

        {showJoinButton && onJoin && (
          <button
            onClick={() => onJoin(community.id)}
            className="px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}
