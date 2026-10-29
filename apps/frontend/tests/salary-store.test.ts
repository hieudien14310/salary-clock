import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, setSystemTime, test } from 'bun:test';
import { prepareSalaryCalculation } from '../src/lib/salary';

const STORAGE_KEY = 'salary-settings';
const ORIGINAL_WINDOW = Object.getOwnPropertyDescriptor(globalThis, 'window');
const storedValues = new Map<string, string>();
let useSalaryStore: typeof import('../src/stores/salary-store').useSalaryStore;
let useAttendanceStore: typeof import('../src/stores/attendance-store').useAttendanceStore;

beforeAll(async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storedValues.get(key) ?? null,
        setItem: (key: string, value: string) => storedValues.set(key, value),
        removeItem: (key: string) => storedValues.delete(key),
      },
    },
  });
  ({ useSalaryStore } = await import('../src/stores/salary-store'));
  ({ useAttendanceStore } = await import('../src/stores/attendance-store'));
});

beforeEach(() => {
  setSystemTime(new Date(2026, 9, 28, 12));
  storedValues.clear();
  useSalaryStore.setState({
    monthlySalary: null,
    paydayDate: null,
    periodStartDate: null,
    hasReceivedSalary: false,
    salaryHistory: [],
  });
  useAttendanceStore.setState({ unmarkedDates: [] });
});

afterEach(() => setSystemTime());

afterAll(() => {
  if (ORIGINAL_WINDOW) Object.defineProperty(globalThis, 'window', ORIGINAL_WINDOW);
  else Reflect.deleteProperty(globalThis, 'window');
});

describe('custom salary period storage', () => {
  test('saves and rehydrates a start date other than the first day', async () => {
    useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 10, 18), new Date(2026, 8, 20));
    expect(JSON.parse(storedValues.get(STORAGE_KEY)!).state).toMatchObject({
      monthlySalary: 60_000_000,
      periodStartDate: '2026-09-20',
      paydayDate: '2026-11-18',
    });
    await useSalaryStore.persist.rehydrate();
    expect(useSalaryStore.getState().periodStartDate).toBe('2026-09-20');
    expect(useSalaryStore.getState().paydayDate).toBe('2026-11-18');
  });

  test('keeps the saved period when an invalid reversed range is submitted', () => {
    useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 10, 18), new Date(2026, 8, 20));
    useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 8, 19), new Date(2026, 8, 20));
    expect(useSalaryStore.getState().paydayDate).toBe('2026-11-18');
  });

  test('resets salary receipt when the start date changes, even with the same payday', () => {
    useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 10, 18), new Date(2026, 8, 20));
    useSalaryStore.setState({ hasReceivedSalary: true });
    useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 10, 18), new Date(2026, 8, 21));
    expect(useSalaryStore.getState().hasReceivedSalary).toBe(false);
  });

  test('accepts one calendar day even when the start time is later than the end time', () => {
    useSalaryStore.getState().setSalarySettings(1_000_000, new Date(2026, 8, 20, 8), new Date(2026, 8, 20, 15));
    expect(useSalaryStore.getState().periodStartDate).toBe('2026-09-20');
    expect(useSalaryStore.getState().paydayDate).toBe('2026-09-20');
  });

  test('preserves existing records whose period starts on the first day', async () => {
    storedValues.set(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          monthlySalary: 32_000_000,
          periodStartDate: '2026-10-01',
          paydayDate: '2026-10-30',
          hasReceivedSalary: false,
        },
        version: 0,
      }),
    );
    await useSalaryStore.persist.rehydrate();
    expect(useSalaryStore.getState().monthlySalary).toBe(32_000_000);
    expect(useSalaryStore.getState().periodStartDate).toBe('2026-10-01');
    expect(useSalaryStore.getState().paydayDate).toBe('2026-10-30');
  });
});

