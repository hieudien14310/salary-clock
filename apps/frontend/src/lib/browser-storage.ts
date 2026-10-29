import type { PersistStorage } from 'zustand/middleware';
import { useStorageStatusStore } from '@/stores/storage-status-store';

function reportStorageError() {
  if (!useStorageStatusStore.getState().hasStorageError) {
    useStorageStatusStore.setState({ hasStorageError: true });
  }
}

export function createBrowserStorage<State>(): PersistStorage<State> {
  return {
    getItem: (name) => {
      try {
        const value = window.localStorage.getItem(name);
        return value === null ? null : JSON.parse(value);
      } catch {
        reportStorageError();
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, JSON.stringify(value));
      } catch {
        reportStorageError();
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        reportStorageError();
      }
    },
  };
}
