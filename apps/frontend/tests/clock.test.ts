import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { getClockTimestamp, subscribeToClock } from '../src/lib/clock';

describe('visible-page clock subscriptions', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const pendingTimers = new Map<number, { callback: () => void; delay: number }>();
  const clockDocument = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  let nextTimerId = 0;
  let currentTime = new Date(2026, 9, 25, 12, 0, 0, 250).getTime();
  let stopClock: (() => void) | undefined;
  let dateNow: ReturnType<typeof spyOn<typeof Date, 'now'>>;

  beforeEach(() => {
    currentTime = new Date(2026, 9, 25, 12, 0, 0, 250).getTime();
    pendingTimers.clear();
    clockDocument.visibilityState = 'visible';
    dateNow = spyOn(Date, 'now').mockImplementation(() => currentTime);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        setTimeout: (callback: () => void, delay: number) => {
          const timerId = ++nextTimerId;
          pendingTimers.set(timerId, { callback, delay });
          return timerId;
        },
        clearTimeout: (timerId: number) => pendingTimers.delete(timerId),
      },
    });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: clockDocument });
  });

  afterEach(() => {
    stopClock?.();
    stopClock = undefined;
    dateNow.mockRestore();
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  });

  function fireNextTimer() {
    const [timerId, timer] = [...pendingTimers.entries()][0]!;
    pendingTimers.delete(timerId);
    timer.callback();
  }

  function setVisibility(visibility: string) {
    clockDocument.visibilityState = visibility;
    clockDocument.dispatchEvent(new Event('visibilitychange'));
  }

  test('aligns updates to seconds and reads actual time after a delayed callback', () => {
    const timestamps: number[] = [];
    stopClock = subscribeToClock('second', (timestamp) => timestamps.push(timestamp));

    expect(timestamps).toEqual([getClockTimestamp('second', currentTime)]);
    expect([...pendingTimers.values()][0]!.delay).toBe(750);

    currentTime += 4_900;
    fireNextTimer();
    expect(timestamps[1]).toBe(getClockTimestamp('second', currentTime));
    expect(pendingTimers.size).toBe(1);
    expect([...pendingTimers.values()][0]!.delay).toBe(850);
  });

  test('pauses in the background and catches up immediately when visible', () => {
    const timestamps: number[] = [];
    stopClock = subscribeToClock('second', (timestamp) => timestamps.push(timestamp));
    setVisibility('hidden');
    expect(pendingTimers.size).toBe(0);

    currentTime += 90_000;
    expect(timestamps).toHaveLength(1);
    setVisibility('visible');
    expect(timestamps).toEqual([
      getClockTimestamp('second', currentTime - 90_000),
      getClockTimestamp('second', currentTime),
    ]);
    expect(pendingTimers.size).toBe(1);
  });

  test('does not schedule a timer for an initially hidden page', () => {
    clockDocument.visibilityState = 'hidden';
    const timestamps: number[] = [];
    stopClock = subscribeToClock('second', (timestamp) => timestamps.push(timestamp));
    expect(timestamps).toHaveLength(0);
    expect(pendingTimers.size).toBe(0);
    setVisibility('visible');
    expect(timestamps).toHaveLength(1);
    expect(pendingTimers.size).toBe(1);
  });

  test('cleans up timers and listeners before a StrictMode resubscription', () => {
    const timestamps: number[] = [];
    const onChange = (timestamp: number) => timestamps.push(timestamp);
    stopClock = subscribeToClock('second', onChange);
    stopClock();
    expect(pendingTimers.size).toBe(0);
    setVisibility('visible');
    expect(timestamps).toHaveLength(1);

    stopClock = subscribeToClock('second', onChange);
    currentTime += 1_000;
    setVisibility('visible');
    expect(timestamps).toHaveLength(3);
    expect(pendingTimers.size).toBe(1);
  });

  test('updates the daily clock at local midnight', () => {
    currentTime = new Date(2026, 9, 25, 23, 59, 59, 500).getTime();
    const timestamps: number[] = [];
    stopClock = subscribeToClock('day', (timestamp) => timestamps.push(timestamp));
    expect(timestamps[0]).toBe(new Date(2026, 9, 25).getTime());
    expect([...pendingTimers.values()][0]!.delay).toBe(500);

    currentTime += 500;
    fireNextTimer();
    expect(timestamps[1]).toBe(new Date(2026, 9, 26).getTime());
    expect(pendingTimers.size).toBe(1);
  });
});
