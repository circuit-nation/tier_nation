import { Link } from 'react-router-dom'

import type { List } from '@/types'

type LiveVotingCardProps = {
  list: List
}

export function LiveVotingCard({ list }: LiveVotingCardProps) {
  return (
    <section className="">
        <Link
          to={`/voting/${list.id}`}
          className="group flex min-h-44 items-center justify-center rounded-3xl border border-border/90 bg-card/45 px-4 text-center transition-colors hover:bg-card/65"
        >
          <span className="inline-flex items-center gap-3 text-2xl font-semibold text-foreground sm:text-4xl">
            <span className="inline-flex size-3.5 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)] sm:size-4" aria-hidden />
            Live Voting
            {/* Name of the list */}
          </span>
        </Link>
    </section>
  )
}
