import { useParams } from 'react-router-dom';

import { useDragDrop } from '@/hooks/use-drag-drop';
import { useVoting } from '@/hooks/use-voting';
import { EntityPool } from '@/pages/voting/components/entity-pool';
import { TierBoard } from '@/pages/voting/components/tier-board';

import { getRelativeTime } from '@/lib/utils';
import LiveIndicator from '@/components/ui/live-dot';
import ActionBar from './components/action-bar';

export function VotingPage() {
  const { listId } = useParams();

  const { list, tiers, board, pool, entitiesById, moveEntity } =
    useVoting(listId);

  const { activeEntityId, overDestination, draggableProps, dropzoneProps } =
    useDragDrop(moveEntity);

  const isLive =
    new Date() > new Date(list.startTime) &&
    new Date() < new Date(list.endTime);

  return (
    // pb-28/pb-40 reserves space so the fixed pool doesn't overlap content
    <div className="space-y-4 pb-28 sm:pb-40">
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="flex-1 max-w-4xl text-center md:text-left space-y-4">
            <p className="text-sm font-grotesk">
              {isLive && <LiveIndicator variant="pill" size="sm" />}{' '}
              {getRelativeTime(list.startTime)}
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
          <div>
            <ActionBar listId={listId} />
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
