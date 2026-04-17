import { TierRow } from '@/pages/voting/components/tier-row'
import type { Entity, Tier, TierBoardState } from '@/types'

type TierBoardProps = {
  tiers: Tier[]
  board: TierBoardState
  entitiesById: Record<string, Entity>
}

export function TierBoard({ tiers, board, entitiesById }: TierBoardProps) {
  return (
    <div className="">
      <div className="space-y-2">
        {tiers.map((tier) => {
          const entities = board[tier.value]
            .map((id) => entitiesById[id])
            .filter((entity): entity is Entity => Boolean(entity))

          return <TierRow key={tier.value} tier={tier} entities={entities} />
        })}
      </div>
    </div>
  )
}
