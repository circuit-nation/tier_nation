import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'
import type { Entity } from '@/types'

type DriverCardProps = {
  entity: Entity
  className?: string
  isDragging?: boolean
  dragProps?: Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'draggable' | 'onDragStart' | 'onDragEnd'>
}

export function DriverCard({ entity, className, isDragging = false, dragProps }: DriverCardProps) {
  return (
    <button
      type="button"
      data-entity-id={entity.id}
      className={cn(
        'group flex w-full flex-col items-center gap-2 text-center transition-all rounded-md',
        'hover:bg-accent/20',
        dragProps?.draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'z-20 scale-[1.01] border-primary/55 bg-card shadow-lg ring-2 ring-ring/40',
        className,
      )}
      {...dragProps}
    >
      <div className={`size-12 sm:size-16 md:size-20 p-2 flex items-center justify-center overflow-hidden rounded-sm border border-border/80`}>
        <p className="line-clamp-2 text-xs font-semibold leading-tight tracking-wide text-foreground">{entity.name}</p>
      </div>
    </button>
  )
}
