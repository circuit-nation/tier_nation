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
        'group flex w-full flex-col items-center gap-2 text-center transition-all rounded-md',
        'hover:bg-accent/20',
        isDragging && 'z-20 scale-[1.01] border-primary/55 bg-card shadow-lg ring-2 ring-ring/40',
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <div className="size-28 flex items-center justify-center overflow-hidden rounded-sm border border-border/80">
        <p className="line-clamp-2 text-xs font-semibold leading-tight tracking-wide text-foreground">{entity.name}</p>
      </div>
    </button>
  )
}
