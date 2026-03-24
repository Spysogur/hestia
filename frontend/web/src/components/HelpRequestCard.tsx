'use client';

import { Clock, MapPin, Users, Zap } from 'lucide-react';
import { HelpRequest, HelpRequestPriority, HelpRequestStatus } from '@/lib/types';
import clsx from 'clsx';

const priorityConfig: Record<HelpRequestPriority, { label: string; className: string }> = {
  [HelpRequestPriority.LOW]: { label: 'Low', className: 'bg-teal-500/20 text-teal-400' },
  [HelpRequestPriority.MEDIUM]: { label: 'Medium', className: 'bg-amber-500/20 text-amber-400' },
  [HelpRequestPriority.HIGH]: { label: 'High', className: 'bg-orange-500/20 text-orange-400' },
  [HelpRequestPriority.URGENT]: { label: 'Urgent', className: 'bg-danger-500/20 text-danger-400' },
};

const statusConfig: Record<HelpRequestStatus, { label: string; className: string }> = {
  [HelpRequestStatus.OPEN]: { label: 'Open', className: 'bg-teal-500/20 text-teal-400' },
  [HelpRequestStatus.MATCHED]: { label: 'Matched', className: 'bg-amber-500/20 text-amber-400' },
  [HelpRequestStatus.IN_PROGRESS]: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  [HelpRequestStatus.COMPLETED]: { label: 'Completed', className: 'bg-gray-500/20 text-gray-400' },
  [HelpRequestStatus.CANCELLED]: { label: 'Cancelled', className: 'bg-gray-700 text-gray-500' },
};

interface Props {
  request: HelpRequest;
  onMatch?: (requestId: string) => void;
  showMatchButton?: boolean;
}

export default function HelpRequestCard({ request, onMatch, showMatchButton }: Props) {
  const priority = priorityConfig[request.priority];
  const status = statusConfig[request.status];

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 hover:border-orange-500/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="text-white font-semibold text-sm">{request.title}</h4>
          <span className="text-gray-400 text-xs">{request.type}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', priority.className)}>
            {priority.label}
          </span>
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', status.className)}>
            {status.label}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{request.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showMatchButton && request.status === HelpRequestStatus.OPEN && onMatch && (
        <button
          onClick={() => onMatch(request.id)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4" />
          Match Volunteer
        </button>
      )}
    </div>
  );
}
