import type { TierValue } from '@/types';

export const APP_NAME = 'Tier Nation';
export const COMMUNITY_NAME = 'Circuit Nation';
export const LIVE_LIST_ID = 'f1-2026';
export const MIN_SUBMIT_DRIVER_RATIO = 0.6;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const TIER_ACCENT_BY_VALUE: Record<TierValue, string> = {
  S: 'bg-tier-s',
  A: 'bg-tier-a',
  B: 'bg-tier-b',
  C: 'bg-tier-c',
  D: 'bg-tier-d',
  E: 'bg-tier-e',
  F: 'bg-tier-f',
};
