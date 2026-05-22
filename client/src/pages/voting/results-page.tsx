import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { useListDetail } from '@/hooks/use-list-detail';
import { useListStats } from '@/hooks/use-list-stats';
import { useResults } from '@/hooks/use-results';
import { useVotesMe } from '@/hooks/use-votes-me';
import { useVoting } from '@/hooks/use-voting';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';
import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { TierBoardState } from '@/types';
import {
  buildCommunityBoardFromEntityAverages,
  buildTierScores,
  buildUserBoardFromApiVotes,
  createEmptyBoard,
} from '@/pages/voting/results-utils';

type ResultsLocationState = {
  userBoard?: TierBoardState;
};

type ResultsState = {
  userBoard: TierBoardState;
  communityBoard: TierBoardState;
  totalVotes: number;
  communityHidden: boolean;
  communityMessage: string | null;
};

export function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const routeState = (location.state as ResultsLocationState | null) ?? null;
  const { accessToken, isAuthenticated } = useAuth();
  const { list, tiers, entitiesById, isLoadingList, loadError } = useVoting(id);
  const { userStatus } = useListDetail(id);
  const listId = list?.id ?? id ?? '';
  const { resultsState, error: fetchError, isLoading: isLoadingCommunity } =
    useResults(listId, accessToken);
  const { votesMe, isLoading: isLoadingVotesMe } = useVotesMe(
    listId,
    accessToken
  );
  const { stats } = useListStats(listId);

  const tierScores = useMemo(
    () => (list ? buildTierScores(list.tiers) : buildTierScores([])),
    [list]
  );

  const isLive = list
    ? (list.isLive ??
      (list.startTime && list.endTime
        ? new Date() > new Date(list.startTime) &&
          new Date() < new Date(list.endTime)
        : false))
    : false;

  const canViewCommunity =
    userStatus?.canViewCommunityResults ??
    userStatus?.hasSubmitted ??
    false;

  const tiersConfig = list?.tiersConfig;

  const userBoard = useMemo(() => {
    if (votesMe && tiersConfig) {
      return buildUserBoardFromApiVotes(votesMe.votes, tiersConfig);
    }
    return routeState?.userBoard ?? createEmptyBoard();
  }, [routeState?.userBoard, votesMe, tiersConfig]);

  const community = useMemo(() => {
    let communityBoard = createEmptyBoard();
    let totalVotes = stats?.uniqueVoters ?? 0;
    let communityHidden = !canViewCommunity;
    let communityMessage: string | null = null;

    if (!isAuthenticated) {
      communityMessage = 'Sign in to see community averages.';
    } else if (!canViewCommunity) {
      communityMessage = 'Submit your votes to unlock community results.';
    } else if (resultsState?.status === 'ready') {
      communityBoard = buildCommunityBoardFromEntityAverages(
        resultsState.data.entityAverages,
        tierScores
      );
      totalVotes = resultsState.data.uniqueVoters;
      communityHidden = false;
      communityMessage = null;
    } else if (resultsState?.status === 'submission_required') {
      communityMessage = 'Submit your votes to unlock community results.';
    } else if (resultsState?.status === 'auth_required') {
      communityMessage = 'Sign in to see community averages.';
    } else if (resultsState?.status === 'error') {
      communityMessage = resultsState.message;
    }

    return {
      communityBoard,
      totalVotes,
      communityHidden,
      communityMessage,
    };
  }, [
    canViewCommunity,
    isAuthenticated,
    resultsState,
    tierScores,
    stats?.uniqueVoters,
  ]);

  const result: ResultsState | null = list
    ? { userBoard, ...community }
    : null;

  const isLoading =
    isLoadingList ||
    isLoadingCommunity ||
    (isAuthenticated && isLoadingVotesMe);
  const errorMessage = loadError ?? fetchError ?? '';

  if (!list && !isLoadingList) {
    return (
      <div className="py-10 px-5">
        <p className="text-center text-sm text-destructive">
          {errorMessage || 'List not found.'}
        </p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="py-10 px-5">
        <Skeleton className="h-64 w-full max-w-4xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-10 pb-28 sm:pb-40 px-5">
      <section className="space-y-10">
        <div className="space-y-3">
          <div className="*:flex-1 max-w-4xl text-center md:text-left space-y-4">
            <p className="text-sm sm:text-base font-grotesk">
              {isLive && <LiveIndicator variant="pill" size="sm" />}{' '}
              {list.startTime
                ? getRelativeTime(list.startTime)
                : 'Schedule TBA'}
            </p>

            <div>
              <h1 className="text-4xl md:text-5xl font-sans font-semibold">
                {list.name} Results
              </h1>

              <h2 className="text-xl font-light font-sans text-muted-foreground">
                {list.description}
              </h2>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="text-sm font-medium text-red-500">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <Skeleton className="h-64 w-full max-w-4xl rounded-xl" />
        ) : null}

        {result && list ? (
          <VoteAverageSummary
            tiers={tiers}
            entitiesById={entitiesById}
            userBoard={result.userBoard}
            communityBoard={result.communityBoard}
            totalVotes={result.totalVotes}
            communityHidden={result.communityHidden}
            communityMessage={result.communityMessage}
            communityAction={
              !isAuthenticated ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
              ) : !canViewCommunity ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/voting/${list.id}`}>Submit votes</Link>
                </Button>
              ) : null
            }
          />
        ) : null}
      </section>
    </div>
  );
}
