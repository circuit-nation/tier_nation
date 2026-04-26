import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TIER_ACCENT_BY_VALUE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { EntityAverageRanking, VoteAverages } from '@/lib/mock/votes';
import type { Entity, Tier } from '@/types';

type VoteAverageSummaryProps = {
  averages: VoteAverages;
  entityRankings: EntityAverageRanking[];
  tiers: Tier[];
  entitiesById: Record<string, Entity>;
  maxScore: number;
};

export function VoteAverageSummary({
  averages,
  entityRankings,
  tiers,
  entitiesById,
  maxScore,
}: VoteAverageSummaryProps) {
  const normalizedPercentage =
    maxScore > 0
      ? Math.min(100, Math.round((averages.averageScore / maxScore) * 100))
      : 0;

  return (
    <Card className="border-neutral-600 bg-neutral-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Community Average</CardTitle>
          <Badge>Live Mock Data</Badge>
        </div>
        <CardDescription>
          Average score across all submitted votes so far.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight">
            {averages.averageScore.toFixed(2)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              / {maxScore.toFixed(0)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {averages.totalVotes} votes · {averages.uniqueVoters} voters
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border/70">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${normalizedPercentage}%` }}
          />
        </div>

        <p className="pt-1 text-xs text-muted-foreground">
          Community Average Tier Board (compare with your board above)
        </p>

        <div className="space-y-2">
          {tiers.map((tier) => {
            const tierEntities = entityRankings.filter(
              (entity) => entity.averageTier === tier.value
            );

            return (
              <section key={tier.value} className="rounded-md">
                <div className={cn('flex min-h-16 sm:min-h-20 md:min-h-24')}>
                  <div
                    className={cn(
                      'aspect-square w-16 sm:w-20 md:w-24 text-center text-xl md:text-2xl text-black font-bold flex items-center justify-center',
                      TIER_ACCENT_BY_VALUE[tier.value]
                    )}
                  >
                    {tier.label}
                  </div>

                  <div className={cn('flex-1 border border-muted p-1')}>
                    <div className="flex flex-wrap gap-2">
                      {tierEntities.map((entityRanking) => {
                        const entity = entitiesById[entityRanking.entityId];

                        return (
                          <article
                            key={entityRanking.entityId}
                            className="flex w-22 flex-col rounded-sm border border-border/80 bg-background/80 p-1.5 sm:w-24"
                          >
                            <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                              {entity?.name ?? entityRanking.entityId}
                            </p>
                            <p className="mt-1 text-[0.62rem] text-muted-foreground">
                              {entityRanking.voteCount} votes
                            </p>
                            <Badge className="mt-1 w-fit px-1.5 py-0 text-[0.55rem]">
                              Avg {entityRanking.averageScore.toFixed(2)}
                            </Badge>
                          </article>
                        );
                      })}
                    </div>

                    {tierEntities.length === 0 ? (
                      <p className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
                        No average placements here yet
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
