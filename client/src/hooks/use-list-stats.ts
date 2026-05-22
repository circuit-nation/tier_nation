import useSWR from 'swr';

import { fetchListStats } from '@/lib/api/stats';
import { swrKeys } from '@/lib/swr/keys';

export function useListStats(listId: string | undefined) {
  const { data, error, isLoading, isValidating } = useSWR(
    listId ? swrKeys.listStats(listId) : null,
    () => fetchListStats(listId!)
  );

  return {
    stats: data ?? null,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: Boolean(listId) && (isLoading || (isValidating && !data)),
  };
}
