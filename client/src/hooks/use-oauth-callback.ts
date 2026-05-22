import useSWR, { mutate } from 'swr';

import { completeSessionWithToken } from '@/lib/auth/session';
import { swrKeys } from '@/lib/swr/keys';

export function useOAuthCallback(accessToken: string | null, search: string) {
  const { data, error, isLoading } = useSWR(
    accessToken ? swrKeys.oauthCallback(search) : null,
    async () => {
      const session = await completeSessionWithToken(accessToken!);
      await mutate(swrKeys.authSession(), session, { revalidate: false });
      return session;
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return {
    isComplete: Boolean(data),
    isLoading: Boolean(accessToken) && isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
  };
}
