'use client';

import { useEffect, useRef } from 'react';
import { Emergency, EmergencySeverity } from '@/lib/types';

interface MapPin {
  lat: number;
  lng: number;
  type: 'emergency' | 'shelter' | 'hazard' | 'user';
  label?: string;
  severity?: EmergencySeverity;
  id?: string;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  pins?: MapPin[];
  className?: string;
  onEmergencyClick?: (id: string) => void;
}

const severityColors: Record<EmergencySeverity, string> = {
  [EmergencySeverity.LOW]: '#2dd4bf',
  [EmergencySeverity.MEDIUM]: '#fbbf24',
  [EmergencySeverity.HIGH]: '#f97316',
  [EmergencySeverity.CRITICAL]: '#ef4444',
};

export default function MapView({ center = [20, 0], zoom = 3, pins = [], className = '', onEmergencyClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (leafletMap.current) return; // Already initialized

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;

      // Add pins
      updateMarkers(L, map, pins, onEmergencyClick);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!leafletMap.current) return;
    import('leaflet').then((L) => {
      // Clear old markers
      markers.current.forEach((m) => m.remove());
      markers.current = [];
      updateMarkers(L, leafletMap.current, pins, onEmergencyClick);
    });
  }, [pins, onEmergencyClick]);

  function updateMarkers(L: any, map: any, pins: MapPin[], onEmergencyClick?: (id: string) => void) {
    pins.forEach((pin) => {
      const color = pin.type === 'emergency'
        ? (pin.severity ? severityColors[pin.severity] : '#ef4444')
        : pin.type === 'shelter'
          ? '#2dd4bf'
          : pin.type === 'user'
            ? '#60a5fa'
            : '#f97316';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 32px; height: 32px;
            background: ${color};
            border: 3px solid rgba(255,255,255,0.8);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      if (pin.label) {
        marker.bindPopup(`<strong style="color:#1e293b">${pin.label}</strong>`);
      }
      if (pin.type === 'emergency' && pin.id && onEmergencyClick) {
        marker.on('click', () => onEmergencyClick(pin.id!));
      }
      markers.current.push(marker);
    });
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className={`w-full rounded-xl overflow-hidden ${className}`}
        style={{ minHeight: '400px', background: '#0f2040' }}
      />
    </>
  );
}
