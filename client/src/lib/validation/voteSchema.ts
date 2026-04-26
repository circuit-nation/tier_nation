import { z } from 'zod';
import type { Vote } from '@/types';

// Zod schema matching the Vote type
export const voteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  listId: z.string(),
  entityId: z.string(),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']),
  createdAt: z.string(),
});

/** Validate an array of Vote objects.
 * Throws a ZodError if validation fails.
 */
export const validateVotePayload = (payload: Vote[]) => {
  return z.array(voteSchema).parse(payload);
};
