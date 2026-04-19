import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useDragDrop } from '@/hooks/use-drag-drop';
import { useVoting } from '@/hooks/use-voting';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
import { SubmitBar } from '@/pages/voting/components/submit-bar';
import { TierBoard } from '@/pages/voting/components/tier-board';

export function VotingPage() {
  const { listId } = useParams();
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    list,
    tiers,
    board,
    pool,
    entitiesById,
    selectedCount,
    totalCount,
    minimumRequiredCount,
    canSubmit,
    moveEntity,
    resetBoard,
    buildVotePayload,
  } = useVoting(listId);

  const { activeEntityId, overDestination, draggableProps, dropzoneProps } =
    useDragDrop(moveEntity);
  const isPoolOver = overDestination === 'POOL';

  const poolCards = pool.map((entity) => (
    <EntityCard
      key={entity.id}
      entity={entity}
      className="w-fit"
      dragProps={draggableProps}
      isDragging={activeEntityId === entity.id}
    />
  ));

  const handleSubmit = () => {
    if (!canSubmit) {
      setSubmitMessage(
        `Add at least ${minimumRequiredCount} entities before submitting.`
      );
      return;
    }

    const payload = buildVotePayload('mock-user');
    console.log('Mock POST /vote payload', payload);

    const submittedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setSubmitMessage(
      `Submitted ${payload.length} vote placements at ${submittedAt}`
    );
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-0">
      <section className="">
        <div className="mb-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-foreground sm:text-base">
            {list.name}
          </p>
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

        <section
          data-destination="POOL"
          {...dropzoneProps}
          className={cn(
            'mt-4 hidden rounded-lg border border-border/90 p-3 transition-all sm:block sm:p-4',
            isPoolOver && 'border-primary/45 ring-2 ring-ring/45'
          )}
        >
          <div className="flex flex-wrap flex-row items-center gap-6">
            {poolCards}
          </div>
        </section>

        <div className="mt-4 flex justify-end">
          <SubmitBar
            selectedCount={selectedCount}
            totalCount={totalCount}
            minimumRequiredCount={minimumRequiredCount}
            disabled={!canSubmit}
            onSubmit={handleSubmit}
            onReset={resetBoard}
          />
        </div>
      </section>

      {submitMessage ? (
        <p className="rounded-xl border border-primary/35 bg-primary/12 px-3 py-2 text-xs font-medium text-primary">
          {submitMessage}
        </p>
      ) : null}

      <section
        data-destination="POOL"
        {...dropzoneProps}
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-sm sm:hidden',
          isPoolOver && 'border-primary/45 ring-2 ring-ring/45'
        )}
      >
        <div className="mx-auto max-w-7xl space-y-2">
          <p className="text-xs text-muted-foreground">
            Scroll horizontally to see the pool of entities.
          </p>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max items-center gap-3 pr-3">
              {poolCards}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
