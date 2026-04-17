import { IconHome } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

export function Header() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 p-3 backdrop-blur sm:px-5">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="justify-self-start">
          {!isHomePage ? (
            <Button asChild variant="outline" className="" size="icon-lg">
              <Link to="/" aria-label="Go to home page">
                <IconHome className="size-5" stroke={1.8} />
              </Link>
            </Button>
          ) : null}
        </div>

        <Link
          to="/"
          className="block justify-self-center px-4 py-3 text-center font-heading text-lg font-bold tracking-wide text-foreground sm:text-xl"
        >
          {APP_NAME.toUpperCase()}
        </Link>
        <div aria-hidden="true" />
      </div>
    </header>
  )
}
