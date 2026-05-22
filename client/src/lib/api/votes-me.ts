import { apiFetch } from '@/lib/api/http';
import type { ApiVotesMeResponse } from '@/lib/api/types';

export async function fetchVotesMe(listId: string, accessToken: string) {
  return apiFetch<ApiVotesMeResponse>(
    `/lists/${encodeURIComponent(listId)}/votes/me`,
    { accessToken }
  );
}
