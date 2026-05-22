import { apiFetch } from '@/lib/api/http';
import type { ApiSubmission } from '@/lib/api/types';

export async function createSubmission(
  body: { listId: string; isAnonymous: boolean },
  accessToken: string
) {
  return apiFetch<ApiSubmission>('/submissions', {
    method: 'POST',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
