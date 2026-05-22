import useSWR from 'swr';

import { apiListSummaryToList, fetchLists } from '@/lib/api/lists';
import { swrKeys } from '@/lib/swr/keys';
import type { List } from '@/types';

async function fetchVisibleLists(page: number, limit: number): Promise<List[]> {
  const res = await fetchLists(page, limit);
  return res.lists.map(apiListSummaryToList).filter((list) => list.isVisible);
}

export function useLists(page = 1, limit = 20) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.lists(page, limit),
    () => fetchVisibleLists(page, limit)
  );

  return {
    lists: data ?? [],
    error: error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: isLoading || (isValidating && !data),
    mutate,
  };
}
