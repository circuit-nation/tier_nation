import { useParams, useNavigate } from 'react-router-dom';

import { useDragDrop } from '@/hooks/use-drag-drop';
import { useVoting } from '@/hooks/use-voting';
import { EntityPool } from '@/pages/voting/components/entity-pool';
import { TierBoard } from '@/pages/voting/components/tier-board';

import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vote } from '@/types';
import ActionBar from './components/action-bar';
import { mapVotesToBoard } from './results-utils';

export function VotingPage() {
  const navigate = useNavigate();
  const { listId } = useParams();

  const {
    list,
    tiers,
    board,
    pool,
    entitiesById,
    moveEntity,
    loadError,
    isLoadingList,
  } = useVoting(listId);

  const { activeEntityId, overDestination, draggableProps, dropzoneProps } =
    useDragDrop(moveEntity);

  const startTime = list.startTime;
  const endTime = list.endTime;
  const isLive =
    startTime && endTime
      ? new Date() > new Date(startTime) && new Date() < new Date(endTime)
      : false;
  const handleSubmitted = async (payload: Vote[]) => {
    const userBoard = mapVotesToBoard(payload);
    navigate(`/results/${list.id}`, {
      state: { userBoard },
    });
  };

  if (listId && isLoadingList) {
    return (
      <div className="space-y-4 py-10 px-5 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (listId && loadError) {
    return (
      <div className="py-10 px-5">
        <p className="text-center text-sm text-destructive">{loadError}</p>
      </div>
    );
  }

  return (
    // pb-28/pb-40 reserves space so the fixed pool doesn't overlap content
    <div className="space-y-4 py-10 pb-28 sm:pb-40 px-5">
      <section className="space-y-10">
        <div className="space-y-3">
          <div className="*:flex-1 max-w-4xl text-center md:text-left space-y-4">
            <div className="w-fit flex items-center justify-center gap-2">
              <p className="text-xs sm:text-sm">
                {isLive && <LiveIndicator variant="pill" size="sm" />}{' '}
              </p>

              <p className="text-xs sm:text-sm font-grotesk">
                {list.startTime
                  ? getRelativeTime(list.startTime)
                  : 'Schedule TBA'}
              </p>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-sans font-semibold">
                {list.name}
              </h1>

              <h2 className="text-xl font-light font-sans text-muted-foreground">
                {list.description}
              </h2>
            </div>
          </div>

          <div>
            <ActionBar listId={list.id} onSubmitted={handleSubmitted} />
          </div>
        </div>

        <TierBoard
          tiers={tiers}
          board={board}
          entitiesById={entitiesById}
          draggableProps={draggableProps}
          dropzoneProps={dropzoneProps}
          activeEntityId={activeEntityId}
          overDestination={overDestination}
        />
      </section>

      {/* Entity Pool */}
      <EntityPool
        pool={pool}
        activeEntityId={activeEntityId}
        isOver={overDestination === 'POOL'}
        draggableProps={draggableProps}
        dropzoneProps={dropzoneProps}
      />
    </div>
  );
}
