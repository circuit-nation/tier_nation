import * as constants from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-7">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold uppercase tracking-[0.04em] text-[#3E3E4A]">
            {constants.APP_NAME}
          </span>
          <span className="text-xs text-[#3E3E4A]">
            · Built at {constants.COMMUNITY_NAME} · {new Date().getFullYear()}
          </span>
        </div>
        <p className="text-xs text-[#3E3E4A]">
          Community-driven · No ads · Open source
        </p>
      </div>
    </footer>
  );
}
