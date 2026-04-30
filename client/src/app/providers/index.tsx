import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/hooks/use-auth';

export function AppProviders({ children }: PropsWithChildren) {
	return <AuthProvider>{children}</AuthProvider>;
}

export { useAuth } from '@/hooks/use-auth';
