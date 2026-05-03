import { useMemo, useState, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import type { Entity } from '@/types';

type EntityCardProps = {
  entity: Entity;
  className?: string;
  isDragging?: boolean;
  dragProps?: Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'draggable' | 'onDragStart' | 'onDragEnd'
  >;
};

export function EntityCard({
  entity,
  className,
  isDragging = false,
  dragProps,
}: EntityCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const fallbackLabel = useMemo(() => {
    return entity.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [entity.name]);

  const showImage =
    Boolean(entity.imageUrl) && failedImageUrl !== entity.imageUrl;

  return (
    <button
      type="button"
      data-entity-id={entity.id}
      className={cn(
        'group flex w-full flex-col items-center gap-2 text-center transition-all rounded-md',
        dragProps?.draggable && 'cursor-grab active:cursor-grabbing',
        isDragging &&
          'z-20 scale-[1.01] border-primary/55 bg-card shadow-lg',
        className
      )}
      {...dragProps}
    >
      <div
        className={`size-14 md:size-24 flex items-center justify-center overflow-hidden rounded-sm border border-border/80 bg-muted/25`}
      >
        {showImage ? (
          <img
            src={entity.imageUrl}
            alt={`${entity.name} avatar`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailedImageUrl(entity.imageUrl ?? null)}
          />
        ) : (
          <p className="text-lg font-semibold tracking-wide text-foreground">
            {fallbackLabel}
          </p>
        )}
      </div>
      <p className="line-clamp-2 text-xs font-semibold text-foreground">
        {entity.name}
      </p>
    </button>
  );
}
