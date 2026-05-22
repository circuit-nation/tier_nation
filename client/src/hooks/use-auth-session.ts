import useSWR from 'swr';

import { bootstrapSession } from '@/lib/auth/session';
import { swrKeys } from '@/lib/swr/keys';

export function useAuthSession() {
  const { isLoading, mutate } = useSWR(swrKeys.authSession(), bootstrapSession, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    isBootstrapping: isLoading,
    refreshSession: mutate,
  };
}
