import type {
  NativeDraggableProps,
  NativeDropzoneProps,
} from '@/hooks/use-drag-drop';
import { TierRow } from '@/pages/voting/components/tier-row';
import type { BoardDestination } from '@/store/voting-store';
import type { Entity, Tier, TierBoardState } from '@/types';

type TierBoardProps = {
  tiers: Tier[];
  board: TierBoardState;
  entitiesById: Record<string, Entity>;
  draggableProps?: NativeDraggableProps;
  dropzoneProps?: NativeDropzoneProps;
  activeEntityId?: string | null;
  selectedEntityId?: string | null;
  overDestination?: BoardDestination | null;
  emptyMessage?: string;
};

export function TierBoard({
  tiers,
  board,
  entitiesById,
  draggableProps,
  dropzoneProps,
  activeEntityId,
  selectedEntityId,
  overDestination,
  emptyMessage,
}: TierBoardProps) {
  return (
    <div className="space-y-2">
      {tiers.map((tier) => {
        const entities = board[tier.value]
          .map((id) => entitiesById[id])
          .filter((entity): entity is Entity => Boolean(entity));

        return (
          <TierRow
            key={tier.value}
            tier={tier}
            entities={entities}
            draggableProps={draggableProps}
            dropzoneProps={dropzoneProps}
            activeEntityId={activeEntityId}
            selectedEntityId={selectedEntityId}
            isOver={overDestination === tier.value}
            emptyMessage={emptyMessage}
          />
        );
      })}
    </div>
  );
}
