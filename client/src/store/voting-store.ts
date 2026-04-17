import { create } from 'zustand'

import { initialBoard } from '@/lib/mock/board'
import { TIER_VALUES, type TierBoardState, type TierValue } from '@/types'

export type BoardDestination = TierValue | 'POOL'

type VotingStore = {
  board: TierBoardState
  moveEntity: (entityId: string, toTier: BoardDestination) => void
  resetBoard: () => void
  hasVotes: () => boolean
}

const cloneBoard = (board: TierBoardState): TierBoardState => {
  const nextBoard = {} as TierBoardState

  for (const tier of TIER_VALUES) {
    nextBoard[tier] = [...board[tier]]
  }

  return nextBoard
}

export const useVotingStore = create<VotingStore>((set, get) => ({
  board: cloneBoard(initialBoard),

  moveEntity: (entityId, toTier) =>
    set((state) => {
      let currentTier: TierValue | null = null

      for (const tier of TIER_VALUES) {
        if (state.board[tier].includes(entityId)) {
          currentTier = tier
          break
        }
      }

      if (currentTier === toTier || (currentTier === null && toTier === 'POOL')) {
        return state
      }

      const nextBoard = cloneBoard(state.board)

      if (currentTier) {
        nextBoard[currentTier] = nextBoard[currentTier].filter((id) => id !== entityId)
      }

      if (toTier !== 'POOL' && !nextBoard[toTier].includes(entityId)) {
        nextBoard[toTier] = [...nextBoard[toTier], entityId]
      }

      return { board: nextBoard }
    }),

  resetBoard: () => {
    set({ board: cloneBoard(initialBoard) })
  },

  hasVotes: () => {
    const { board } = get()
    return TIER_VALUES.some((tier) => board[tier].length > 0)
  },
}))