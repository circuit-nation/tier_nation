import { useMemo } from 'react';

import { useLists } from '@/hooks/use-lists';
import { ListsSpotlight } from './components/lists-preview';
import { CommunityCTA } from './components/cn-cta';
import { Hero } from './components/hero';

export function HomePage() {
  const { lists, error: loadError } = useLists(1, 20);

  const featuredList = useMemo(() => lists[0], [lists]);

  return (
    <div className="min-h-screen space-y-10 px-5 py-10 md:py-12">
      <Hero />
      {loadError ? (
        <p className="text-center text-sm text-destructive">{loadError}</p>
      ) : null}
      {lists.length > 0 && featuredList && (
        <ListsSpotlight list={featuredList} lists={lists} />
      )}
      <CommunityCTA />
    </div>
  );
}
