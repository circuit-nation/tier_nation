import type { ReactNode } from 'react';
import { IconUsers } from '@tabler/icons-react';
import { TierBoard } from '@/pages/voting/components/tier-board';
import type { Entity, Tier, TierBoardState } from '@/types';
import { Badge } from '@/components/ui/badge';

type VoteAverageSummaryProps = {
  tiers: Tier[];
  entitiesById: Record<string, Entity>;
  userBoard: TierBoardState;
  communityBoard: TierBoardState;
  totalVotes: number;
  communityHidden?: boolean;
  communityMessage?: string | null;
  communityAction?: ReactNode;
};

export function VoteAverageSummary({
  tiers,
  entitiesById,
  userBoard,
  communityBoard,
  totalVotes,
  communityHidden = false,
  communityMessage,
  communityAction,
}: VoteAverageSummaryProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center justify-between w-full gap-3">
            <h2 className="font-sans text-2xl font-semibold tracking-tight">
              Your Votes
            </h2>
            <Badge className="text-base">FINALIZED</Badge>
          </div>
        </div>

        <TierBoard
          tiers={tiers}
          board={userBoard}
          entitiesById={entitiesById}
          emptyMessage="No vote placed in this tier"
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3">
          <h2 className="font-sans text-2xl font-semibold tracking-tight">
            Community Avg
          </h2>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <IconUsers className="size-4" />
            <span className="font-medium">
              {totalVotes.toLocaleString()} Voters
            </span>
          </p>
        </div>

        {communityHidden ? (
          <div className="relative rounded-xl border border-dashed border-border p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {communityMessage ?? 'Community results are not available yet.'}
            </p>
            {communityAction}
            <div className="pointer-events-none select-none opacity-30 blur-sm">
              <TierBoard
                tiers={tiers}
                board={communityBoard}
                entitiesById={entitiesById}
                emptyMessage="No votes in this tier"
              />
            </div>
          </div>
        ) : (
          <TierBoard
            tiers={tiers}
            board={communityBoard}
            entitiesById={entitiesById}
            emptyMessage="No votes in this tier"
          />
        )}
      </section>
    </div>
  );
}
