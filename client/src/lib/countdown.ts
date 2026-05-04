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

export function formatTimeRemaining(endTime: string | undefined, nowMs: number) {
  if (!endTime) return '';

  const timeLeft = new Date(endTime).getTime() - nowMs;
  if (timeLeft <= 0) return 'Voting closed';

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m left`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s left`;
  return `${minutes}m ${seconds}s left`;
}
