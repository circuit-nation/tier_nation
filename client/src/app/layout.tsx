import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { Container } from '@/components/layout/container'
import { Header } from '@/components/layout/header'

type AppLayoutProps = {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-x-[-20%] -top-56 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute inset-x-[-20%] -bottom-56 h-96 rounded-full bg-chart-2/12 blur-3xl" />
      </div>
      <Header />
      <main className="pb-20 pt-6 sm:pt-8">
        <Container>
          {children ?? <Outlet />}
        </Container>
      </main>
    </div>
  )
}
