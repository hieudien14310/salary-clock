import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, getDaysInMonth, isValid, setDate, startOfMonth } from 'date-fns';
import { isValidMonthlySalary, parseSalaryDate, SALARY_DATE_FORMAT } from '@/lib/salary';

type SalaryState = {
  monthlySalary: number | null;
  paydayDate: string | null;
  periodStartDate: string | null;
  setMonthlySalary: (amount: number | null) => void;
  setSalarySettings: (amount: number, paydayDate: Date, periodStart: Date) => void;
};

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      monthlySalary: null,
      paydayDate: null,
      periodStartDate: null,
      setMonthlySalary: (amount) => {
        if (amount === null || isValidMonthlySalary(amount)) set({ monthlySalary: amount });
      },
      setSalarySettings: (amount, paydayDate, periodStart) => {
        if (!isValidMonthlySalary(amount) || !isValid(paydayDate) || !isValid(periodStart)) return;
        if (periodStart.getDate() !== 1 || paydayDate < periodStart) return;

        set({
          monthlySalary: amount,
          paydayDate: format(paydayDate, SALARY_DATE_FORMAT),
          periodStartDate: format(periodStart, SALARY_DATE_FORMAT),
        });
      },
    }),
    {
      name: 'salary-settings',
      partialize: ({ monthlySalary, paydayDate, periodStartDate }) => ({ monthlySalary, paydayDate, periodStartDate }),
      merge: (persistedState, currentState) => {
        const savedSettings = persistedState as (Partial<SalaryState> & { paydayDay?: unknown }) | null;
        let payday = parseSalaryDate(savedSettings?.paydayDate);
        let periodStart = parseSalaryDate(savedSettings?.periodStartDate);
        const legacyPaydayDay = savedSettings?.paydayDay;

        if (
          savedSettings?.paydayDate === undefined &&
          typeof legacyPaydayDay === 'number' &&
          Number.isInteger(legacyPaydayDay) &&
          legacyPaydayDay >= 1 &&
          legacyPaydayDay <= 31
        ) {
          periodStart = startOfMonth(new Date());
          payday = setDate(periodStart, Math.min(legacyPaydayDay, getDaysInMonth(periodStart)));
        }

        const savedPeriod =
          payday && periodStart && periodStart.getDate() === 1 && payday >= periodStart
            ? {
                paydayDate: format(payday, SALARY_DATE_FORMAT),
                periodStartDate: format(periodStart, SALARY_DATE_FORMAT),
              }
            : { paydayDate: null, periodStartDate: null };
        return {
          ...currentState,
          ...savedPeriod,
          monthlySalary: isValidMonthlySalary(savedSettings?.monthlySalary) ? savedSettings.monthlySalary : null,
        };
      },
    },
  ),
);
