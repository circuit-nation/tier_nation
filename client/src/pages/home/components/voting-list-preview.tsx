import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { List } from '@/types';

type VotingListPreviewProps = {
  list: List;
};

export function VotingListPreview({ list }: VotingListPreviewProps) {
  const isLocked = list.isLocked;
  const hasSubmitted = list.userStatus?.hasSubmitted ?? false;
  const voteHref = hasSubmitted ? `/results/${list.id}` : `/voting/${list.id}`;

  const content = (
    <div className="relative z-10 flex h-full w-full flex-col justify-between p-2.5">
      {/* Status pill */}
      <div className="flex items-center gap-1.5">
        {isLocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-white/50 backdrop-blur-sm">
            <svg
              className="size-2.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17 10V7A5 5 0 0 0 7 7v3H5v11h14V10h-2ZM9 7a3 3 0 1 1 6 0v3H9V7Z" />
            </svg>
            Locked
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
            isLocked ? 'text-white/40' : 'text-white'
          )}
        >
          {list.name}
        </p>
      </div>
    </div>
  );

  const inner = isLocked ? (
    <div className="block h-full cursor-not-allowed">{content}</div>
  ) : (
    <Link to={voteHref} className="group/link block h-full">
      {content}
    </Link>
  );

  return (
    <section className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-md">
      {/* Backdrop image with hover zoom (only when not locked) */}
      {list.coverImage ? (
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out',
            !isLocked && 'group-hover/link:scale-110'
          )}
          style={{ backgroundImage: `url(${list.coverImage})` }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-card/70" aria-hidden />
      )}

      {/* Gradient overlay: stronger at bottom for text legibility */}
      {list.coverImage && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent',
            isLocked && 'from-black/85 via-black/50 to-black/30'
          )}
          aria-hidden
        />
      )}

      {/* Hover shimmer ring */}
      {!isLocked && (
        <div
          className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover/link:ring-white/20"
          aria-hidden
        />
      )}

      {inner}
    </section>
  );
}
