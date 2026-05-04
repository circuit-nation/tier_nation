import { useState, useSyncExternalStore } from 'react';
import {
  formatTimeRemaining,
  getCountdownNowSnapshot,
  subscribeToCountdownClock,
} from '@/lib/countdown';
import { postVotes } from '@/lib/mock/votes';
import { validateVotePayload } from '@/lib/validation/voteSchema';
// import type { TierValue } from '@/types';
import { Button } from '@/components/ui/button';
import { IconRestore, IconShare } from '@tabler/icons-react';
import { SubmitButton } from '@/pages/voting/components/submit-button';
import { useVoting } from '@/hooks/use-voting';
import { Separator } from '@/components/ui/separator';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/ui/button-group';

type ActionBarProps = {
  listId: string;
};

export default function ActionBar({ listId }: ActionBarProps) {
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nowMs = useSyncExternalStore(
    subscribeToCountdownClock,
    getCountdownNowSnapshot
  );

  const {
    list,
    selectedCount,
    totalCount,
    minimumRequiredCount,
    canSubmit,
    resetBoard,
    buildVotePayload,
  } = useVoting(listId);
  const countdownLabel = formatTimeRemaining(list.endTime, nowMs);

  // const tierScores = useMemo(() => {
  //   const scoreMap = {
  //     S: 0,
  //     A: 0,
  //     B: 0,
  //     C: 0,
  //     D: 0,
  //     E: 0,
  //     F: 0,
  //   } satisfies Record<TierValue, number>;
  //   for (const tier of list.tiers) scoreMap[tier.value] = tier.score;
  //   return scoreMap;
  // }, [list.tiers]);

  // const maxTierScore = useMemo(
  //   () => Math.max(...list.tiers.map((t) => t.score), 0),
  //   [list.tiers]
  // );

  const handleSubmit = async () => {
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

  return (
    <div className="space-y-2">
      <Separator orientation="horizontal" />
      <section>
        <div className="flex flex-row items-center justify-between gap-3">
          {countdownLabel && (
            <p className="tabular-nums font-grotesk text-muted-foreground">
              {countdownLabel}
            </p>
          )}
          <div className="flex flex-row gap-2">
            <Button variant="outline" size="icon-lg">
              <IconShare />
            </Button>
            <ButtonGroup className="rounded-sm">
              <Button variant="outline" size="lg" onClick={resetBoard}>
                <IconRestore /> Reset
              </Button>
              <ButtonGroupSeparator />
              <SubmitButton
                selectedCount={selectedCount}
                totalCount={totalCount}
                minimumRequiredCount={minimumRequiredCount}
                disabled={!canSubmit}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </ButtonGroup>
          </div>
        </div>
      </section>

      {submitMessage && (
        <p className="text-xs font-medium text-primary">
          {submitMessage}
        </p>
      )}
      {submitError && (
        <p className="text-xs font-medium text-red-500">
          {submitError}
        </p>
      )}
    </div>
  );
}
