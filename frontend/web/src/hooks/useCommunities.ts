'use client';

import { useState, useEffect, useCallback } from 'react';
import { communityApi } from '@/lib/api';
import { Community } from '@/lib/types';

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await communityApi.getAll();
      setCommunities(data);
    } catch (err) {
      setError('Failed to load communities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { communities, loading, error, refetch: fetch };
}

export function useCommunity(id: string) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    communityApi
      .getById(id)
      .then(setCommunity)
      .catch(() => setError('Failed to load community'))
      .finally(() => setLoading(false));
  }, [id]);

  return { community, loading, error };
}
