import * as constants from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-2">
          <p className="text-base font-bold uppercase">{constants.APP_NAME}</p>
        </div>
        <p className="text-xs text-foreground/80">
          Built at {constants.COMMUNITY_NAME} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
