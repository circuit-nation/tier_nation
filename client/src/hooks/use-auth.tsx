import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { authEndpoints, type AuthUser } from '@/lib/auth';
import {
  completeSessionWithToken,
  refreshAccessToken,
} from '@/lib/auth/session';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAuthStore } from '@/store/auth-store';

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAnonymous: boolean;
  isAuthenticated: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  login: () => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  completeOAuthLogin: (accessToken: string) => Promise<AuthUser | null>;
  bootstrapAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const setIsAnonymous = useAuthStore((state) => state.setIsAnonymous);
  const clearSession = useAuthStore((state) => state.clearSession);

  const { refreshSession } = useAuthSession();

  const login = useCallback(() => {
    window.location.assign(authEndpoints.login);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(authEndpoints.logout, {
        method: 'POST',
        credentials: 'include',
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      });
    } finally {
      clearSession();
      await refreshSession();
    }
  }, [accessToken, clearSession, refreshSession]);

  const completeOAuthLogin = useCallback(
    async (newAccessToken: string) => {
      const session = await completeSessionWithToken(newAccessToken);
      await refreshSession();
      return session.user;
    },
    [refreshSession]
  );

  const bootstrapAuth = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      status,
      isAnonymous,
      isAuthenticated: status === 'authenticated' && Boolean(accessToken),
      setIsAnonymous,
      login,
      logout,
      refreshAccessToken,
      completeOAuthLogin,
      bootstrapAuth,
    }),
    [
      accessToken,
      bootstrapAuth,
      completeOAuthLogin,
      isAnonymous,
      login,
      logout,
      setIsAnonymous,
      status,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
