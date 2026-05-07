import { Button } from '@/components/ui/button';
import { APP_NAME, COMMUNITY_NAME } from '@/lib/constants';
import cn_banner from '@/assets/images/cn_banner.png';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export function CommunityCTA() {
  return (
    <section className="mx-auto max-w-7xl pt-12">
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 lg:p-14">
        {/* Background image */}
        <div>
          <img
            className="absolute inset-0"
            src={cn_banner}
            alt="Community banner"
          />

          {/* Left fade / blend overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-primary/40 via-primaryc/20 to-transparent" />
        </div>
        {/* Decorative corner */}
        <div className="pointer-events-none absolute left-0 top-0 h-44 w-44 rounded-br-full border-b border-r border-border/80 opacity-50" />

        {/* Content */}
        <div className="relative z-10 font-grotesk">
          <h2 className="mb-3 text-[clamp(26px,4vw,40px)] font-bold uppercase leading-[1.1] tracking-wide text-[#EEEEF3]">
            Built by the community
            <br />
            at <span className="text-primary">{COMMUNITY_NAME}</span>
          </h2>

          <p className="mb-8 max-w-2xl font-light text-[clamp(15px,1.5vw,18px)] leading-tight  text-gray-200">
            {APP_NAME} is designed by fans for fans. Every feature is shaped by
            the builders of the {COMMUNITY_NAME} community. Join us and help
            define what comes next.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link
                to="https://circuitnation.substack.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Our Newsletter
                <IconArrowUpRight className="group-hover:transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>

            <Button variant="default" size="lg" className="group" asChild>
              <Link
                to="https://circuitnation.live"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {COMMUNITY_NAME}
                <IconArrowUpRight className="group-hover:transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
