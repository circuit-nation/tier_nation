import { create } from 'zustand';

import {
  ACCESS_TOKEN_COOKIE_MAX_AGE,
  ACCESS_TOKEN_COOKIE_NAME,
  deleteCookie,
  getCookie,
  setCookie,
  type AuthUser,
} from '@/lib/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthStore = {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  isAnonymous: boolean;
  setSession: (accessToken: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  clearSession: () => void;
  hydrateFromCookie: () => string | null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  status: 'loading',
  isAnonymous: false,
  setSession: (accessToken, user = null) => {
    setCookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      ACCESS_TOKEN_COOKIE_MAX_AGE
    );
    set({
      accessToken,
      user,
      status: 'authenticated',
    });
  },
  setUser: (user) => {
    set({ user });
  },
  setIsAnonymous: (isAnonymous) => {
    set({ isAnonymous });
  },
  clearSession: () => {
    deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
    });
  },
  hydrateFromCookie: () => {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE_NAME);
    if (!accessToken) {
      set({ accessToken: null });
      return null;
    }

    set({
      accessToken,
      status: 'authenticated',
    });
    return accessToken;
  },
}));
