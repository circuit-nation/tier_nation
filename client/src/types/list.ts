import type { ApiTiersConfig, ApiUserStatus, ApiUserStatusCompact } from '@/lib/api/types';

import type { Tier } from './tier';

export type List = {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  tiers: Tier[];
  /** Present for API-backed lists; required to submit numeric tier values. */
  tiersConfig?: ApiTiersConfig;
  isLocked: boolean;
  isVisible: boolean;
  startTime?: string;
  endTime?: string;
  entityCount?: number;
  status?: 'upcoming' | 'live' | 'ended' | 'locked' | 'archived';
  isLive?: boolean;
  votingOpen?: boolean;
  votingClosedReason?: string;
  userStatus?: ApiUserStatus | ApiUserStatusCompact;
};
