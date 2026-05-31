import { apiFetch } from '@/lib/api/http';

type GuestLoginResponse = {
  accessToken: string;
};

export async function postGuestLogin(): Promise<string> {
  const res = await apiFetch<GuestLoginResponse>('/auth/guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.accessToken;
}
