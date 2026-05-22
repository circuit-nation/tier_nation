import { Navigate } from 'react-router-dom';
import useSWR from 'swr';

import { useAuth } from '@/hooks/use-auth';
import { fetchLists } from '@/lib/api/lists';
import { swrKeys } from '@/lib/swr/keys';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_LIST_ID = import.meta.env.VITE_DEFAULT_LIST_ID as
  | string
  | undefined;

export function VotingRedirectPage() {
  const { accessToken } = useAuth();
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading } = useSWR(
    swrKeys.lists(1, 1, authKey),
    () => fetchLists(1, 1, accessToken)
  );

  if (DEFAULT_LIST_ID) {
    return <Navigate to={`/voting/${DEFAULT_LIST_ID}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="py-10 px-5 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-5">
        <p className="text-center text-sm text-destructive">
          Unable to load voting lists.
        </p>
      </div>
    );
  }

  const first = data?.lists.find((l) => l.isVisible) ?? data?.lists[0];
  if (!first) {
    return (
      <div className="py-10 px-5">
        <p className="text-center text-sm text-muted-foreground">
          No active lists available to vote on yet.
        </p>
      </div>
    );
  }

  return <Navigate to={`/voting/${first.id}`} replace />;
}
