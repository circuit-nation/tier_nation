import type { List } from '@/types';

import { apiFetch } from '@/lib/api/http';
import type {
  ApiListDetail,
  ApiListSummary,
  ApiListsResponse,
  ApiUserStatus,
  ApiUserStatusCompact,
} from '@/lib/api/types';
import { tiersConfigToTiers } from '@/lib/tier-mapping';

export async function fetchLists(
  page = 1,
  limit = 10,
  accessToken?: string | null
) {
  return apiFetch<ApiListsResponse>(
    `/lists?page=${page}&limit=${limit}`,
    { accessToken }
  );
}

export async function fetchListById(id: string, accessToken?: string | null) {
  return apiFetch<ApiListDetail>(`/lists/${encodeURIComponent(id)}`, {
    accessToken,
  });
}

export function isFullUserStatus(
  status: ApiUserStatus | ApiUserStatusCompact | undefined
): status is ApiUserStatus {
  return Boolean(status && 'voteCount' in status);
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
    entityCount: summary.entityCount,
    status: summary.status,
    isLive: summary.isLive,
    votingOpen: summary.votingOpen,
    votingClosedReason: summary.votingClosedReason ?? undefined,
    userStatus: summary.userStatus,
  };
}

export function apiListDetailToList(detail: ApiListDetail): List {
  return apiListSummaryToList(detail);
}
