'use client';

import { useState, useEffect, useCallback } from 'react';
import { helpApi } from '@/lib/api';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { getSocket } from '@/lib/socket';

export function useHelpRequests(emergencyId: string) {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpApi.getRequestsByEmergency(emergencyId);
      setRequests(data);
    } catch (err) {
      setError('Failed to load help requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    if (!emergencyId) return;
    fetch();
  }, [fetch, emergencyId]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (request: HelpRequest) => {
      if (request.emergencyId === emergencyId) {
        setRequests((prev) => [request, ...prev.filter((r) => r.id !== request.id)]);
      }
    };
    socket.on('help:request:created', handler);
    return () => {
      socket.off('help:request:created', handler);
    };
  }, [emergencyId]);

  return { requests, loading, error, refetch: fetch };
}

export function useHelpOffers(emergencyId: string) {
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpApi.getOffersByEmergency(emergencyId);
      setOffers(data);
    } catch (err) {
      setError('Failed to load help offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    if (!emergencyId) return;
    fetch();
  }, [fetch, emergencyId]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (offer: HelpOffer) => {
      if (offer.emergencyId === emergencyId) {
        setOffers((prev) => [offer, ...prev.filter((o) => o.id !== offer.id)]);
      }
    };
    socket.on('help:offer:created', handler);
    return () => {
      socket.off('help:offer:created', handler);
    };
  }, [emergencyId]);

  return { offers, loading, error, refetch: fetch };
}
