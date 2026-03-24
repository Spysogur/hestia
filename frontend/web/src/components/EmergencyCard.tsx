'use client';

import Link from 'next/link';
import { Flame, Waves, Wind, Zap, Mountain, Sun, AlertCircle, MapPin, Clock } from 'lucide-react';
import { Emergency, EmergencyType, EmergencySeverity, EmergencyStatus } from '@/lib/types';
import clsx from 'clsx';

const typeIcons: Record<EmergencyType, React.ReactNode> = {
  [EmergencyType.WILDFIRE]: <Flame className="w-5 h-5" />,
  [EmergencyType.FLOOD]: <Waves className="w-5 h-5" />,
  [EmergencyType.STORM]: <Wind className="w-5 h-5" />,
  [EmergencyType.EARTHQUAKE]: <Zap className="w-5 h-5" />,
  [EmergencyType.TSUNAMI]: <Waves className="w-5 h-5" />,
  [EmergencyType.LANDSLIDE]: <Mountain className="w-5 h-5" />,
  [EmergencyType.HEATWAVE]: <Sun className="w-5 h-5" />,
  [EmergencyType.OTHER]: <AlertCircle className="w-5 h-5" />,
};

const severityConfig: Record<EmergencySeverity, { label: string; className: string; dotClass: string }> = {
  [EmergencySeverity.LOW]: {
    label: 'Low',
    className: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    dotClass: 'bg-teal-400',
  },
  [EmergencySeverity.MEDIUM]: {
    label: 'Medium',
    className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  [EmergencySeverity.HIGH]: {
    label: 'High',
    className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  [EmergencySeverity.CRITICAL]: {
    label: 'Critical',
    className: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
    dotClass: 'bg-danger-400 animate-pulse',
  },
};

interface Props {
  emergency: Emergency;
}

export default function EmergencyCard({ emergency }: Props) {
  const severity = severityConfig[emergency.severity];
  const isActive = emergency.status === EmergencyStatus.ACTIVE;

  return (
    <Link href={`/emergency/${emergency.id}`}>
      <div
        className={clsx(
          'bg-navy-800 border rounded-xl p-4 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer',
          emergency.severity === EmergencySeverity.CRITICAL
            ? 'border-danger-500/50'
            : 'border-navy-700'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                emergency.severity === EmergencySeverity.CRITICAL
                  ? 'bg-danger-500/20 text-danger-400'
                  : 'bg-orange-500/20 text-orange-400'
              )}
            >
              {typeIcons[emergency.type]}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm leading-tight">{emergency.title}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{emergency.type}</p>
            </div>
          </div>
          <span className={clsx('text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0', severity.className)}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', severity.dotClass)} />
            {severity.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{emergency.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{emergency.radiusKm}km radius</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(emergency.createdAt).toLocaleDateString()}</span>
          </div>
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-xs font-medium',
              isActive ? 'bg-danger-500/20 text-danger-400' : 'bg-gray-700 text-gray-400'
            )}
          >
            {emergency.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
