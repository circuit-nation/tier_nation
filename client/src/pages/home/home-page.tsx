import { useEffect, useMemo, useState } from 'react';

import { apiListSummaryToList, fetchLists } from '@/lib/api/lists';
import { f1List } from '@/lib/mock/lists';
import { ListsSpotlight } from './components/lists-preview';
import { CommunityCTA } from './components/cn-cta';
import { Hero } from './components/hero';
import type { List } from '@/types';

export function HomePage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLists(1, 20)
      .then((res) => {
        if (cancelled) return;
        const mapped = res.lists.map(apiListSummaryToList);
        setLists(mapped.filter((list) => list.isVisible));
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load lists');
        setLists([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLists = useMemo(
    () => lists.filter((list) => list.isVisible),
    [lists]
  );

  const featuredList = visibleLists[0] ?? f1List;

  return (
    <div className="min-h-screen space-y-10 px-5 py-10 md:py-12">
      <Hero />
      {loadError ? (
        <p className="text-center text-sm text-destructive">{loadError}</p>
      ) : null}
      <ListsSpotlight list={featuredList} lists={visibleLists} />
      <CommunityCTA />
    </div>
  );
}
