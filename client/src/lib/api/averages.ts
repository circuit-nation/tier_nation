import { apiUrl, parseJson } from '@/lib/api/http';
import type { ApiEntityAverageRow } from '@/lib/api/types';

export async function fetchListAverageScore(
  listId: string,
  accessToken: string
) {
  const res = await fetch(
    apiUrl(`/lists/${encodeURIComponent(listId)}/average-score`),
    {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return parseJson<{ listId: string; averageScore: number }>(res);
}

export async function fetchEntityAverages(listId: string, accessToken: string) {
  const res = await fetch(
    apiUrl(`/lists/${encodeURIComponent(listId)}/entity-averages`),
    {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return parseJson<{ entityAverages: ApiEntityAverageRow[] }>(res);
}
