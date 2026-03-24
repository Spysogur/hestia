'use client';

import { Clock, Heart, Users, Zap } from 'lucide-react';
import { HelpOffer, HelpOfferStatus } from '@/lib/types';
import clsx from 'clsx';

const statusConfig: Record<HelpOfferStatus, { label: string; className: string }> = {
  [HelpOfferStatus.AVAILABLE]: { label: 'Available', className: 'bg-teal-500/20 text-teal-400' },
  [HelpOfferStatus.MATCHED]: { label: 'Matched', className: 'bg-amber-500/20 text-amber-400' },
  [HelpOfferStatus.IN_PROGRESS]: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  [HelpOfferStatus.COMPLETED]: { label: 'Completed', className: 'bg-gray-500/20 text-gray-400' },
  [HelpOfferStatus.WITHDRAWN]: { label: 'Withdrawn', className: 'bg-gray-700 text-gray-500' },
};

interface Props {
  offer: HelpOffer;
  onMatch?: (offerId: string) => void;
  showMatchButton?: boolean;
}

export default function HelpOfferCard({ offer, onMatch, showMatchButton }: Props) {
  const status = statusConfig[offer.status];

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 hover:border-teal-500/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">{offer.type}</span>
            <p className="text-gray-400 text-xs">Volunteer offer</p>
          </div>
        </div>
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0', status.className)}>
          {status.label}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{offer.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Capacity: {offer.capacity}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(offer.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showMatchButton && offer.status === HelpOfferStatus.AVAILABLE && onMatch && (
        <button
          onClick={() => onMatch(offer.id)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4" />
          Use This Offer
        </button>
      )}
    </div>
  );
}
