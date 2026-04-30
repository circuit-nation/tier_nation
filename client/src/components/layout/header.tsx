import { Link, useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		navigate('/login', { replace: true });
	};

  return (
    <header className="sticky top-0 z-40 border-b border-border/20 bg-background/90 p-2 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-self-center gap-2 rounded-xl px-4 py-3 text-center font-heading text-lg font-bold tracking-wide text-foreground transition-colors hover:text-primary sm:text-xl"
        >
          <img
            src={logo}
            alt={`${APP_NAME} logo`}
            className="size-8 rounded-md object-cover sm:size-9"
          />
          <span>{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {user ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Signed in as {user.name}
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              Logout
            </Button>
          </>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
        )}
        </div>
      </div>
    </header>
  );
}
