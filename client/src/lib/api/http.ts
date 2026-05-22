import { API_BASE_URL } from '@/lib/constants';

import type { ApiErrorBody } from '@/lib/api/types';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { accessToken, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);

  if (accessToken) {
    mergedHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    ...rest,
    headers: mergedHeaders,
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    let code: string | undefined;
    try {
      const j = JSON.parse(text) as ApiErrorBody;
      if (j.error) msg = j.error;
      code = j.code;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status, code);
  }

  return (text ? JSON.parse(text) : {}) as T;
}

/** @deprecated use apiFetch — kept for gradual migration */
export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    let code: string | undefined;
    try {
      const j = JSON.parse(text) as ApiErrorBody;
      if (j.error) msg = j.error;
      code = j.code;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status, code);
  }
  return (text ? JSON.parse(text) : {}) as T;
}
