import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useVoting } from '@/hooks/use-voting';
import { getVotesByList } from '@/lib/mock/votes';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';
import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import type { TierBoardState, Vote } from '@/types';
import {
  buildCommunityBoard,
  buildTierScores,
  mapVotesToBoard,
} from '@/pages/voting/results-utils';

type ResultsLocationState = {
  userBoard?: TierBoardState;
};

type ResultsState = {
  userBoard: TierBoardState;
  communityBoard: TierBoardState;
  totalVotes: number;
};

const mockUserId = 'mock-user';

export function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const routeState = (location.state as ResultsLocationState | null) ?? null;
  const [result, setResult] = useState<ResultsState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { list, tiers, entitiesById } = useVoting(id);

  const tierScores = useMemo(() => buildTierScores(list.tiers), [list.tiers]);

  const startTime = list.startTime;
  const endTime = list.endTime;
  const isLive =
    startTime && endTime
      ? new Date() > new Date(startTime) && new Date() < new Date(endTime)
      : false;

  useEffect(() => {
    const resolveLatestUserVotes = (votes: Vote[]) => {
      const userVotes = votes.filter((vote) => vote.userId === mockUserId);
      if (userVotes.length === 0) return [];

      const latestTimestamp = userVotes.reduce(
        (latest, vote) => (vote.createdAt > latest ? vote.createdAt : latest),
        userVotes[0].createdAt
      );

      return userVotes.filter((vote) => vote.createdAt === latestTimestamp);
    };

    const loadResults = async () => {
      setErrorMessage('');
      const listVotes = await getVotesByList(list.id);
      const fallbackUserVotes = resolveLatestUserVotes(listVotes);
      const userBoard =
        routeState?.userBoard ?? mapVotesToBoard(fallbackUserVotes);
      const community = buildCommunityBoard(listVotes, tierScores);

      setResult({
        userBoard,
        communityBoard: community.board,
        totalVotes: community.totals.totalVotes,
      });
    };

    loadResults().catch((error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load results.'
      );
    });
  }, [list.id, routeState?.userBoard, tierScores]);

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
