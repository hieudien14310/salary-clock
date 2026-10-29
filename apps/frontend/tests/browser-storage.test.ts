import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { createBrowserStorage } from '../src/lib/browser-storage';
import { useStorageStatusStore } from '../src/stores/storage-status-store';

const ORIGINAL_WINDOW = Object.getOwnPropertyDescriptor(globalThis, 'window');
const storedValues = new Map<string, string>();
const storage = createBrowserStorage<{ amount: number }>();
const SAVED_VALUE = { state: { amount: 1_000_000 }, version: 0 };

beforeEach(() => {
  storedValues.clear();
  useStorageStatusStore.setState({ hasStorageError: false });
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
});

afterEach(() => {
  if (ORIGINAL_WINDOW) Object.defineProperty(globalThis, 'window', ORIGINAL_WINDOW);
  else Reflect.deleteProperty(globalThis, 'window');
});

describe('browser persistence failures', () => {
  test('round-trips data using the existing Zustand storage format', () => {
    storage.setItem('salary', SAVED_VALUE);
    expect(storage.getItem('salary')).toEqual(SAVED_VALUE);
    storage.removeItem('salary');
    expect(storage.getItem('salary')).toBeNull();
    expect(useStorageStatusStore.getState().hasStorageError).toBe(false);
  });

  test('falls back to defaults and reports malformed JSON', () => {
    storedValues.set('salary', '{broken');
    expect(storage.getItem('salary')).toBeNull();
    expect(useStorageStatusStore.getState().hasStorageError).toBe(true);
  });

  test('reports blocked access without interrupting store actions', () => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
    expect(storage.getItem('salary')).toBeNull();
    expect(() => storage.setItem('salary', SAVED_VALUE)).not.toThrow();
    expect(() => storage.removeItem('salary')).not.toThrow();
    expect(useStorageStatusStore.getState().hasStorageError).toBe(true);
  });

  test('reports quota failures without repeatedly notifying React subscribers', () => {
    window.localStorage.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
    let notifications = 0;
    const unsubscribe = useStorageStatusStore.subscribe(() => notifications++);
    try {
      expect(() => storage.setItem('salary', SAVED_VALUE)).not.toThrow();
      expect(() => storage.setItem('salary', SAVED_VALUE)).not.toThrow();
      expect(notifications).toBe(1);
      expect(useStorageStatusStore.getState().hasStorageError).toBe(true);
    } finally {
      unsubscribe();
    }
  });
});
