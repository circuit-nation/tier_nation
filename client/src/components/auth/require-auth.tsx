import { type PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
