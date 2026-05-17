import { apiUrl, parseJson } from '@/lib/api/http';
import type { ApiPostVotesBody } from '@/lib/api/types';

export async function postVotes(body: ApiPostVotesBody, accessToken: string) {
  const res = await fetch(apiUrl('/votes'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  return parseJson<{ message: string }>(res);
}
