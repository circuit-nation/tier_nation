import { apiUrl, parseJson } from '@/lib/api/http';
import type { ApiSubmission } from '@/lib/api/types';

export async function createSubmission(
  body: { listId: string; isAnonymous: boolean },
  accessToken: string
) {
  const res = await fetch(apiUrl('/submissions'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  return parseJson<ApiSubmission>(res);
}
