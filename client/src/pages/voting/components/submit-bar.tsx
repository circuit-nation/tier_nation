import { IconRefresh, IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SubmitBarProps = {
  selectedCount: number
  totalCount: number
  minimumRequiredCount: number
  disabled: boolean
  onSubmit: () => void
  onReset: () => void
}

export function SubmitBar({ selectedCount, totalCount, minimumRequiredCount, disabled, onSubmit, onReset }: SubmitBarProps) {
  const meetsMinimum = selectedCount >= minimumRequiredCount

  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border/90 bg-card/80 p-1.5 shadow-md shadow-black/25">
      <p className={cn('px-2 text-[0.68rem] font-medium text-muted-foreground', meetsMinimum && 'text-primary')}>
        {selectedCount}/{totalCount} (min {minimumRequiredCount})
      </p>
      <Button variant="outline" onClick={onReset} className="rounded-xl border-border/80">
        <IconRefresh className="size-3.5" stroke={1.8} />
        Reset
      </Button>
      <Button onClick={onSubmit} disabled={disabled} className="rounded-xl">
        <IconSend2 className="size-3.5" stroke={1.8} />
        Submit
      </Button>
    </div>
  )
}
