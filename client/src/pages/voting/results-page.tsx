import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { useResults } from '@/hooks/use-results';
import { useVoting } from '@/hooks/use-voting';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';
import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import { Skeleton } from '@/components/ui/skeleton';
import type { TierBoardState } from '@/types';
import {
  buildCommunityBoard,
  buildCommunityBoardFromEntityAverages,
  buildTierScores,
  createEmptyBoard,
} from '@/pages/voting/results-utils';

type ResultsLocationState = {
  userBoard?: TierBoardState;
};

type ResultsState = {
  userBoard: TierBoardState;
  communityBoard: TierBoardState;
  totalVotes: number;
};

export function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const routeState = (location.state as ResultsLocationState | null) ?? null;
  const { accessToken } = useAuth();
  const { list, tiers, entitiesById } = useVoting(id);
  const { data: resultsData, error: fetchError, isLoading } = useResults(
    list.id,
    accessToken
  );

  const tierScores = useMemo(() => buildTierScores(list.tiers), [list.tiers]);

  const startTime = list.startTime;
  const endTime = list.endTime;
  const isLive =
    startTime && endTime
      ? new Date() > new Date(startTime) && new Date() < new Date(endTime)
      : false;

  const result = useMemo((): ResultsState | null => {
    if (!resultsData) return null;

    const userBoard = routeState?.userBoard ?? createEmptyBoard();
    let communityBoard = createEmptyBoard();
    let totalVotes = 0;

    if (resultsData.source === 'api') {
      communityBoard = buildCommunityBoardFromEntityAverages(
        resultsData.entityAverages,
        tierScores
      );
      totalVotes = resultsData.entityAverages.reduce(
        (acc, row) => acc + row.voteCount,
        0
      );
    } else {
      const community = buildCommunityBoard(resultsData.votes, tierScores);
      communityBoard = community.board;
      totalVotes = community.totals.totalVotes;
    }

    return {
      userBoard,
      communityBoard,
      totalVotes,
    };
  }, [resultsData, routeState?.userBoard, tierScores]);

  const errorMessage = fetchError ?? '';

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

        {result ? (
          <VoteAverageSummary
            tiers={tiers}
            entitiesById={entitiesById}
            userBoard={result.userBoard}
            communityBoard={result.communityBoard}
            totalVotes={result.totalVotes}
          />
        ) : null}
      </section>
    </div>
  );
}
