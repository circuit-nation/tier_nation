import { useState, useSyncExternalStore } from 'react';
import {
  formatTimeRemaining,
  getCountdownNowSnapshot,
  subscribeToCountdownClock,
} from '@/lib/countdown';
import { postVotes } from '@/lib/mock/votes';
import { validateVotePayload } from '@/lib/validation/voteSchema';
import type { Vote } from '@/types';
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
  onSubmitted?: (payload: Vote[]) => void | Promise<void>;
};

export default function ActionBar({ listId, onSubmitted }: ActionBarProps) {
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
      await onSubmitted?.(payload);
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
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
