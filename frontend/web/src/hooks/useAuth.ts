'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAuth, getStoredUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { AuthUser, LoginInput, RegisterInput } from '@/lib/types';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      setAuth(result.token, result.user);
      setUser(result.user);
      connectSocket(result.token);
      router.push('/dashboard');
      return result;
    },
    [router]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authApi.register(input);
      return result;
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
    disconnectSocket();
    setUser(null);
    router.push('/');
  }, [router]);

  return { user, loading, login, register, logout, isAuthenticated: !!user };
}
