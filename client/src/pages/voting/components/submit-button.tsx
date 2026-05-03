import { IconRefresh, IconSend2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  selectedCount: number;
  totalCount: number;
  minimumRequiredCount: number;
  disabled: boolean;
  isSubmitting?: boolean;
  onSubmit: () => void;
};

export function SubmitButton({
  selectedCount,
  totalCount,
  minimumRequiredCount,
  disabled,
  isSubmitting = false,
  onSubmit,
}: SubmitButtonProps) {
  const canSubmit = selectedCount >= minimumRequiredCount && totalCount > 0;
  
  return (
    <Button
      onClick={onSubmit}
      disabled={disabled || isSubmitting || !canSubmit}
      variant="default"
      size="lg"
    >
      {isSubmitting ? (
        <IconRefresh className="animate-spin" />
      ) : (
        <IconSend2 />
      )}
      {isSubmitting ? 'Submitting…' : 'Submit'}
    </Button>
  );
}
