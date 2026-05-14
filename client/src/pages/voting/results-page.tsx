import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { fetchEntityAverages } from '@/lib/api/averages';
import { useAuth } from '@/hooks/use-auth';
import { useVoting } from '@/hooks/use-voting';
import { getVotesByList } from '@/lib/mock/votes';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';
import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
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
  const [result, setResult] = useState<ResultsState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { accessToken } = useAuth();
  const { list, tiers, entitiesById } = useVoting(id);

  const tierScores = useMemo(() => buildTierScores(list.tiers), [list.tiers]);

  const startTime = list.startTime;
  const endTime = list.endTime;
  const isLive =
    startTime && endTime
      ? new Date() > new Date(startTime) && new Date() < new Date(endTime)
      : false;

  useEffect(() => {
    const loadResults = async () => {
      setErrorMessage('');
      const userBoard = routeState?.userBoard ?? createEmptyBoard();

      let communityBoard = createEmptyBoard();
      let totalVotes = 0;

      if (accessToken) {
        try {
          const { entityAverages } = await fetchEntityAverages(
            list.id,
            accessToken
          );
          communityBoard = buildCommunityBoardFromEntityAverages(
            entityAverages,
            tierScores
          );
          totalVotes = entityAverages.reduce((acc, row) => acc + row.voteCount, 0);
        } catch {
          const listVotes = await getVotesByList(list.id);
          const community = buildCommunityBoard(listVotes, tierScores);
          communityBoard = community.board;
          totalVotes = community.totals.totalVotes;
        }
      } else {
        const listVotes = await getVotesByList(list.id);
        const community = buildCommunityBoard(listVotes, tierScores);
        communityBoard = community.board;
        totalVotes = community.totals.totalVotes;
      }

      setResult({
        userBoard,
        communityBoard,
        totalVotes,
      });
    };

    loadResults().catch((error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load results.'
      );
    });
  }, [list.id, routeState?.userBoard, tierScores, accessToken]);

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
