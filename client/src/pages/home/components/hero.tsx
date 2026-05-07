import { TierIllustration } from './hero-illustration';

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row">
      <div className="flex-1 font-grotesk space-y-2">
        <h1 className="text-6xl tracking-tight uppercase leading-none font-light">
          Every <span className="font-medium text-primary">Driver.</span>
          <br />
          Every <span className="font-medium text-primary">Track.</span>
          <br />
          Ranked <span className="font-medium text-primary">by you.</span>
        </h1>

        <p className="mb-9 max-w-lg font-light text-[clamp(15px,1.5vw,18px)] leading-tight *:text-gray-200">
          From drivers to circuits to legendary moments, rank it all and see how
          your opinions stack up against the crowd.
        </p>
      </div>

      <TierIllustration />
    </section>
  );
}
