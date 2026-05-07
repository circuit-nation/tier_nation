import { useMemo, useState, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import type { Entity } from '@/types';

type EntityCardProps = {
  entity: Entity;
  className?: string;
  mode?: 'default' | 'compact';
  isDragging?: boolean;
  dragProps?: Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'draggable' | 'onDragStart' | 'onDragEnd'
  >;
};

export function EntityCard({
  entity,
  className,
  mode = 'default',
  isDragging = false,
  dragProps,
}: EntityCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const isCompact = mode === 'compact';

  const fallbackLabel = useMemo(() => {
    const parts = entity.name.split(' ').filter(Boolean);
    if (isCompact) {
      const source = parts[parts.length - 1] ?? entity.name;
      return source.slice(0, 3).toUpperCase();
    }

    return parts
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [entity.name, isCompact]);

  const showImage =
    Boolean(entity.imageUrl) && failedImageUrl !== entity.imageUrl;

  return (
    <button
      type="button"
      data-entity-id={entity.id}
      className={cn(
        'group flex flex-col items-center justify-center gap-1',
        dragProps?.draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'z-20 shadow-lg',
        className
      )}
      {...dragProps}
    >
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-sm border border-border/80 bg-muted/25',
          'size-12 md:size-24'
        )}
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

      {!isCompact && (
        <p className="text-xs sm:text-sm text-center font-medium text-foreground wrap-break-word line-clamp-1">
          {entity.name}
        </p>
      )}
    </button>
  );
}
