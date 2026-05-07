import { IconUsers } from '@tabler/icons-react';
import { TierBoard } from '@/pages/voting/components/tier-board';
import type { Entity, Tier, TierBoardState } from '@/types';

type VoteAverageSummaryProps = {
  tiers: Tier[];
  entitiesById: Record<string, Entity>;
  userBoard: TierBoardState;
  communityBoard: TierBoardState;
  totalVotes: number;
};

export function VoteAverageSummary({
  tiers,
  entitiesById,
  userBoard,
  communityBoard,
  totalVotes,
}: VoteAverageSummaryProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-3xl font-semibold tracking-tight">
              Your Votes
            </h2>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-muted-foreground">
              FINALIZED
            </span>
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
        <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
          <h2 className="font-sans text-3xl font-semibold tracking-tight">
            Community Avg
          </h2>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <IconUsers className="size-4" />
            <span className="font-medium">
              {totalVotes.toLocaleString()} Votes
            </span>
          </p>
        </div>

        <TierBoard
          tiers={tiers}
          board={communityBoard}
          entitiesById={entitiesById}
          emptyMessage="No votes in this tier yet"
        />
      </section>
    </div>
  );
}
