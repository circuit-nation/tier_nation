import { useState, useSyncExternalStore } from 'react';
import {
  getCountdownNowSnapshot,
  getTimeRemainingParts,
  subscribeToCountdownClock,
} from '@/lib/countdown';
import { createSubmission } from '@/lib/api/submissions';
import { postVotes } from '@/lib/api/votes';
import { useAuth } from '@/hooks/use-auth';
import type { Vote } from '@/types';
import { Button } from '@/components/ui/button';
import { IconRestore, IconShare } from '@tabler/icons-react';
import { SubmitButton } from '@/pages/voting/components/submit-button';
import { useVoting } from '@/hooks/use-voting';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type ActionBarProps = {
  listId: string;
  onSubmitted?: (payload: Vote[]) => void | Promise<void>;
};

export default function ActionBar({ listId, onSubmitted }: ActionBarProps) {
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken, user, isAuthenticated, isAnonymous } = useAuth();
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
    buildApiVoteLines,
  } = useVoting(listId);
  const timeRemaining = getTimeRemainingParts(list.endTime, nowMs);
  const isLessThanOneHour =
    timeRemaining !== null &&
    timeRemaining.days === '00' &&
    timeRemaining.hours === '00';
  const countdownUnits = timeRemaining
    ? [
        {
          key: 'days',
          label: 'DAYS',
          value: timeRemaining.days,
        },
        {
          key: 'hours',
          label: 'HRS',
          value: timeRemaining.hours,
        },
        {
          key: 'minutes',
          label: 'MIN',
          value: timeRemaining.minutes,
        },
        {
          key: 'seconds',
          label: 'SEC',
          value: timeRemaining.seconds,
        },
      ]
    : [];

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitMessage(
        `Add at least ${minimumRequiredCount} entities before submitting.`
      );
      return;
    }

    if (!isAuthenticated || !accessToken || !user) {
      setSubmitError('Sign in to submit your votes.');
      return;
    }

    let lines: ReturnType<typeof buildApiVoteLines>;
    try {
      lines = buildApiVoteLines();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Validation error');
      return;
    }

    const payload = buildVotePayload(user.id);

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createSubmission(
        { listId: list.id, isAnonymous },
        accessToken
      );
      await postVotes(
        {
          listId: list.id,
          isAnonymous,
          votes: lines,
        },
        accessToken
      );

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
      <section className="py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {timeRemaining && (
            <div className="flex items-center gap-2 font-grotesk">
              <div className="flex flex-row items-center gap-2 justify-center">
                {timeRemaining.isClosed ? (
                  <p>Voting closed:</p>
                ) : (
                  <p>Time remaining:</p>
                )}
                <div className="flex flex-row items-center gap-1">
                  {countdownUnits.map((unit) => (
                    <div
                      key={unit.key}
                      className={cn(
                        'flex min-w-12 flex-row gap-x-0.5 items-end rounded-md px-2 py-1 font-sans tabular-nums',
                        `${isLessThanOneHour ? 'bg-destructive/40' : 'bg-white/20'}`
                      )}
                    >
                      <p className="text-base leading-none font-medium">
                        {unit.value}
                      </p>

                      <p className="text-xs font-light leading-none tracking-wide lowercase">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {timeRemaining !== null && !timeRemaining.isClosed && (
            <div className="flex flex-row gap-2">
              <Button variant="ghost" size="icon-lg">
                <IconShare />
              </Button>
              <Button variant="secondary" size="lg" onClick={resetBoard}>
                <IconRestore /> Reset
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
          )}
        </div>
      </section>

      {submitMessage && (
        <p className="text-xs font-medium text-primary">{submitMessage}</p>
      )}
      {submitError && (
        <p className="text-xs font-medium text-red-500">{submitError}</p>
      )}
    </div>
  );
}
