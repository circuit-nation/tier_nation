import type { NativeDraggableProps, NativeDropzoneProps } from '@/hooks/use-drag-drop'
import { TIER_ACCENT_BY_VALUE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { DriverCard } from '@/pages/voting/components/entity-card'
import type { Entity, Tier } from '@/types'

type TierRowProps = {
  tier: Tier
  entities: Entity[]
  draggableProps: NativeDraggableProps
  dropzoneProps: NativeDropzoneProps
  activeEntityId: string | null
  isOver: boolean
}

export function TierRow({ tier, entities, draggableProps, dropzoneProps, activeEntityId, isOver }: TierRowProps) {
  return (
    <section
      data-destination={tier.value}
      {...dropzoneProps}
      className={cn(
        'rounded-md transition-all',
        isOver && 'ring-2 ring-ring/55',
      )}
    >
      <div className={cn(
        `flex min-h-16 sm:min-h-20 md:min-h-24`
      )}>
        <div
          className={cn(
            `aspect-square w-16 sm:w-20 md:w-24`,
            `text-center text-xl md:text-2xl text-black font-bold flex items-center justify-center`,
            TIER_ACCENT_BY_VALUE[tier.value],
          )}
        >
          {tier.label}
        </div>

        <div className={cn(
          `flex-1`,
          `border border-muted p-1`,
        )}>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <DriverCard
                key={entity.id}
                entity={entity}
                className="w-22 sm:w-24"
                dragProps={draggableProps}
                isDragging={activeEntityId === entity.id}
              />
            ))}
          </div>

          {entities.length === 0 ? (
            <p className="flex items-center justify-center h-full text-xs font-medium text-muted-foreground">
              Drop entities here
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
