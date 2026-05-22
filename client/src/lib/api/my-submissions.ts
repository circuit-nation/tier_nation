import { apiFetch } from '@/lib/api/http';
import type { ApiMySubmissionsResponse } from '@/lib/api/types';

export async function fetchMySubmissions(accessToken: string) {
  return apiFetch<ApiMySubmissionsResponse>('/me/submissions', { accessToken });
}
