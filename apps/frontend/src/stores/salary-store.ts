import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isValidMonthlySalary, isValidPaydayDay, type PaydayDay } from '@/lib/salary';

type SalaryState = {
  monthlySalary: number | null;
  paydayDay: PaydayDay;
  setMonthlySalary: (amount: number | null) => void;
  setSalarySettings: (amount: number, paydayDay: PaydayDay) => void;
};

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      monthlySalary: null,
      paydayDay: null,
      setMonthlySalary: (amount) => {
        if (amount === null || isValidMonthlySalary(amount)) set({ monthlySalary: amount });
      },
      setSalarySettings: (amount, paydayDay) => {
        if (isValidMonthlySalary(amount) && isValidPaydayDay(paydayDay)) set({ monthlySalary: amount, paydayDay });
      },
    }),
    {
      name: 'salary-settings',
      partialize: ({ monthlySalary, paydayDay }) => ({ monthlySalary, paydayDay }),
      merge: (persistedState, currentState) => {
        const savedSettings = persistedState as Partial<SalaryState> | null;
        return {
          ...currentState,
          monthlySalary: isValidMonthlySalary(savedSettings?.monthlySalary) ? savedSettings.monthlySalary : null,
          paydayDay: isValidPaydayDay(savedSettings?.paydayDay) ? savedSettings.paydayDay : null,
        };
      },
    },
  ),
);
