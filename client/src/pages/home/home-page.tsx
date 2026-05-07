import { f1List, votingLists } from '@/lib/mock/lists';
import { ListsSpotlight } from './components/lists-preview';
import { CommunityCTA } from './components/cn-cta';
import { Hero } from './components/hero';

export function HomePage() {
  const visibleLists = votingLists.filter((list) => list.isVisible);

  return (
    <div className="min-h-screen space-y-10 px-5 py-10 md:py-12">
      <Hero />
      <ListsSpotlight list={f1List} lists={visibleLists} />
      <CommunityCTA />
    </div>
  );
}
