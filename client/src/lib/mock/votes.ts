import { TIER_VALUES, type TierValue, type Vote } from '@/types';

const mockVotesStore: Vote[] = [
  {
    id: 'vote-1',
    userId: 'user-alpha',
    listId: 'f1-2026',
    entityId: 'max',
    tier: 'S',
    createdAt: '2026-04-15T12:00:00.000Z',
  },
  {
    id: 'vote-2',
    userId: 'user-alpha',
    listId: 'f1-2026',
    entityId: 'charles',
    tier: 'A',
    createdAt: '2026-04-15T12:00:00.000Z',
  },
  {
    id: 'vote-3',
    userId: 'user-alpha',
    listId: 'f1-2026',
    entityId: 'lando',
    tier: 'A',
    createdAt: '2026-04-15T12:00:00.000Z',
  },
  {
    id: 'vote-4',
    userId: 'user-bravo',
    listId: 'f1-2026',
    entityId: 'max',
    tier: 'S',
    createdAt: '2026-04-16T08:30:00.000Z',
  },
  {
    id: 'vote-5',
    userId: 'user-bravo',
    listId: 'f1-2026',
    entityId: 'oscar',
    tier: 'B',
    createdAt: '2026-04-16T08:30:00.000Z',
  },
  {
    id: 'vote-6',
    userId: 'user-charlie',
    listId: 'f1-2026',
    entityId: 'george',
    tier: 'A',
    createdAt: '2026-04-16T10:15:00.000Z',
  },
  {
    id: 'vote-7',
    userId: 'user-charlie',
    listId: 'f1-2026',
    entityId: 'lewis',
    tier: 'B',
    createdAt: '2026-04-16T10:15:00.000Z',
  },
  {
    id: 'vote-8',
    userId: 'user-delta',
    listId: 'f1-midfield-2026',
    entityId: 'alex',
    tier: 'A',
    createdAt: '2026-04-20T09:00:00.000Z',
  },
];

export const sampleVotes: Vote[] = mockVotesStore;

export type VoteAverages = {
  averageScore: number;
  totalVotes: number;
  uniqueVoters: number;
};

export type EntityAverageRanking = {
  entityId: string;
  averageScore: number;
  averageTier: TierValue;
  voteCount: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getVotesByList = async (listId: string): Promise<Vote[]> => {
  await delay(250);
  return mockVotesStore.filter((vote) => vote.listId === listId);
};

export const calculateVoteAverages = (
  votes: Vote[],
  tierScores: Record<TierValue, number>
): VoteAverages => {
  if (votes.length === 0) {
    return {
      averageScore: 0,
      totalVotes: 0,
      uniqueVoters: 0,
    };
  }

  const totalScore = votes.reduce((score, vote) => {
    return score + (tierScores[vote.tier] ?? 0);
  }, 0);

  return {
    averageScore: Number((totalScore / votes.length).toFixed(2)),
    totalVotes: votes.length,
    uniqueVoters: new Set(votes.map((vote) => vote.userId)).size,
  };
};

const resolveAverageTier = (
  averageScore: number,
  tierScores: Record<TierValue, number>
): TierValue => {
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
};

export const calculateEntityAverageRankings = (
  votes: Vote[],
  tierScores: Record<TierValue, number>
): EntityAverageRanking[] => {
  if (votes.length === 0) {
    return [];
  }

  const scoreByEntity = votes.reduce<
    Record<string, { totalScore: number; voteCount: number }>
  >((acc, vote) => {
    const score = tierScores[vote.tier] ?? 0;

    if (!acc[vote.entityId]) {
      acc[vote.entityId] = { totalScore: score, voteCount: 1 };
      return acc;
    }

    acc[vote.entityId].totalScore += score;
    acc[vote.entityId].voteCount += 1;
    return acc;
  }, {});

  return Object.entries(scoreByEntity)
    .map(([entityId, summary]) => {
      const averageScore = Number(
        (summary.totalScore / summary.voteCount).toFixed(2)
      );

      return {
        entityId,
        averageScore,
        averageTier: resolveAverageTier(averageScore, tierScores),
        voteCount: summary.voteCount,
      };
    })
    .sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }

      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }

      return a.entityId.localeCompare(b.entityId);
    });
};

/**
 * Simulate a POST request to submit votes.
 * Resolves after a short delay and randomly rejects ~20% of the time to mimic server errors.
 */
export const postVotes = async (payload: Vote[]): Promise<Vote[]> => {
  await delay(500);

  if (Math.random() < 0.2) {
    throw new Error('Failed to submit votes. Please try again.');
  }

  const now = new Date().toISOString();
  const persistedVotes = payload.map((vote, index) => ({
    ...vote,
    id: `${vote.listId}-${vote.userId}-${mockVotesStore.length + index + 1}`,
    createdAt: vote.createdAt ?? now,
  }));

  mockVotesStore.push(...persistedVotes);

  console.log('Mock POST /votes', persistedVotes);
  return persistedVotes;
};
