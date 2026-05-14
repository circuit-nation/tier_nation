import type { List } from '@/types';

import { apiUrl, parseJson } from '@/lib/api/http';
import type { ApiListDetail, ApiListSummary } from '@/lib/api/types';
import { tiersConfigToTiers } from '@/lib/tier-mapping';

export async function fetchLists(page = 1, limit = 10) {
  const res = await fetch(apiUrl(`/lists?page=${page}&limit=${limit}`));
  return parseJson<{ lists: ApiListSummary[] }>(res);
}

export async function fetchListById(id: string) {
  const res = await fetch(apiUrl(`/lists/${encodeURIComponent(id)}`));
  return parseJson<ApiListDetail>(res);
}

export function apiListSummaryToList(summary: ApiListSummary): List {
  return {
    id: summary.id,
    name: summary.name,
    description: summary.description,
    coverImage: summary.coverImage,
    tiers: tiersConfigToTiers(summary.tiersConfig),
    tiersConfig: summary.tiersConfig,
    isLocked: summary.isLocked,
    isVisible: summary.isVisible,
    startTime: summary.startTime ?? undefined,
    endTime: summary.endTime ?? undefined,
  };
}

export function apiListDetailToList(detail: ApiListDetail): List {
  return apiListSummaryToList(detail);
}
