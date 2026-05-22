import { apiFetch } from '@/lib/api/http';
import type { ApiListStats } from '@/lib/api/types';

export async function fetchListStats(listId: string) {
  return apiFetch<ApiListStats>(
    `/lists/${encodeURIComponent(listId)}/stats`
  );
}
