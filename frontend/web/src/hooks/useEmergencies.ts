'use client';

import { useState, useEffect, useCallback } from 'react';
import { emergencyApi } from '@/lib/api';
import { Emergency } from '@/lib/types';
import { getSocket } from '@/lib/socket';

export function useEmergencies(communityId?: string) {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await emergencyApi.getActive(communityId);
      setEmergencies(data);
    } catch (err) {
      setError('Failed to load emergencies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (emergency: Emergency) => {
      setEmergencies((prev) => [emergency, ...prev.filter((e) => e.id !== emergency.id)]);
    };
    socket.on('emergency:activated', handler);
    return () => {
      socket.off('emergency:activated', handler);
    };
  }, []);

  return { emergencies, loading, error, refetch: fetch };
}

export function useEmergency(id: string) {
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    emergencyApi
      .getById(id)
      .then(setEmergency)
      .catch(() => setError('Failed to load emergency'))
      .finally(() => setLoading(false));
  }, [id]);

  return { emergency, loading, error };
}
