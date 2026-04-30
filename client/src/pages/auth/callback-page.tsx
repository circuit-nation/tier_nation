import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAccessTokenFromLocation } from '@/lib/auth';

export function AuthCallbackPage() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();
	const { completeOAuthLogin } = useAuth();

	useEffect(() => {
		const accessToken = getAccessTokenFromLocation(location.search);

		if (!accessToken) {
			navigate('/login', { replace: true });
			return;
		}

		const completeAuth = async () => {
			try {
				await completeOAuthLogin(accessToken);
				navigate('/', { replace: true });
			} catch (authError) {
				setError(
					authError instanceof Error
						? authError.message
						: 'Failed to complete sign in.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		void completeAuth();
	}, [completeOAuthLogin, location.search, navigate]);

	return (
		<div className="relative flex min-h-screen items-center justify-center px-4">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),linear-gradient(180deg,rgba(8,15,30,0.98),rgba(10,13,20,1))]" />
			<Card className="w-full max-w-md rounded-3xl border-border/70 bg-card/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
				<CardHeader>
					<p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
						Authentication
					</p>
					<CardTitle className="text-2xl">Finishing sign in</CardTitle>
					<CardDescription>
						We are storing your access token and loading your profile.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error ? (
						<div className="space-y-4">
							<p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{error}
							</p>
							<Button asChild className="w-full">
								<Link to="/login">Back to login</Link>
							</Button>
						</div>
					) : (
						<div className="space-y-3 text-sm text-muted-foreground">
							<p>{isLoading ? 'Completing authentication...' : 'Redirecting to the app...'}</p>
							<div className="h-1.5 overflow-hidden rounded-full bg-muted">
								<div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}