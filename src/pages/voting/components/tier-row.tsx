import { useDroppable } from '@dnd-kit/core'

import { TIER_ACCENT_BY_VALUE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { DriverCard } from '@/pages/voting/components/driver-card'
import type { Entity, Tier } from '@/types'

type TierRowProps = {
  tier: Tier
  entities: Entity[]
}

export function TierRow({ tier, entities }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier.value}`,
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'rounded-md border-2 p-2.5 transition-all',
        TIER_ACCENT_BY_VALUE[tier.value],
        isOver && 'ring-2 ring-ring/55',
      )}
    >
      <div className="flex flex-row gap-2 items-center">
        <div className="inline-flex h-full items-center justify-center rounded-sm text-2xl font-black tracking-wide sm:w-16 sm:text-6xl">
          {tier.label}
        </div>

        <div className="flex-1 rounded-sm">
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <DriverCard key={entity.id} entity={entity} source={tier.value} className="w-22 sm:w-24" />
            ))}
          </div>

          {entities.length === 0 ? (
            <p className="flex min-h-20 items-center justify-center rounded-sm bg-background/25 px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Drop drivers here
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
