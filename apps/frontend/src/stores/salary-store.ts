import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBrowserStorage } from '@/lib/browser-storage';
import { format, getDaysInMonth, isSameDay, isValid, setDate, startOfDay, startOfMonth } from 'date-fns';
import { getSalaryPeriod, isValidMonthlySalary, parseSalaryDate, SALARY_DATE_FORMAT } from '@/lib/salary';

type SalaryState = {
  monthlySalary: number | null;
  paydayDate: string | null;
  periodStartDate: string | null;
  hasReceivedSalary: boolean;
  setMonthlySalary: (amount: number | null) => void;
  setSalarySettings: (amount: number, paydayDate: Date, periodStart: Date) => void;
  markSalaryReceived: () => void;
};

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      monthlySalary: null,
      paydayDate: null,
      periodStartDate: null,
      hasReceivedSalary: false,
      setMonthlySalary: (amount) => {
        if (amount === null || isValidMonthlySalary(amount)) {
          set({ monthlySalary: amount, hasReceivedSalary: amount !== null && get().hasReceivedSalary });
        }
      },
      setSalarySettings: (amount, paydayDate, periodStart) => {
        if (!isValidMonthlySalary(amount) || !isValid(paydayDate) || !isValid(periodStart)) return;
        if (startOfDay(paydayDate) < startOfDay(periodStart)) return;

        const nextPaydayDate = format(paydayDate, SALARY_DATE_FORMAT);
        const nextPeriodStartDate = format(periodStart, SALARY_DATE_FORMAT);
        const currentSettings = get();

        set({
          monthlySalary: amount,
          paydayDate: nextPaydayDate,
          periodStartDate: nextPeriodStartDate,
          hasReceivedSalary:
            currentSettings.hasReceivedSalary &&
            currentSettings.paydayDate === nextPaydayDate &&
            currentSettings.periodStartDate === nextPeriodStartDate,
        });
      },
      markSalaryReceived: () => {
        const { monthlySalary, paydayDate, periodStartDate, hasReceivedSalary } = get();
        if (!isValidMonthlySalary(monthlySalary) || hasReceivedSalary) return;

        const currentTime = new Date();
        const period = getSalaryPeriod(
          currentTime,
          parseSalaryDate(paydayDate),
          parseSalaryDate(periodStartDate) ?? undefined,
        );
        if (!isSameDay(period.payday, currentTime)) return;

        set({
          hasReceivedSalary: true,
          paydayDate: format(period.payday, SALARY_DATE_FORMAT),
          periodStartDate: format(period.periodStart, SALARY_DATE_FORMAT),
        });
      },
    }),
    {
      name: 'salary-settings',
      storage: createBrowserStorage(),
      partialize: ({ monthlySalary, paydayDate, periodStartDate, hasReceivedSalary }) => ({
        monthlySalary,
        paydayDate,
        periodStartDate,
        hasReceivedSalary,
      }),
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
          payday && periodStart && payday >= periodStart
            ? {
                paydayDate: format(payday, SALARY_DATE_FORMAT),
                periodStartDate: format(periodStart, SALARY_DATE_FORMAT),
              }
            : { paydayDate: null, periodStartDate: null };
        return {
          ...currentState,
          ...savedPeriod,
          monthlySalary: isValidMonthlySalary(savedSettings?.monthlySalary) ? savedSettings.monthlySalary : null,
          hasReceivedSalary:
            savedSettings?.hasReceivedSalary === true &&
            isValidMonthlySalary(savedSettings?.monthlySalary) &&
            savedPeriod.paydayDate !== null,
        };
      },
    },
  ),
);
