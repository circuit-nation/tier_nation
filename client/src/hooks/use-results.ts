import useSWR from 'swr';

import { fetchEntityAverages } from '@/lib/api/averages';
import type { ApiEntityAverageRow } from '@/lib/api/types';
import { getVotesByList } from '@/lib/mock/votes';
import { swrKeys } from '@/lib/swr/keys';
import type { Vote } from '@/types';

export type ResultsData =
  | { source: 'api'; entityAverages: ApiEntityAverageRow[] }
  | { source: 'mock'; votes: Vote[] };

async function fetchResults(
  listId: string,
  accessToken: string | null
): Promise<ResultsData> {
  if (accessToken) {
    try {
      const { entityAverages } = await fetchEntityAverages(listId, accessToken);
      return { source: 'api', entityAverages };
    } catch {
      const votes = await getVotesByList(listId);
      return { source: 'mock', votes };
    }
  }

  const votes = await getVotesByList(listId);
  return { source: 'mock', votes };
}

export function useResults(listId: string | undefined, accessToken: string | null) {
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading, isValidating } = useSWR(
    listId ? swrKeys.results(listId, authKey) : null,
    () => fetchResults(listId!, accessToken)
  );

  return {
    data: data ?? null,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: Boolean(listId) && (isLoading || (isValidating && !data)),
  };
}
