import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
  IconLogout as LogOut,
  IconUser as UserRound,
} from '@tabler/icons-react';
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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    await logout();
  };

  if (status === 'loading') {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        size="lg"
        onClick={login}
        className="flex items-center justify-center"
      >
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-10 cursor-pointer border border-primary/60 bg-gray-800/40 backdrop-blur-sm">
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
        <div className="flex flex-col gap-0.5 px-2 py-1.5 data-inset:pl-7.5">
          <p className="text-sm font-semibold leading-tight truncate">
            {isAnonymous ? '***********' : (user.name ?? 'Unknown User')}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isAnonymous ? '***********' : (user.email ?? '')}
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Anonymous mode toggle */}
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              <p className="text-sm">Be Anonymous</p>
              <p className="text-xs text-muted-foreground">
                Submit rankings anonymously.
              </p>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          size="lg"
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
