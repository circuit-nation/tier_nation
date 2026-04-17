import type { TierValue } from './tier'

export type Vote = {
  id: string
  userId: string
  listId: string
  entityId: string
  tier: TierValue
  createdAt: string
}
