const clockListeners = new Set<() => void>();
let clockSnapshot = Date.now();
let clockIntervalId: ReturnType<typeof setInterval> | null = null;

const tickClock = () => {
  clockSnapshot = Date.now();
  for (const listener of clockListeners) listener();
};

const startClock = () => {
  if (clockIntervalId !== null) return;
  clockIntervalId = setInterval(tickClock, 1000);
};

const stopClockIfUnused = () => {
  if (clockListeners.size > 0 || clockIntervalId === null) return;
  clearInterval(clockIntervalId);
  clockIntervalId = null;
};

export const subscribeToCountdownClock = (onStoreChange: () => void) => {
  clockListeners.add(onStoreChange);
  startClock();

  return () => {
    clockListeners.delete(onStoreChange);
    stopClockIfUnused();
  };
};

export const getCountdownNowSnapshot = () => clockSnapshot;

export type TimeRemainingParts = {
  isClosed: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export function getTimeRemainingParts(
  endTime: string | undefined,
  nowMs: number
): TimeRemainingParts | null {
  if (!endTime) return null;

  const timeLeft = new Date(endTime).getTime() - nowMs;
  if (timeLeft <= 0) {
    return {
      isClosed: true,
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isClosed: false,
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function formatTimeRemaining(endTime: string | undefined, nowMs: number) {
  const parts = getTimeRemainingParts(endTime, nowMs);
  if (!parts) return '';
  if (parts.isClosed) return 'Voting closed';

  const days = Number(parts.days);
  const hours = Number(parts.hours);
  const minutes = Number(parts.minutes);
  const seconds = Number(parts.seconds);

  if (days > 0) return `Time remanining: ${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `Time remanining: ${hours}h ${minutes}m ${seconds}s`;
  return `Time remanining: ${minutes}m ${seconds}s`;
}
