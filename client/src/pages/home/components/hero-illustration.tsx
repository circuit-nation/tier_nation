type Tier = {
  label: string;
  text: string;
  bg: string;
  border: string;
};

const TIERS: Tier[] = [
  {
    label: 'S',
    text: 'text-tier-s',
    bg: 'bg-tier-s/40',
    border: 'border-tier-s/20',
  },
  {
    label: 'A',
    text: 'text-tier-a',
    bg: 'bg-tier-a/40',
    border: 'border-tier-a/20',
  },
  {
    label: 'B',
    text: 'text-tier-b',
    bg: 'bg-tier-b/40',
    border: 'border-tier-b/20',
  },
  {
    label: 'C',
    text: 'text-tier-c',
    bg: 'bg-tier-c/40',
    border: 'border-tier-c/20',
  },
  {
    label: 'D',
    text: 'text-tier-d',
    bg: 'bg-tier-d/40',
    border: 'border-tier-d/20',
  },
  {
    label: 'F',
    text: 'text-tier-f',
    bg: 'bg-tier-f/40',
    border: 'border-tier-f/20',
  },
];

type FloatCard = {
  tier: Tier;
  rotate: string;
  top: string;
  left: string;
  skeletons: number;
  zIndex: number;
};

const FLOAT_CARDS: FloatCard[] = [
  {
    tier: TIERS[0],
    rotate: '-7deg',
    top: '5%',
    left: '20%',
    skeletons: 2,
    zIndex: 3,
  },
  {
    tier: TIERS[1],
    rotate: '5deg',
    top: '15%',
    left: '50%',
    skeletons: 2,
    zIndex: 4,
  },
  {
    tier: TIERS[2],
    rotate: '6deg',
    top: '40%',
    left: '8%',
    skeletons: 2,
    zIndex: 2,
  },
  {
    tier: TIERS[3],
    rotate: '-9deg',
    top: '50%',
    left: '30%',
    skeletons: 3,
    zIndex: 3,
  },
];

function FloatingTierCard({ card }: { card: FloatCard }) {
  const { tier, rotate, top, left, skeletons, zIndex } = card;
  return (
    <div
      className="absolute flex items-center gap-2 min-w-40 rounded-2xl border border-white/10 bg-[#16161C] px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      style={{ top, left, zIndex, transform: `rotate(${rotate})` }}
    >
      <div
        className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-sm border text-3xl font-extrabold tracking-wide ${tier.text} ${tier.bg} ${tier.border}`}
      >
        {tier.label}
      </div>

      <div className="flex flex-1 flex-row gap-1.5">
        {Array.from({ length: skeletons }).map((_, i) => (
          <div key={i} className="size-9 rounded-sm bg-foreground/20" />
        ))}
      </div>
    </div>
  );
}

export function TierIllustration() {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center w-120 h-72"
      style={{
        maskImage:
          'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)',
      }}
    >
      {FLOAT_CARDS.map((card) => (
        <FloatingTierCard key={card.tier.label} card={card} />
      ))}
    </div>
  );
}
