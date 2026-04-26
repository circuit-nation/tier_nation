import type { Vote } from '@/types';

export const sampleVotes: Vote[] = [
  {
    id: 'vote-1',
    userId: 'user-alpha',
    listId: 'f1-2026',
    entityId: 'max',
    tier: 'S',
    createdAt: '2026-04-15T12:00:00.000Z',
  },
];

/**
 * Simulate a POST request to submit votes.
 * Resolves after a short delay and randomly rejects ~20% of the time to mimic server errors.
 */
export const postVotes = async (payload: Vote[]): Promise<Vote[]> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Random failure to simulate error conditions
  if (Math.random() < 0.2) {
    throw new Error('Failed to submit votes. Please try again.');
  }

  console.log('Mock POST /votes', payload);
  return payload;
};
