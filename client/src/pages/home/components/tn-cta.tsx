import { Button } from '@/components/ui/button';

export function CTAStrip() {
  return (
    <section className="">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 text-center">
        <h2 className="text-[clamp(32px,5vw,56px)] font-extrabold uppercase leading-[1.05] tracking-wide text-[#EEEEF3]">
          Ready to vote for
          <br />
          your favourite drivers?
        </h2>

        <p className="text-base text-[#6E6E7C]">
          Join thousands of fans already shaping the community rankings.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="default">Start Now →</Button>
          <Button variant="secondary">View Live List</Button>
        </div>
      </div>
    </section>
  );
}
