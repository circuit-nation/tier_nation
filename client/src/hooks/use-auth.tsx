import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	type PropsWithChildren,
} from 'react';

import { authEndpoints, type AuthUser } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';

type AuthContextValue = {
	accessToken: string | null;
	user: AuthUser | null;
	status: 'loading' | 'authenticated' | 'unauthenticated';
	isAnonymous: boolean;
	isAuthenticated: boolean;
	setIsAnonymous: (isAnonymous: boolean) => void;
	login: () => void;
	logout: () => Promise<void>;
	refreshAccessToken: () => Promise<string | null>;
	completeOAuthLogin: (accessToken: string) => Promise<AuthUser | null>;
	bootstrapAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(accessToken: string) {
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

export function AuthProvider({ children }: PropsWithChildren) {
	const accessToken = useAuthStore((state) => state.accessToken);
	const user = useAuthStore((state) => state.user);
	const status = useAuthStore((state) => state.status);
	const isAnonymous = useAuthStore((state) => state.isAnonymous);
	const setSession = useAuthStore((state) => state.setSession);
	const setUser = useAuthStore((state) => state.setUser);
	const setIsAnonymous = useAuthStore((state) => state.setIsAnonymous);
	const clearSession = useAuthStore((state) => state.clearSession);
	const hydrateFromCookie = useAuthStore((state) => state.hydrateFromCookie);

	const refreshAccessToken = useCallback(async () => {
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
	}, [clearSession, setSession]);

	const completeOAuthLogin = useCallback(
		async (newAccessToken: string) => {
			setSession(newAccessToken, null);

			const currentUser = await fetchCurrentUser(newAccessToken);
			if (!currentUser) {
				const refreshedToken = await refreshAccessToken();
				if (!refreshedToken) {
					throw new Error('Authentication expired before the user profile could load');
				}

				const refreshedUser = await fetchCurrentUser(refreshedToken);
				if (!refreshedUser) {
					clearSession();
					throw new Error('Unable to load the current user');
				}

				setUser(refreshedUser);
				return refreshedUser;
			}

			setUser(currentUser);
			return currentUser;
		},
		[clearSession, refreshAccessToken, setSession, setUser]
	);

	const bootstrapAuth = useCallback(async () => {
		useAuthStore.setState({ status: 'loading' });

		const storedToken = hydrateFromCookie();
		if (storedToken) {
			const currentUser = await fetchCurrentUser(storedToken);
			if (currentUser) {
				setUser(currentUser);
				useAuthStore.setState({ status: 'authenticated' });
				return;
			}
		}

		const refreshedToken = await refreshAccessToken();
		if (refreshedToken) {
			const currentUser = await fetchCurrentUser(refreshedToken);
			if (currentUser) {
				setUser(currentUser);
				useAuthStore.setState({ status: 'authenticated' });
				return;
			}
		}

		clearSession();
	}, [clearSession, hydrateFromCookie, refreshAccessToken, setUser]);

	const login = useCallback(() => {
		window.location.assign(authEndpoints.login);
	}, []);

	const logout = useCallback(async () => {
		try {
			await fetch(authEndpoints.logout, {
				method: 'POST',
				credentials: 'include',
				headers: accessToken
					? {
						Authorization: `Bearer ${accessToken}`,
					}
					: undefined,
			});
		} finally {
			clearSession();
		}
	}, [accessToken, clearSession]);

	useEffect(() => {
		void bootstrapAuth();
	}, [bootstrapAuth]);

	const value = useMemo<AuthContextValue>(
		() => ({
			accessToken,
			user,
			status,
			isAnonymous,
			isAuthenticated: status === 'authenticated' && Boolean(accessToken),
			setIsAnonymous,
			login,
			logout,
			refreshAccessToken,
			completeOAuthLogin,
			bootstrapAuth,
		}),
		[
			accessToken,
			bootstrapAuth,
			completeOAuthLogin,
			isAnonymous,
			login,
			logout,
			refreshAccessToken,
			setIsAnonymous,
			status,
			user,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}

	return context;
}
