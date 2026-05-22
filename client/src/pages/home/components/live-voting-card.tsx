import { Link } from 'react-router-dom';

import type { List } from '@/types';

type LiveVotingCardProps = {
  list: List;
};

export function LiveVotingCard({ list }: LiveVotingCardProps) {
  return (
    <section>
      <Link
        to={`/voting/${list.id}`}
        className="group relative flex min-h-44 overflow-hidden rounded-3xl border border-white/10 text-center shadow-xl"
      >
        {/* Backdrop image with zoom on hover */}
        {list.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${list.coverImage})` }}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-card/80" aria-hidden />
        )}

        {/* Cinematic gradient overlay */}
        {list.coverImage && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"
            aria-hidden
          />
        )}

        {/* Subtle vignette */}
        {list.coverImage && (
          <div
            className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]"
            aria-hidden
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col items-center justify-end gap-1.5 px-4 pb-6 pt-10">
          <span className="inline-flex items-center gap-2.5">
            {/* Pulsing live dot */}
            <span
              className="relative inline-flex size-2.5 sm:size-3"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] sm:size-3" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
              Live Voting
            </span>
          </span>

          {list.name && (
            <p className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">
              {list.name}
            </p>
          )}
        </div>

        {/* Hover shimmer edge */}
        <div
          className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-white/15"
          aria-hidden
        />
      </Link>
    </section>
  );
}
