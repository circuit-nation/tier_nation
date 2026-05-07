import { Link } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import * as constants from '@/lib/constants';
import UserInfo from './user-info';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/60 p-2 backdrop-blur-sm *:sm:px-5 border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          to="/"
          className="group flex flex-row gap-2 items-center justify-center"
        >
          <img
            src={logo}
            alt={`${constants.APP_NAME} logo`}
            className="size-8 rounded-md object-cover sm:size-9"
          />

          <h2 className="text-xl font-semibold font-sans uppercase group-hover:text-primary">
            {constants.APP_NAME}
          </h2>
        </Link>

        <div className="flex items-center gap-3">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
