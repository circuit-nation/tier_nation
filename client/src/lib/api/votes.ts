import { apiFetch } from '@/lib/api/http';
import type { ApiPostVotesBody, ApiPostVotesResponse } from '@/lib/api/types';

export async function postVotes(body: ApiPostVotesBody, accessToken: string) {
  return apiFetch<ApiPostVotesResponse>('/votes', {
    method: 'POST',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
