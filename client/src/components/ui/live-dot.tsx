import { useState, useEffect } from 'react';

interface LiveIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'pill' | 'broadcast';
}

const sizes = {
  sm: { dot: 8, pulse: 18, text: '11px', gap: 6 },
  md: { dot: 11, pulse: 24, text: '13px', gap: 8 },
  lg: { dot: 15, pulse: 32, text: '16px', gap: 10 },
};

export default function LiveIndicator({
  label = 'LIVE',
  size = 'md',
  variant = 'pill',
}: LiveIndicatorProps) {
  const [tick, setTick] = useState(0);

  // Drive a subtle label flicker every ~2.5s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  const s = sizes[size];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        .live-root {
          display: inline-flex;
          align-items: center;
          font-family: 'DM Mono', monospace;
          user-select: none;
        }

        /* ── MINIMAL ─────────────────────────────────── */
        .live-minimal {
          gap: ${s.gap}px;
        }

        /* ── PILL ────────────────────────────────────── */
        .live-pill {
          gap: ${s.gap}px;
          padding: ${s.gap * 0.7}px ${s.gap * 1.6}px;
          background: rgba(220, 30, 30, 0.10);
          border: 1px solid rgba(220, 30, 30, 0.30);
          border-radius: 999px;
          backdrop-filter: blur(4px);
        }

        /* ── BROADCAST ───────────────────────────────── */
        .live-broadcast {
          gap: ${s.gap}px;
          padding: ${s.gap * 0.6}px ${s.gap * 1.4}px ${s.gap * 0.6}px ${s.gap * 1.1}px;
          background: #d01414;
          border-radius: 3px;
          box-shadow: 0 2px 12px rgba(208,20,20,0.55);
          position: relative;
          overflow: hidden;
        }
        .live-broadcast::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── DOT WRAPPER ─────────────────────────────── */
        .dot-wrap {
          position: relative;
          width: ${s.pulse}px;
          height: ${s.pulse}px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ripple ring */
        .dot-ring {
          position: absolute;
          width: ${s.dot}px;
          height: ${s.dot}px;
          border-radius: 50%;
          background: #e82222;
          animation: ripple 1.6s ease-out infinite;
        }
        .dot-ring-2 {
          animation-delay: 0.55s;
        }

        /* solid dot */
        .dot-core {
          position: relative;
          width: ${s.dot}px;
          height: ${s.dot}px;
          border-radius: 50%;
          background: #ff2b2b;
          box-shadow: 0 0 ${s.dot * 0.9}px 2px rgba(255,43,43,0.70);
          animation: glow-pulse 1.6s ease-in-out infinite;
          z-index: 1;
        }

        /* broadcast variant: white dot */
        .live-broadcast .dot-core {
          background: #fff;
          box-shadow: 0 0 ${s.dot * 0.9}px 2px rgba(255,255,255,0.60);
          animation: glow-pulse-white 1.6s ease-in-out infinite;
        }
        .live-broadcast .dot-ring {
          background: rgba(255,255,255,0.70);
        }

        /* ── LABEL ───────────────────────────────────── */
        .live-label {
          font-size: ${s.text};
          font-weight: 500;
          letter-spacing: 0.12em;
          animation: label-breath 2.5s ease-in-out infinite;
        }
        .live-broadcast .live-label {
          color: #fff;
          letter-spacing: 0.18em;
          font-weight: 500;
        }

        /* ── KEYFRAMES ───────────────────────────────── */
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.75; }
          80%  { transform: scale(2.8); opacity: 0;    }
          100% { transform: scale(2.8); opacity: 0;    }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 ${s.dot * 0.9}px 2px rgba(255,43,43,0.70); }
          50%       { box-shadow: 0 0 ${s.dot * 1.8}px 4px rgba(255,43,43,0.35); }
        }

        @keyframes glow-pulse-white {
          0%, 100% { box-shadow: 0 0 ${s.dot * 0.9}px 2px rgba(255,255,255,0.60); }
          50%       { box-shadow: 0 0 ${s.dot * 1.8}px 4px rgba(255,255,255,0.25); }
        }

        @keyframes label-breath {
          0%, 100% { opacity: 1;    }
          45%       { opacity: 0.65; }
          55%       { opacity: 0.65; }
        }
      `}</style>

      <span
        className={`live-root live-${variant}`}
        role="status"
        aria-label={`${label} indicator`}
      >
        <span className="dot-wrap">
          <span className="dot-ring" />
          <span className="dot-ring dot-ring-2" />
          <span className="dot-core" />
        </span>
        <span className="live-label text-white" key={tick}>
          {label}
        </span>
      </span>
    </>
  );
}
