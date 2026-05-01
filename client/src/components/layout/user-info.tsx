import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
  IconLogout as LogOut,
  IconUser as UserRound,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';

export default function UserInfo() {
  const {
    isAuthenticated,
    isAnonymous,
    login,
    logout,
    setIsAnonymous,
    status,
    user,
  } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (status === 'loading') {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
    return <Button onClick={login}>Login</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage
            src={user.avatar_url ?? undefined}
            alt={user.name ?? 'User'}
          />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium select-none">
            {user.name ? (
              getInitials(user.name)
            ) : (
              <UserRound className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
        {/* Name & Email */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold leading-tight truncate">
              {isAnonymous ? '***********' : (user.name ?? 'Unknown User')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isAnonymous ? '***********' : (user.email ?? '')}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Anonymous mode toggle */}
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Anonymous mode</p>
              <p className="text-xs text-muted-foreground">
                Submit forms without identity
              </p>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
