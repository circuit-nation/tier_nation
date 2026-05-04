import { Button } from '@/components/ui/button';
import { TierIllustration } from './hero-illustration';

export function Hero() {
  return (
    <section className="">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 font-grotesk space-y-4">
          <h1 className="text-7xl tracking-tighter uppercase leading-none font-light">
            Every <span className="font-black">driver.</span>
            <br />
            <span className="text-primary">
              Every <span className="font-black">track.</span>
              <br />
              Ranked <span className="font-black">by you.</span>
            </span>
          </h1>

          <p className="mb-9 max-w-lg text-[clamp(15px,1.5vw,18px)] leading-relaxed text-[#6E6E7C]">
            From drivers to circuits to legendary moments, rank it all and see
            how your opinions stack up against the crowd.
          </p>

          <div className="mb-5 flex flex-wrap gap-3">
            <Button variant="default" size="lg" className="text-white">
              Start Voting
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-border"
            >
              Browse Lists
            </Button>
          </div>
        </div>
        <TierIllustration />
      </div>
    </section>
  );
}
