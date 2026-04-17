import type { Tier } from './tier'

export type List = {
  id: string
  name: string
  description?: string
  tiers: Tier[]
  isLocked: boolean
  isVisible: boolean
  startTime?: string
  endTime?: string
}
