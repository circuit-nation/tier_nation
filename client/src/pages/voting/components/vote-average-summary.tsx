import { useMemo } from 'react';
import { IconUsers } from '@tabler/icons-react';
import { TIER_ACCENT_BY_VALUE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EntityCard } from '@/pages/voting/components/entity-card';
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
  const visibleTiers = useMemo(() => {
    const usedTiers = tiers.filter(
      (tier) =>
        userBoard[tier.value].length > 0 ||
        communityBoard[tier.value].length > 0
    );
    return usedTiers.length > 0 ? usedTiers : tiers;
  }, [tiers, userBoard, communityBoard]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RankingColumn
        title="Your Ranking"
        tiers={visibleTiers}
        board={userBoard}
        entitiesById={entitiesById}
        headerBadge="FINALIZED"
      />
      <RankingColumn
        title="Community Avg"
        tiers={visibleTiers}
        board={communityBoard}
        entitiesById={entitiesById}
        totalVotes={totalVotes}
      />
    </div>
  );
}

type RankingColumnProps = {
  title: string;
  tiers: Tier[];
  board: TierBoardState;
  entitiesById: Record<string, Entity>;
  headerBadge?: string;
  totalVotes?: number;
};

function RankingColumn({
  title,
  tiers,
  board,
  entitiesById,
  headerBadge,
  totalVotes,
}: RankingColumnProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-sans text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          {headerBadge ? (
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-muted-foreground">
              {headerBadge}
            </span>
          ) : null}
        </div>
        {typeof totalVotes === 'number' ? (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <IconUsers className="size-4" />
            <span className="font-medium">
              {totalVotes.toLocaleString()} Votes
            </span>
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const entities = board[tier.value]
            .map((id) => entitiesById[id])
            .filter((entity): entity is Entity => Boolean(entity));

          return (
            <section
              key={tier.value}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="flex min-h-24">
                <div
                  className={cn(
                    'font-grotesk flex w-20 shrink-0 items-center justify-center text-5xl font-bold text-black',
                    TIER_ACCENT_BY_VALUE[tier.value]
                  )}
                >
                  {tier.label}
                </div>
                <div className="flex flex-1 flex-wrap items-center gap-2 p-3">
                  {entities.map((entity) => (
                    <EntityCard
                      key={entity.id}
                      entity={entity}
                      mode="compact"
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
