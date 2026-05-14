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

function resolveAverageTier(
  averageScore: number,
  tierScores: Record<TierValue, number>
): TierValue {
  const sortedTierScores = TIER_VALUES.map((tier) => ({
    tier,
    score: tierScores[tier] ?? 0,
  })).sort((a, b) => b.score - a.score);

  let selectedTier = sortedTierScores[0]?.tier ?? 'F';
  let smallestDistance = Number.POSITIVE_INFINITY;
  let selectedTierScore = Number.NEGATIVE_INFINITY;

  for (const tierScore of sortedTierScores) {
    const distance = Math.abs(averageScore - tierScore.score);
    if (
      distance < smallestDistance ||
      (distance === smallestDistance && tierScore.score > selectedTierScore)
    ) {
      smallestDistance = distance;
      selectedTier = tierScore.tier;
      selectedTierScore = tierScore.score;
    }
  }

  return selectedTier;
}

/** Maps API entity-average rows (mean `tier_value` in 1–7 space) to the UI tier board. */
export function buildCommunityBoardFromEntityAverages(
  rows: { entityId: string; averageTierValue: number }[],
  tierScores: Record<TierValue, number>
): TierBoardState {
  const board = createEmptyBoard();
  for (const row of rows) {
    const uiScore = 8 - row.averageTierValue;
    const tier = resolveAverageTier(uiScore, tierScores);
    board[tier].push(row.entityId);
  }
  return board;
}
