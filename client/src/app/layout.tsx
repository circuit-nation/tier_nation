import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Container } from '@/components/layout/container';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

type AppLayoutProps = {
  children?: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Container>{children ?? <Outlet />}</Container>
      </main>
      <Footer />
    </div>
  );
}
