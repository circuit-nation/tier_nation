import { useState, useMemo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
import { Button } from '@/components/ui/button';
import {
  IconCheck,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconChevronLeft,
  IconChevronRight,
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

const SCROLL_AMOUNT = 240;

export function EntityPool({
  pool,
  activeEntityId,
  isOver,
  draggableProps,
  dropzoneProps,
}: EntityPoolProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  function updateGradients(el: HTMLDivElement) {
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft + clientWidth < scrollWidth - 1);
  }

  const scrollContainerCallbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollContainerRef.current = el;
      if (el) updateGradients(el);
    },
    []
  );

  function scrollBy(direction: 'left' | 'right') {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  }

  return (
    <div
      data-destination="POOL"
      {...dropzoneProps}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40',
        'border-t border-primary/60 bg-background',
        isOver && 'border-primary'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-3">
        {/* Toolbar */}
        <div className="mb-2 flex items-center justify-end gap-2">
          <p className="text-sm sm:text-base tabular-nums">
            {remainingCount === 0
              ? 'All items ranked'
              : `${remainingCount}/${pool.length} remaining`}
          </p>

          <p className="text-lg font-black opacity-80">·</p>

          <Button
            variant="secondary"
            size="default"
            onClick={cycleSort}
            className={cn(
              'h-7 gap-1.5 px-2 text-xs sm:text-sm',
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
        <div className="relative">
          {/* Left gradient + scroll button */}
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center',
              'transition-opacity duration-200',
              showLeftGradient ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="absolute inset-y-0 left-0 w-14 bg-linear-to-r from-background to-transparent" />
            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll left"
              onClick={() => scrollBy('left')}
              className="mb-4 -ml-4 pointer-events-auto relative z-10 size-8 sm:size-10 rounded-full shadow-sm bg-background"
            >
              <IconChevronLeft size={14} />
            </Button>
          </div>

          {/* Right gradient + scroll button */}
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center justify-end',
              'transition-opacity duration-200',
              showRightGradient ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="absolute inset-y-0 right-0 w-14 bg-linear-to-l from-background to-transparent" />
            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll right"
              onClick={() => scrollBy('right')}
              className="mb-4 -mr-4 pointer-events-auto relative z-10 size-8 sm:size-10 rounded-full shadow-sm bg-background"
            >
              <IconChevronRight size={14} />
            </Button>
          </div>

          <div
            ref={scrollContainerCallbackRef}
            onScroll={(e) => updateGradients(e.currentTarget)}
            className="overflow-x-auto no-scrollbar"
          >
            <div className="relative flex flex-row gap-2">
              {sortedPool.map((entity) => (
                <div key={entity.id} className="relative">
                  <EntityCard
                    entity={entity}
                    className={cn(entity.placed && 'opacity-40')}
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

        <p className="mt-4 text-xs sm:text-sm text-muted-foreground text-center">
          Use buttons or scroll to select items.
        </p>
      </div>
    </div>
  );
}
