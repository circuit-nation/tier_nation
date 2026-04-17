import type { TierValue } from '@/types'

export const APP_NAME = 'Tier Nation'
export const LIVE_LIST_ID = 'f1-2026'
export const MIN_SUBMIT_DRIVER_RATIO = 0.6

export const TIER_ACCENT_BY_VALUE: Record<TierValue, string> = {
  S: 'bg-tier-s/16 border-tier-s/55',
  A: 'bg-tier-a/16 border-tier-a/55',
  B: 'bg-tier-b/16 border-tier-b/55',
  C: 'bg-tier-c/16 border-tier-c/55',
  D: 'bg-tier-d/16 border-tier-d/55',
  E: 'bg-tier-e/16 border-tier-e/55',
}
