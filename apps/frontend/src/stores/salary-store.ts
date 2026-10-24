import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isValidMonthlySalary } from '@/lib/salary';

type SalaryState = {
  monthlySalary: number | null;
  setMonthlySalary: (amount: number | null) => void;
};

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      monthlySalary: null,
      setMonthlySalary: (amount) => {
        if (amount === null || isValidMonthlySalary(amount)) set({ monthlySalary: amount });
      },
    }),
    {
      name: 'salary-settings',
      partialize: ({ monthlySalary }) => ({ monthlySalary }),
      merge: (persistedState, currentState) => {
        const savedSalary = (persistedState as Partial<SalaryState> | null)?.monthlySalary;
        return { ...currentState, monthlySalary: isValidMonthlySalary(savedSalary) ? savedSalary : null };
      },
    },
  ),
);
