import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { List } from '@/types';

type VotingListPreviewProps = {
  list: List;
};

function isListClosed(list: List): boolean {
  if (list.isLocked) return true;
  if (list.votingOpen === false) return true;
  if (list.status === 'ended' || list.status === 'locked' || list.status === 'archived') return true;
  if (list.endTime && new Date() > new Date(list.endTime)) return true;
  return false;
}

export function VotingListPreview({ list }: VotingListPreviewProps) {
  const isClosed = isListClosed(list);
  const hasSubmitted = list.userStatus?.hasSubmitted ?? false;
  const voteHref = hasSubmitted ? `/results/${list.id}` : `/voting/${list.id}`;

  const content = (
    <div className="relative z-10 flex h-full w-full flex-col justify-between p-2.5">
      {/* Status pill */}
      <div className="flex items-center gap-1.5">
        {isClosed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-white/50 backdrop-blur-sm">
            Closed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
            <span
              className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
              aria-hidden
            />
            Open
          </span>
        )}
      </div>

      {/* Name — anchored to bottom */}
      <div>
        <p
          className={cn(
            'line-clamp-2 text-xs font-semibold leading-snug tracking-wide drop-shadow-sm',
            isClosed ? 'text-white/40' : 'text-white'
          )}
        >
          {list.name}
        </p>
      </div>
    </div>
  );

  const inner = isClosed ? (
    <Link
      to={voteHref}
      aria-disabled="true"
      tabIndex={-1}
      onClick={(e) => e.preventDefault()}
      className="block h-full cursor-not-allowed"
    >
      {content}
    </Link>
  ) : (
    <Link to={voteHref} className="group/link block h-full">
      {content}
    </Link>
  );

  return (
    <section className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-md">
      {/* Backdrop image */}
      {list.coverImage ? (
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out',
            !isClosed && 'group-hover/link:scale-110',
            isClosed && 'grayscale'
          )}
          style={{ backgroundImage: `url(${list.coverImage})` }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-card/70" aria-hidden />
      )}

      {/* Gradient overlay */}
      {list.coverImage && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t',
            isClosed
              ? 'from-black/85 via-black/50 to-black/30'
              : 'from-black/75 via-black/20 to-transparent'
          )}
          aria-hidden
        />
      )}

      {/* Hover shimmer ring — only for open lists */}
      {!isClosed && (
        <div
          className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover/link:ring-white/20"
          aria-hidden
        />
      )}

      {inner}
    </section>
  );
}