describe('salary period history', () => {
  test('snapshots salary and only unpaid dates within the period when receipt is confirmed', () => {
    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useAttendanceStore.setState({
      unmarkedDates: ['2026-09-30', '2026-10-03', '2026-10-03', '2026-10-28', '2026-10-29'],
    });
    useSalaryStore.getState().markSalaryReceived();

    expect(useSalaryStore.getState().hasReceivedSalary).toBe(true);
    expect(useSalaryStore.getState().salaryHistory).toEqual([
      {
        monthlySalary: 2_800_000,
        periodStartDate: '2026-10-01',
        paydayDate: '2026-10-28',
        confirmedDate: '2026-10-28',
        unmarkedDates: ['2026-10-03', '2026-10-28'],
      },
    ]);
    const entry = useSalaryStore.getState().salaryHistory[0];
    const salary = prepareSalaryCalculation(
      entry.monthlySalary,
      new Date(2026, 9, 28),
      new Date(2026, 9, 28),
      new Date(2026, 9, 1),
      entry.unmarkedDates,
    );
    expect(salary.salaryDeduction).toBe(200_000);
    expect(salary.netSalary).toBe(2_600_000);
  });

  test('allows late confirmation but refuses confirmation before payday or without a salary', () => {
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toEqual([]);

    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 29), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().hasReceivedSalary).toBe(false);
    expect(useSalaryStore.getState().salaryHistory).toEqual([]);

    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 25), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().hasReceivedSalary).toBe(true);
    expect(useSalaryStore.getState().salaryHistory[0].confirmedDate).toBe('2026-10-28');
    expect(useSalaryStore.getState().salaryHistory[0].paydayDate).toBe('2026-10-25');
  });

  test('preserves a confirmed snapshot when attendance or salary changes and when current salary is cleared', () => {
    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useAttendanceStore.getState().toggleAttendance('2026-10-03');
    useSalaryStore.getState().markSalaryReceived();
    const savedHistory = structuredClone(useSalaryStore.getState().salaryHistory);

    useAttendanceStore.getState().toggleAttendance('2026-10-03');
    useAttendanceStore.getState().toggleAttendance('2026-10-04');
    useSalaryStore.getState().setSalarySettings(3_000_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toEqual(savedHistory);

    useSalaryStore.getState().setSalarySettings(4_000_000, new Date(2026, 10, 28), new Date(2026, 10, 1));
    useSalaryStore.getState().setMonthlySalary(null);
    expect(useSalaryStore.getState().salaryHistory).toEqual(savedHistory);
  });

  test('keeps distinct periods and updates an explicitly reconfirmed period without duplicates', () => {
    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toHaveLength(1);

    useSalaryStore.getState().setSalarySettings(2_700_000, new Date(2026, 9, 28), new Date(2026, 9, 2));
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toHaveLength(2);

    useSalaryStore.getState().setSalarySettings(3_000_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toHaveLength(2);
    expect(useSalaryStore.getState().salaryHistory[0].monthlySalary).toBe(3_000_000);
  });

  test('persists confirmed periods and restores them after rehydration', async () => {
    useSalaryStore.getState().setSalarySettings(2_800_000, new Date(2026, 9, 28), new Date(2026, 9, 1));
    useSalaryStore.getState().markSalaryReceived();
    const savedHistory = structuredClone(useSalaryStore.getState().salaryHistory);
    const savedSettings = storedValues.get(STORAGE_KEY)!;

    useSalaryStore.setState({ salaryHistory: [] });
    storedValues.set(STORAGE_KEY, savedSettings);
    await useSalaryStore.persist.rehydrate();
    expect(useSalaryStore.getState().salaryHistory).toEqual(savedHistory);
  });

  test('lets an already received period from older storage be added to history once', async () => {
    storedValues.set(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          monthlySalary: 2_800_000,
          periodStartDate: '2026-10-01',
          paydayDate: '2026-10-28',
          hasReceivedSalary: true,
        },
        version: 0,
      }),
    );
    await useSalaryStore.persist.rehydrate();
    expect(useSalaryStore.getState().salaryHistory).toEqual([]);
    useSalaryStore.getState().markSalaryReceived();
    useSalaryStore.getState().markSalaryReceived();
    expect(useSalaryStore.getState().salaryHistory).toHaveLength(1);
  });

  test('ignores invalid or duplicate stored history entries without losing valid history', async () => {
    const validEntry = {
      monthlySalary: 2_800_000,
      periodStartDate: '2026-10-01',
      paydayDate: '2026-10-28',
      confirmedDate: '2026-10-28',
      unmarkedDates: ['2026-10-03'],
    };
    storedValues.set(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          salaryHistory: [
            validEntry,
            validEntry,
            null,
            { ...validEntry, monthlySalary: -1 },
            { ...validEntry, periodStartDate: '2026-02-30' },
            { ...validEntry, periodStartDate: '2026-10-29' },
            { ...validEntry, confirmedDate: '2026-10-27' },
            { ...validEntry, unmarkedDates: ['2026-10-29'] },
          ],
        },
        version: 0,
      }),
    );
    await useSalaryStore.persist.rehydrate();
    expect(useSalaryStore.getState().salaryHistory).toEqual([validEntry]);
  });
});
