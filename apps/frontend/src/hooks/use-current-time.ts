import { useEffect, useMemo, useState } from 'react';
import { getClockTimestamp, subscribeToClock, type ClockPrecision } from '@/lib/clock';

function useClock(precision: ClockPrecision, enabled = true) {
  const [timestamp, setTimestamp] = useState(() => getClockTimestamp(precision));

  useEffect(() => {
    if (enabled) return subscribeToClock(precision, setTimestamp);
  }, [precision, enabled]);

  return useMemo(() => new Date(timestamp), [timestamp]);
}

export function useCurrentTime(enabled = true) {
  return useClock('second', enabled);
}

export function useCurrentDay() {
  return useClock('day');
}
