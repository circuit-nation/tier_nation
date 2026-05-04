import { Button } from '@/components/ui/button';
import { COMMUNITY_NAME } from '@/lib/constants';

export function CommunityCTA() {
  function styleCommunityName(text: string) {
    const firstWord = text.split(' ')[0];
    const secondWord = text.slice(firstWord.length);
    return (
      <span>
        <span className="text-red-500">{firstWord}</span>
        <span className="text-blue-500">{secondWord}</span>
      </span>
    );
  }
  return (
    <section className="mx-auto max-w-7xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111116] p-8 lg:p-14">
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-bl-[140px] border-b border-l border-white/[0.07] opacity-50" />

        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-primary">
          Open source · Community built
        </p>

        <h2 className="mb-3 text-[clamp(26px,4vw,40px)] font-bold uppercase leading-[1.1] tracking-wide text-[#EEEEF3]">
          Built by the community
          <br />
          at {styleCommunityName(COMMUNITY_NAME)}
        </h2>

        <p className="mb-8 max-w-lg text-base leading-relaxed text-[#6E6E7C]">
          Tier Nation is designed by fans for fans. Every feature is shaped by
          the builders of the {COMMUNITY_NAME} community. Join us and help
          define what comes next.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="default">Join {COMMUNITY_NAME}</Button>
          <Button variant="secondary">Contribute to the project →</Button>
        </div>
      </div>
    </section>
  );
}
