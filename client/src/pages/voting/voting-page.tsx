import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useDragDrop } from '@/hooks/use-drag-drop';
import { useVoting } from '@/hooks/use-voting';
import {
  calculateEntityAverageRankings,
  calculateVoteAverages,
  getVotesByList,
  postVotes,
  type EntityAverageRanking,
  type VoteAverages,
} from '@/lib/mock/votes';
import { EntityPool } from '@/pages/voting/components/entity-pool';
import { SubmitButton } from '@/pages/voting/components/submit-button';
import { TierBoard } from '@/pages/voting/components/tier-board';
import { VoteAverageSummary } from '@/pages/voting/components/vote-average-summary';
import { validateVotePayload } from '@/lib/validation/voteSchema';
import type { TierValue } from '@/types';
import { Button } from '@/components/ui/button';
import { IconRestore, IconShare } from '@tabler/icons-react';
import { getRelativeTime } from '@/lib/utils';

export function VotingPage() {
  const { listId } = useParams();
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteAverages, setVoteAverages] = useState<VoteAverages | null>(null);
  const [entityRankings, setEntityRankings] = useState<EntityAverageRanking[]>(
    []
  );

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

  const tierScores = useMemo(() => {
    const scoreMap = {
      S: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    } satisfies Record<TierValue, number>;
    for (const tier of list.tiers) scoreMap[tier.value] = tier.score;
    return scoreMap;
  }, [list.tiers]);

  const maxTierScore = useMemo(
    () => Math.max(...list.tiers.map((t) => t.score), 0),
    [list.tiers]
  );

  const handleSubmit = async () => {
    setVoteAverages(null);
    setEntityRankings([]);

    if (!canSubmit) {
      setSubmitMessage(
        `Add at least ${minimumRequiredCount} entities before submitting.`
      );
      return;
    }

    const payload = buildVotePayload('mock-user');
    try {
      validateVotePayload(payload);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Validation error');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await postVotes(payload);
      const allVotes = await getVotesByList(list.id);
      setVoteAverages(calculateVoteAverages(allVotes, tierScores));
      setEntityRankings(calculateEntityAverageRankings(allVotes, tierScores));
      const submittedAt = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSubmitMessage(
        `Submitted ${payload.length} vote placements at ${submittedAt}`
      );
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastEnd = new Date() > new Date(list.endTime);

  return (
    // pb-28/pb-40 reserves space so the fixed pool doesn't overlap content
    <div className="space-y-4 pb-28 sm:pb-40">
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-y-4">
          <div className="flex-1 max-w-4xl text-center md:text-left">
            <p className="text-xs font-grotesk text-muted-foreground">{isPastEnd && <span className="text-red-500">Ended</span>} {getRelativeTime(list.endTime)}</p>
            <p className="text-4xl md:text-5xl font-sans font-semibold">
              {list.name}
            </p>
            <p className="text-lg font-medium font-grotesk text-muted-foreground">
              {list.description}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="ghost" size="lg" onClick={resetBoard}>
              <IconRestore /> Reset
            </Button>
            <Button variant="ghost" size="lg">
              <IconShare /> Share List
            </Button>
            <SubmitButton
              selectedCount={selectedCount}
              totalCount={totalCount}
              minimumRequiredCount={minimumRequiredCount}
              disabled={!canSubmit}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
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

      {submitMessage && (
        <p className="rounded-xl border border-primary/35 bg-primary/12 px-3 py-2 text-xs font-medium text-primary">
          {submitMessage}
        </p>
      )}
      {voteAverages && (
        <VoteAverageSummary
          averages={voteAverages}
          entityRankings={entityRankings}
          tiers={tiers}
          entitiesById={entitiesById}
          maxScore={maxTierScore}
        />
      )}
      {submitError && (
        <p className="rounded-xl border border-primary/35 bg-primary/12 px-3 py-2 text-xs font-medium text-red-500">
          {submitError}
        </p>
      )}

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
