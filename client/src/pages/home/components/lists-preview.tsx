import { LiveVotingCard } from './live-voting-card';
import { VotingListPreview } from './voting-list-preview';
import { SectionHeader } from './section-header';
import { f1List, votingLists } from '@/lib/mock/lists';

export function ListsSpotlight({
  list,
  lists,
}: {
  list: typeof f1List;
  lists: typeof votingLists;
}) {
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Explore Tier Lists"
        subtitle="Cast your vote on the most active lists right now."
      />
      <LiveVotingCard list={list} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {lists.map((list) => (
          <VotingListPreview key={list.id} list={list} />
        ))}
      </div>
    </section>
  );
}
