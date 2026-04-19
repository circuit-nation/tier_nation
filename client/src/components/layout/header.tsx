import { Link } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/20 bg-background/90 p-2 backdrop-blur sm:px-5">
      <div className="mx-auto max-w-6xl items-center gap-3">
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
        <div aria-hidden="true" />
      </div>
    </header>
  );
}
