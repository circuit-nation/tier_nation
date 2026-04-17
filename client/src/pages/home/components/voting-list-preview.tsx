import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { List } from '@/types'

type VotingListPreviewProps = {
  list: List
}

export function VotingListPreview({ list }: VotingListPreviewProps) {
  const isLocked = list.isLocked

  const content = (
    <div
      className={cn(
        'group flex h-full w-full flex-col justify-between px-2 py-1 text-left transition-colors',
        isLocked ? 'opacity-55 cursor-not-allowed' : 'hover:bg-background/45',
      )}
    >
      <div className="inline-flex size-2 rounded-full bg-primary" aria-hidden />
      <div>
        <p className="line-clamp-2 text-xs font-semibold tracking-wide text-foreground">{list.name}</p>
        <p className="mt-1 text-[0.65rem] text-muted-foreground">{isLocked ? 'Locked' : 'Open'}</p>
      </div>
    </div>
  )

  return (
    <section className="aspect-square rounded-4xl border border-border/95 bg-card/45 p-2.5">
      {isLocked ? content : <Link to={`/voting/${list.id}`} className="block h-full">{content}</Link>}
    </section>
  )
}
