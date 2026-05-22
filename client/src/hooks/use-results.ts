import useSWR from 'swr';

import { ApiError } from '@/lib/api/http';
import { fetchEntityAverages } from '@/lib/api/averages';
import type { ApiEntityAveragesResponse } from '@/lib/api/types';
import { swrKeys } from '@/lib/swr/keys';

export type ResultsFetchState =
  | { status: 'ready'; data: ApiEntityAveragesResponse }
  | { status: 'auth_required' }
  | { status: 'submission_required' }
  | { status: 'error'; message: string };

async function fetchResults(
  listId: string,
  accessToken: string | null
): Promise<ResultsFetchState> {
  if (!accessToken) {
    return { status: 'auth_required' };
  }

  try {
    const data = await fetchEntityAverages(listId, accessToken);
    return { status: 'ready', data };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'AUTH_REQUIRED' || err.status === 401) {
        return { status: 'auth_required' };
      }
      if (err.code === 'SUBMISSION_REQUIRED' || err.status === 403) {
        return { status: 'submission_required' };
      }
      return { status: 'error', message: err.message };
    }
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to load results',
    };
  }
}

export function useResults(listId: string | undefined, accessToken: string | null) {
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading, isValidating } = useSWR(
    listId ? swrKeys.results(listId, authKey) : null,
    () => fetchResults(listId!, accessToken)
  );

  return {
    resultsState: data ?? null,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: Boolean(listId) && (isLoading || (isValidating && !data)),
  };
}
