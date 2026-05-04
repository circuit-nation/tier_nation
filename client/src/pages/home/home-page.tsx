import { f1List, votingLists } from '@/lib/mock/lists';
import { ListsSpotlight } from './components/lists-preview';
import { CommunityCTA } from './components/cn-cta';
import { CTAStrip } from './components/tn-cta';
import { Hero } from './components/hero';

export function HomePage() {
  const visibleLists = votingLists.filter((list) => list.isVisible);

  return (
    <div className="min-h-screen space-y-24 py-18 md:py-24">
      <Hero />
      <ListsSpotlight list={f1List} lists={visibleLists} />
      <CTAStrip />
      <CommunityCTA />
    </div>
  );
}
