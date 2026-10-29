import { afterAll, beforeAll, beforeEach, describe, expect, spyOn, test } from 'bun:test';

const STORAGE_KEY = 'salary-settings';
const ORIGINAL_WINDOW = Object.getOwnPropertyDescriptor(globalThis, 'window');
const storedValues = new Map<string, string>();
let useSalaryStore: typeof import('../src/stores/salary-store').useSalaryStore;

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
});

beforeEach(() => {
  storedValues.clear();
  useSalaryStore.setState({ monthlySalary: null, paydayDate: null, periodStartDate: null, hasReceivedSalary: false });
});

afterAll(() => {
  if (ORIGINAL_WINDOW) Object.defineProperty(globalThis, 'window', ORIGINAL_WINDOW);
  else Reflect.deleteProperty(globalThis, 'window');
});

describe('custom salary period storage', () => {
  test('keeps in-memory settings usable when browser storage is full', () => {
    const writeStorage = spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    try {
      expect(() =>
        useSalaryStore.getState().setSalarySettings(60_000_000, new Date(2026, 10, 18), new Date(2026, 8, 20)),
      ).not.toThrow();
      expect(useSalaryStore.getState().monthlySalary).toBe(60_000_000);
      expect(useSalaryStore.getState().paydayDate).toBe('2026-11-18');
    } finally {
      writeStorage.mockRestore();
    }
  });

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
