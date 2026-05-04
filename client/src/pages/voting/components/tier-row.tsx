import type {
  NativeDraggableProps,
  NativeDropzoneProps,
} from '@/hooks/use-drag-drop';
import { TIER_ACCENT_BY_VALUE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
import type { Entity, Tier } from '@/types';

type TierRowProps = {
  tier: Tier;
  entities: Entity[];
  draggableProps: NativeDraggableProps;
  dropzoneProps: NativeDropzoneProps;
  activeEntityId: string | null;
  isOver: boolean;
};

export function TierRow({
  tier,
  entities,
  draggableProps,
  dropzoneProps,
  activeEntityId,
  isOver,
}: TierRowProps) {
  return (
    <section
      data-destination={tier.value}
      {...dropzoneProps}
      className={cn(
        'rounded-md transition-all ',
        isOver && 'ring-2 ring-ring/55'
      )}
    >
      <div className={cn(`flex max-h-48 sm:max-h-72`)}>
        <div
          className={cn(
            `aspect-square w-16 md:w-28 `,
            `text-center text-2xl md:text-4xl text-black font-bold font-grotesk flex items-center justify-center`,
            `rounded-tl-md rounded-bl-md`,
            TIER_ACCENT_BY_VALUE[tier.value]
          )}
        >
          {tier.label}
        </div>

        {/* Entity Dropzone */}
        <div
          className={cn(`flex-1`, `border border-muted p-2.5 overflow-y-auto`)}
        >
          <div className="flex flex-wrap gap-0.5">
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
            <p className="flex items-center justify-center h-full text-xs sm:text-sm font-medium text-muted-foreground">
              Drop entities here
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
