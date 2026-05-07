import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import substack from '@/assets/images/substack.svg';

export function SubstackCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="relative space-y-6 overflow-hidden rounded-lg border border-white/10 px-8 py-16 backdrop-blur-xl md:px-16">
          {/* Decorative blur */}
          <div className="absolute -left-16 top-10 h-40 -z-10 w-40 rounded-full bg-[#FF7731]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 -z-10 w-56 rounded-full bg-[#ff6719]/40 blur-3xl" />

          {/* Heading */}
          <div className="mx-auto max-w-4xl text-center space-y-4 font-grotesk">
            <h2 className="font-black uppercase text-5xl">
              Read the {` `}
              <span className="text-primary">latest</span>
              {` `} from the pitwall
            </h2>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-sm font-semibold">
              <Link
                to="https://circuitnation.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Read on Substack
                <IconArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Button>
          </div>

          {/* Bottom stat row */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#72727D]">
            <div>Weekly articles</div>
            <div>No spam, unsubscribe anytime</div>
            <div>Built for motorsport fans</div>
          </div>
        </div>
      </div>
    </section>
  );
}
