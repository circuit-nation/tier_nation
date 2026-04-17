export const TIER_VALUES = ['S', 'A', 'B', 'C', 'D', 'E'] as const

export type TierValue = (typeof TIER_VALUES)[number]

export type Tier = {
  value: TierValue
  label: string
  score: number
  order: number
}

export type TierBoardState = {
  [key in TierValue]: string[]
}
