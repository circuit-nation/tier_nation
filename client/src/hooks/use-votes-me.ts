import useSWR from 'swr';

import { fetchVotesMe } from '@/lib/api/votes-me';
import { swrKeys } from '@/lib/swr/keys';

export function useVotesMe(listId: string | undefined, accessToken: string | null) {
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading, isValidating } = useSWR(
    listId && accessToken ? swrKeys.votesMe(listId, authKey) : null,
    () => fetchVotesMe(listId!, accessToken!)
  );

  return {
    votesMe: data ?? null,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading:
      Boolean(listId && accessToken) && (isLoading || (isValidating && !data)),
  };
}
