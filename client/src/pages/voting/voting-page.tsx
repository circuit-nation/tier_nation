import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';

import { useDragDrop } from '@/hooks/use-drag-drop';
import { useVoting } from '@/hooks/use-voting';
import {
  calculateEntityAverageRankings,
  calculateVoteAverages,
  getVotesByList,
} from '@/lib/mock/votes';
import { EntityPool } from '@/pages/voting/components/entity-pool';
import { TierBoard } from '@/pages/voting/components/tier-board';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';

import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import {
  TIER_VALUES,
  type TierBoardState,
  type TierValue,
  type Vote,
} from '@/types';
import ActionBar from './components/action-bar';

export function VotingPage() {
  const { listId } = useParams();
  const [comparisonBoard, setComparisonBoard] = useState<{
    userBoard: TierBoardState;
    communityBoard: TierBoardState;
    totalVotes: number;
  } | null>(null);

  const { list, tiers, board, pool, entitiesById, moveEntity } =
    useVoting(listId);

  const { activeEntityId, overDestination, draggableProps, dropzoneProps } =
    useDragDrop(moveEntity);

  const startTime = list.startTime;
  const endTime = list.endTime;
  const isLive =
    startTime && endTime
      ? new Date() > new Date(startTime) && new Date() < new Date(endTime)
      : false;
  const hasComparison = comparisonBoard !== null;

  const tierScores = useMemo(() => {
    const scoreMap = Object.fromEntries(
      TIER_VALUES.map((tierValue) => [tierValue, 0])
    ) as Record<TierValue, number>;

    for (const tier of list.tiers) {
      scoreMap[tier.value] = tier.score;
    }

    return scoreMap;
  }, [list.tiers]);

  const createEmptyBoard = (): TierBoardState =>
    TIER_VALUES.reduce((boardByTier, tierValue) => {
      boardByTier[tierValue] = [];
      return boardByTier;
    }, {} as TierBoardState);

  const mapVotesToBoard = (votes: Vote[]): TierBoardState => {
    const mappedBoard = createEmptyBoard();
    for (const vote of votes) {
      mappedBoard[vote.tier].push(vote.entityId);
    }
    return mappedBoard;
  };

  const handleSubmitted = async (payload: Vote[]) => {
    const userBoard = mapVotesToBoard(payload);
    const listVotes = await getVotesByList(list.id);
    const averages = calculateVoteAverages(listVotes, tierScores);
    const entityAverages = calculateEntityAverageRankings(
      listVotes,
      tierScores
    );

    const communityBoard = createEmptyBoard();
    for (const entityAverage of entityAverages) {
      communityBoard[entityAverage.averageTier].push(entityAverage.entityId);
    }

    setComparisonBoard({
      userBoard,
      communityBoard,
      totalVotes: averages.totalVotes,
    });
  };

  return (
    // pb-28/pb-40 reserves space so the fixed pool doesn't overlap content
    <div
      className={hasComparison ? 'space-y-4' : 'space-y-4 py-10 pb-28 sm:pb-40'}
    >
      <section className="space-y-10">
        <div className="space-y-2">
          <div className="*:flex-1 max-w-4xl text-center md:text-left space-y-4">
            <p className="text-sm font-grotesk">
              {isLive && <LiveIndicator variant="pill" size="sm" />}{' '}
              {list.startTime
                ? getRelativeTime(list.startTime)
                : 'Schedule TBA'}
            </p>
            <div>
              <p className="text-4xl md:text-5xl font-sans font-semibold">
                {list.name}
              </p>
              <p className="text-lg font-medium font-grotesk text-muted-foreground">
                {list.description}
              </p>
            </div>
          </div>
          {!hasComparison ? (
            <div>
              <ActionBar listId={list.id} onSubmitted={handleSubmitted} />
            </div>
          ) : null}
        </div>

        {comparisonBoard ? (
          <VoteAverageSummary
            tiers={tiers}
            entitiesById={entitiesById}
            userBoard={comparisonBoard.userBoard}
            communityBoard={comparisonBoard.communityBoard}
            totalVotes={comparisonBoard.totalVotes}
          />
        ) : (
          <TierBoard
            tiers={tiers}
            board={board}
            entitiesById={entitiesById}
            draggableProps={draggableProps}
            dropzoneProps={dropzoneProps}
            activeEntityId={activeEntityId}
            overDestination={overDestination}
          />
        )}
      </section>

      {/* Entity Pool */}
      {!hasComparison ? (
        <EntityPool
          pool={pool}
          activeEntityId={activeEntityId}
          isOver={overDestination === 'POOL'}
          draggableProps={draggableProps}
          dropzoneProps={dropzoneProps}
        />
      ) : null}
    </div>
  );
}
