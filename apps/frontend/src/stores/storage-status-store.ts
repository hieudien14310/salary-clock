import { create } from 'zustand';

export const useStorageStatusStore = create(() => ({ hasStorageError: false }));
