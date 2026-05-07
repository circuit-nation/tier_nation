import type {
  NativeDraggableProps,
  NativeDropzoneProps,
} from '@/hooks/use-drag-drop';
import { TIER_ACCENT_BY_VALUE, TIER_BORDER_BY_VALUE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
import type { Entity, Tier } from '@/types';

type TierRowProps = {
  tier: Tier;
  entities: Entity[];
  draggableProps?: NativeDraggableProps;
  dropzoneProps?: NativeDropzoneProps;
  activeEntityId?: string | null;
  isOver?: boolean;
  emptyMessage?: string;
};

export function TierRow({
  tier,
  entities,
  draggableProps,
  dropzoneProps,
  activeEntityId,
  isOver = false,
  emptyMessage = 'Drop items here',
}: TierRowProps) {
  return (
    <section
      data-destination={dropzoneProps ? tier.value : undefined}
      {...(dropzoneProps ?? {})}
      className={cn('rounded-md transition-all ')}
    >
      <div className={cn(`flex max-h-48 sm:max-h-72`)}>
        <div
          className={cn(
            `aspect-square w-16 md:w-28`,
            `text-center text-2xl md:text-4xl text-black font-bold font-grotesk flex items-center justify-center`,
            `rounded-tl-md rounded-bl-md`,
            TIER_ACCENT_BY_VALUE[tier.value]
          )}
        >
          {tier.label}
        </div>

        {/* Entity Dropzone */}
        <div
          className={cn(
            `flex-1`,
            `border border-border/80 p-2 overflow-y-auto rounded-r-md`,
            isOver && TIER_BORDER_BY_VALUE[tier.value]
          )}
        >
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                mode="compact"
                dragProps={draggableProps}
                isDragging={activeEntityId === entity.id}
              />
            ))}
          </div>

          {entities.length === 0 ? (
            <p className="flex items-center justify-center h-full text-xs sm:text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
