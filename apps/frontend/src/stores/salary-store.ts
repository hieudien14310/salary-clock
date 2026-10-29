import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, getDaysInMonth, isValid, setDate, startOfDay, startOfMonth } from 'date-fns';
import {
  getSalaryPeriod,
  isValidMonthlySalary,
  parseSalaryDate,
  prepareSalaryCalculation,
  SALARY_DATE_FORMAT,
} from '@/lib/salary';
import { parseSalaryHistory, type SalaryHistoryEntry } from '@/schema/salary-history-schema';
import { useAttendanceStore } from '@/stores/attendance-store';

type SalaryState = {
  monthlySalary: number | null;
  paydayDate: string | null;
  periodStartDate: string | null;
  hasReceivedSalary: boolean;
  salaryHistory: SalaryHistoryEntry[];
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
      salaryHistory: [],
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
        const { monthlySalary, paydayDate, periodStartDate, hasReceivedSalary, salaryHistory } = get();
        if (!isValidMonthlySalary(monthlySalary)) return;

        const currentTime = new Date();
        const period = getSalaryPeriod(
          currentTime,
          parseSalaryDate(paydayDate),
          parseSalaryDate(periodStartDate) ?? undefined,
        );
        if (period.payday > startOfDay(currentTime)) return;

        const savedPaydayDate = format(period.payday, SALARY_DATE_FORMAT);
        const savedPeriodStartDate = format(period.periodStart, SALARY_DATE_FORMAT);
        const otherSalaryPeriods = salaryHistory.filter(
          (entry) => entry.paydayDate !== savedPaydayDate || entry.periodStartDate !== savedPeriodStartDate,
        );
        if (hasReceivedSalary && otherSalaryPeriods.length < salaryHistory.length) return;

        const salary = prepareSalaryCalculation(
          monthlySalary,
          currentTime,
          period.payday,
          period.periodStart,
          useAttendanceStore.getState().unmarkedDates,
        );
        const historyEntry: SalaryHistoryEntry = {
          monthlySalary,
          paydayDate: savedPaydayDate,
          periodStartDate: savedPeriodStartDate,
          confirmedDate: format(currentTime, SALARY_DATE_FORMAT),
          unmarkedDates: salary.unpaidDates.map((date) => format(date, SALARY_DATE_FORMAT)),
        };

        set({
          hasReceivedSalary: true,
          paydayDate: savedPaydayDate,
          periodStartDate: savedPeriodStartDate,
          salaryHistory: [historyEntry, ...otherSalaryPeriods],
        });
      },
    }),
    {
      name: 'salary-settings',
      partialize: ({ monthlySalary, paydayDate, periodStartDate, hasReceivedSalary, salaryHistory }) => ({
        monthlySalary,
        paydayDate,
        periodStartDate,
        hasReceivedSalary,
        salaryHistory,
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
          salaryHistory: parseSalaryHistory(savedSettings?.salaryHistory),
          hasReceivedSalary:
            savedSettings?.hasReceivedSalary === true &&
            isValidMonthlySalary(savedSettings?.monthlySalary) &&
            savedPeriod.paydayDate !== null,
        };
      },
    },
  ),
);
