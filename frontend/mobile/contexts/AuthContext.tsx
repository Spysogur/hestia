import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { clearAuth, getStoredUser, getToken, saveToken, saveUser } from "@/lib/auth";
import { stopSignalR } from "@/lib/signalr";
import { LoginPayload, RegisterPayload, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getStoredUser(),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    await Promise.all([
      saveToken(response.token),
      saveUser(response.user),
    ]);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    await Promise.all([
      saveToken(response.token),
      saveUser(response.user),
    ]);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await stopSignalR();
    await clearAuth();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
