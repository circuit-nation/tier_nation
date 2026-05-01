import { Link } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import * as constants from '@/lib/constants';
import UserInfo from './user-info';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/20 bg-background/90 p-2 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-self-center gap-2 rounded-xl px-4 py-3 text-center font-heading text-lg font-bold tracking-wide text-foreground transition-colors hover:text-primary sm:text-xl"
        >
          <img
            src={logo}
            alt={`${constants.APP_NAME} logo`}
            className="size-8 rounded-md object-cover sm:size-9"
          />
          <span>{constants.APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
