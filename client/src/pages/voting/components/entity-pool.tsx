import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
import { Button } from '@/components/ui/button';
import {
  IconCheck,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from '@tabler/icons-react';
import type {
  NativeDraggableProps,
  NativeDropzoneProps,
} from '@/hooks/use-drag-drop';
import type { PoolEntity } from '@/types';

interface EntityPoolProps {
  pool: PoolEntity[];
  activeEntityId: string | null;
  isOver: boolean;
  draggableProps: NativeDraggableProps;
  dropzoneProps: NativeDropzoneProps;
}

type SortOrder = 'default' | 'asc' | 'desc';

export function EntityPool({
  pool,
  activeEntityId,
  isOver,
  draggableProps,
  dropzoneProps,
}: EntityPoolProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

  const remainingCount = pool.filter((e) => !e.placed).length;

  const sortedPool = useMemo(() => {
    const sorted =
      sortOrder === 'default'
        ? [...pool]
        : [...pool].sort((a, b) =>
            sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name)
          );

    return sorted.sort((a, b) => Number(a.placed) - Number(b.placed));
  }, [pool, sortOrder]);

  function cycleSort() {
    setSortOrder((prev) =>
      prev === 'default' ? 'asc' : prev === 'asc' ? 'desc' : 'default'
    );
  }

  return (
    <div
      data-destination="POOL"
      {...dropzoneProps}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40',
        'border-t border-border/80 bg-card/95 backdrop-blur-sm',
        'transition-colors duration-150',
        isOver && 'border-primary/45 ring-2 ring-ring/45'
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {/* Toolbar */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {remainingCount === 0
              ? 'All entities placed'
              : `${remainingCount} remaining`}
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={cycleSort}
            className={cn(
              'h-7 gap-1.5 px-2 text-xs',
              sortOrder !== 'default' &&
                'bg-primary/10 text-primary hover:bg-primary/15'
            )}
          >
            {sortOrder === 'desc' ? (
              <IconSortDescendingLetters size={14} />
            ) : (
              <IconSortAscendingLetters size={14} />
            )}
            {sortOrder === 'desc' ? 'Z–A' : 'A–Z'}
          </Button>
        </div>

        {/* Scrollable strip */}
        <div className="relative overflow-x-auto">
          <div className="flex min-w-max items-center gap-3 pr-2">
            {sortedPool.map((entity) => (
              <div key={entity.id} className="relative shrink-0">
                <EntityCard
                  entity={entity}
                  className={cn(
                    entity.placed && 'opacity-40'
                  )}
                  dragProps={entity.placed ? undefined : draggableProps}
                  isDragging={activeEntityId === entity.id}
                />

                {/* Placed checkmark overlay */}
                {entity.placed && (
                  <div className="pointer-events-none absolute top-4 sm:top-8 inset-x-0 flex items-center justify-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <IconCheck size={14} stroke={2.5} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
