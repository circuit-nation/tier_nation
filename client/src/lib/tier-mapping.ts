import type { Tier, TierValue } from '@/types';

import type { ApiTiersConfig } from '@/lib/api/types';

/** Builds UI tiers from API tiersConfig (value 1 = highest tier by convention). */
export function tiersConfigToTiers(config: ApiTiersConfig): Tier[] {
  return config.tiers.map((t, index) => {
    const letter = t.label as TierValue;
    return {
      value: letter,
      label: t.label,
      score: 8 - t.value,
      order: index + 1,
    };
  });
}

export function tierLetterToApiValue(
  config: ApiTiersConfig,
  letter: TierValue
): number {
  const entry = config.tiers.find((x) => x.label === letter);
  if (!entry) {
    throw new Error(`Tier "${letter}" is not configured for this list`);
  }
  return entry.value;
}

export function apiValueToTierLetter(
  config: ApiTiersConfig,
  value: number
): TierValue {
  const entry = config.tiers.find((x) => x.value === value);
  if (!entry) {
    throw new Error(`Tier value ${value} is not configured for this list`);
  }
  return entry.label as TierValue;
}
