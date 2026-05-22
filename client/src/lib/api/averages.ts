import { apiFetch } from '@/lib/api/http';
import type {
  ApiAverageScoreResponse,
  ApiEntityAveragesResponse,
} from '@/lib/api/types';

export async function fetchEntityAverages(listId: string, accessToken: string) {
  return apiFetch<ApiEntityAveragesResponse>(
    `/lists/${encodeURIComponent(listId)}/entity-averages`,
    { accessToken }
  );
}

export async function fetchListAverageScore(
  listId: string,
  accessToken: string
) {
  return apiFetch<ApiAverageScoreResponse>(
    `/lists/${encodeURIComponent(listId)}/average-score`,
    { accessToken }
  );
}
