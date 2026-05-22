import useSWR from 'swr';

import { useAuth } from '@/hooks/use-auth';
import { apiListSummaryToList, fetchLists } from '@/lib/api/lists';
import { swrKeys } from '@/lib/swr/keys';

async function fetchVisibleLists(
  page: number,
  limit: number,
  accessToken: string | null
) {
  const res = await fetchLists(page, limit, accessToken);
  return {
    lists: res.lists.map(apiListSummaryToList).filter((list) => list.isVisible),
    page: res.page,
    limit: res.limit,
    total: res.total,
    hasMore: res.hasMore,
  };
}

export function useLists(page = 1, limit = 20) {
  const { accessToken } = useAuth();
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKeys.lists(page, limit, authKey),
    () => fetchVisibleLists(page, limit, accessToken)
  );

  return {
    lists: data?.lists ?? [],
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: isLoading || (isValidating && !data),
    mutate,
  };
}
