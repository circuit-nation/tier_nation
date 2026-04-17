import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'
import type { Entity, TierValue } from '@/types'

type DriverCardProps = {
  entity: Entity
  source: TierValue | 'POOL'
  draggable?: boolean
  className?: string
}

const getAvatarUrl = (entity: Entity) =>
  entity.imageUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(entity.name)}`

export function DriverCard({ entity, source, draggable = true, className }: DriverCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entity.id,
    data: { source },
    disabled: !draggable,
  })

  const style: CSSProperties | undefined = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={cn(
        'group flex w-full flex-col items-center gap-2 text-center transition-all rounded-md p-0.5',
        'hover:bg-accent/20',
        isDragging && 'z-20 scale-[1.01] border-primary/55 bg-card shadow-lg ring-2 ring-ring/40',
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <div className="size-14 overflow-hidden rounded-sm border border-border/80 bg-background/40 sm:size-18">
        <img src={getAvatarUrl(entity)} alt={entity.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <p className="line-clamp-2 min-h-7 text-[0.68rem] font-semibold leading-tight tracking-wide text-foreground">{entity.name}</p>
    </button>
  )
}
