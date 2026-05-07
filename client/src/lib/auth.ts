import { API_BASE_URL } from '@/lib/constants';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
};

export const authEndpoints = {
  login: `${API_BASE_URL}/auth/google/login`,
  refresh: `${API_BASE_URL}/auth/refresh`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/me`,
} as const;

export const ACCESS_TOKEN_COOKIE_NAME = 'tier_nation_access_token';
export const ACCESS_TOKEN_COOKIE_MAX_AGE = 24 * 60 * 60;

const isBrowser = () => typeof document !== 'undefined';

export function getCookie(name: string) {
  if (!isBrowser()) {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : null;
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  path = '/'
) {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === 'https:';
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAgeSeconds}`,
    `Path=${path}`,
    'SameSite=Lax',
    secure ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ');
}

export function deleteCookie(name: string, path = '/') {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
}

export function getAccessTokenFromLocation(search: string) {
  return new URLSearchParams(search).get('access_token');
}
