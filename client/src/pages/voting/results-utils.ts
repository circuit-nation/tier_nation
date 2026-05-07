import {
  calculateEntityAverageRankings,
  calculateVoteAverages,
  type VoteAverages,
} from '@/lib/mock/votes';
import {
  TIER_VALUES,
  type Tier,
  type TierBoardState,
  type TierValue,
  type Vote,
} from '@/types';

export const buildTierScores = (tiers: Tier[]): Record<TierValue, number> => {
  const scoreMap = Object.fromEntries(
    TIER_VALUES.map((tierValue) => [tierValue, 0])
  ) as Record<TierValue, number>;

  for (const tier of tiers) {
    scoreMap[tier.value] = tier.score;
  }

  return scoreMap;
};

export const createEmptyBoard = (): TierBoardState =>
  TIER_VALUES.reduce((boardByTier, tierValue) => {
    boardByTier[tierValue] = [];
    return boardByTier;
  }, {} as TierBoardState);

export const mapVotesToBoard = (votes: Vote[]): TierBoardState => {
  const mappedBoard = createEmptyBoard();
  for (const vote of votes) {
    mappedBoard[vote.tier].push(vote.entityId);
  }
  return mappedBoard;
};

export const buildCommunityBoard = (
  votes: Vote[],
  tierScores: Record<TierValue, number>
): { board: TierBoardState; totals: VoteAverages } => {
  const totals = calculateVoteAverages(votes, tierScores);
  const rankings = calculateEntityAverageRankings(votes, tierScores);
  const board = createEmptyBoard();

  for (const ranking of rankings) {
    board[ranking.averageTier].push(ranking.entityId);
  }

  return { board, totals };
};
