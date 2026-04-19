import { f1List, votingLists } from '@/lib/mock/lists';
import { LiveVotingCard } from '@/pages/home/components/live-voting-card';
import { VotingListPreview } from '@/pages/home/components/voting-list-preview';

export function HomePage() {
  const visibleLists = votingLists.filter((list) => list.isVisible);

  return (
    <div>
      <section className="">
        <LiveVotingCard list={f1List} />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleLists.map((list) => (
            <VotingListPreview key={list.id} list={list} />
          ))}
        </div>
      </section>
    </div>
  );
}
