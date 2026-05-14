import type { ApiTiersConfig } from '@/lib/api/types';

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
};
