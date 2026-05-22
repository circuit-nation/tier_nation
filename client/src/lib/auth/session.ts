import { authEndpoints, type AuthUser } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';

export type AuthSessionData = {
  accessToken: string;
  user: AuthUser;
};

export async function fetchCurrentUser(accessToken: string) {
  const response = await fetch(authEndpoints.me, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to load the current user');
  }

  const data = (await response.json()) as { user?: AuthUser } & AuthUser;
  return data.user ?? data;
}

export async function refreshAccessToken(): Promise<string | null> {
  const { clearSession, setSession } = useAuthStore.getState();

  const response = await fetch(authEndpoints.refresh, {
    method: 'POST',
    credentials: 'include',
  });

  if (response.status === 401 || response.status === 400) {
    clearSession();
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to refresh access token');
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Refresh response did not include an access token');
  }

  setSession(data.access_token, null);
  return data.access_token;
}

export async function bootstrapSession(): Promise<AuthSessionData | null> {
  const { hydrateFromCookie, setUser, clearSession } = useAuthStore.getState();
  useAuthStore.setState({ status: 'loading' });

  const storedToken = hydrateFromCookie();
  if (storedToken) {
    const currentUser = await fetchCurrentUser(storedToken);
    if (currentUser) {
      setUser(currentUser);
      useAuthStore.setState({ status: 'authenticated' });
      return { accessToken: storedToken, user: currentUser };
    }
  }

  const refreshedToken = await refreshAccessToken();
  if (refreshedToken) {
    const currentUser = await fetchCurrentUser(refreshedToken);
    if (currentUser) {
      setUser(currentUser);
      useAuthStore.setState({ status: 'authenticated' });
      return { accessToken: refreshedToken, user: currentUser };
    }
  }

  clearSession();
  return null;
}

export async function completeSessionWithToken(
  newAccessToken: string
): Promise<AuthSessionData> {
  const { setSession, setUser, clearSession } = useAuthStore.getState();
  setSession(newAccessToken, null);

  const currentUser = await fetchCurrentUser(newAccessToken);
  if (!currentUser) {
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw new Error(
        'Authentication expired before the user profile could load'
      );
    }

    const refreshedUser = await fetchCurrentUser(refreshedToken);
    if (!refreshedUser) {
      clearSession();
      throw new Error('Unable to load the current user');
    }

    setUser(refreshedUser);
    return { accessToken: refreshedToken, user: refreshedUser };
  }

  setUser(currentUser);
  return { accessToken: newAccessToken, user: currentUser };
}
