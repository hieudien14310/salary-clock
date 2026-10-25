export type ClockPrecision = 'second' | 'day';

const MILLISECONDS_PER_SECOND = 1_000;

export function getClockTimestamp(precision: ClockPrecision, now = Date.now()) {
  if (precision === 'second') return Math.floor(now / MILLISECONDS_PER_SECOND) * MILLISECONDS_PER_SECOND;
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

export function subscribeToClock(precision: ClockPrecision, onChange: (timestamp: number) => void) {
  let timeoutId: number | undefined;

  const updateTime = () => {
    window.clearTimeout(timeoutId);
    if (document.visibilityState === 'hidden') return;

    const now = Date.now();
    onChange(getClockTimestamp(precision, now));
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0);
    const delay =
      precision === 'second' ? MILLISECONDS_PER_SECOND - (now % MILLISECONDS_PER_SECOND) : nextDay.getTime() - now;
    timeoutId = window.setTimeout(updateTime, delay);
  };

  document.addEventListener('visibilitychange', updateTime);
  updateTime();

  return () => {
    window.clearTimeout(timeoutId);
    document.removeEventListener('visibilitychange', updateTime);
  };
}
