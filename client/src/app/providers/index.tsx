import type { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

import { AuthProvider } from '@/hooks/use-auth';
import { defaultSwrConfig } from '@/lib/swr/config';
import { defaultFetcher } from '@/lib/swr/fetcher';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SWRConfig value={{ ...defaultSwrConfig, fetcher: defaultFetcher }}>
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  );
}

export { useAuth } from '@/hooks/use-auth';
