import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { List } from '@/types';

type LiveVotingCardProps = {
  list: List;
};

function isListClosed(list: List): boolean {
  if (list.isLocked) return true;
  if (list.votingOpen === false) return true;
  if (list.status === 'ended' || list.status === 'locked' || list.status === 'archived') return true;
  if (list.endTime && new Date() > new Date(list.endTime)) return true;
  return false;
}

export function LiveVotingCard({ list }: LiveVotingCardProps) {
  const isClosed = isListClosed(list);
  const hasSubmitted = list.userStatus?.hasSubmitted ?? false;
  const href = hasSubmitted ? `/results/${list.id}` : `/voting/${list.id}`;

  return (
    <section>
      <Link
        to={href}
        className="group relative flex min-h-44 overflow-hidden rounded-3xl border border-white/10 text-center shadow-xl"
      >
        {/* Backdrop image */}
        {list.coverImage ? (
          <div
            className={cn(
              'absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105',
              isClosed && 'grayscale'
            )}
            style={{ backgroundImage: `url(${list.coverImage})` }}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-card/80" aria-hidden />
        )}

        {/* Gradient overlay */}
        {list.coverImage && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t',
              isClosed
                ? 'from-black/90 via-black/50 to-black/20'
                : 'from-black/80 via-black/30 to-black/10'
            )}
            aria-hidden
          />
        )}

        {/* Vignette */}
        {list.coverImage && (
          <div
            className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]"
            aria-hidden
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col items-center justify-end gap-1.5 px-4 pb-6 pt-10">
          <span className="inline-flex items-center gap-2.5">
            {isClosed ? (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-sm">
                Voting Ended
              </span>
            ) : (
              <>
                <span className="relative inline-flex size-2.5 sm:size-3" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] sm:size-3" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                  Live Voting
                </span>
              </>
            )}
          </span>

          {list.name && (
            <p
              className={cn(
                'line-clamp-2 text-2xl font-bold leading-tight drop-shadow-md sm:text-4xl',
                isClosed ? 'text-white/50' : 'text-white'
              )}
            >
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
