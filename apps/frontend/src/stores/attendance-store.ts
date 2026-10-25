import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseSalaryDate } from '@/lib/salary';

type AttendanceState = {
  unmarkedDates: string[];
  toggleAttendance: (date: string) => void;
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      unmarkedDates: [],
      toggleAttendance: (date) => {
        if (!parseSalaryDate(date)) return;

        set(({ unmarkedDates }) => ({
          unmarkedDates: unmarkedDates.includes(date)
            ? unmarkedDates.filter((unmarkedDate) => unmarkedDate !== date)
            : [...unmarkedDates, date],
        }));
      },
    }),
    {
      name: 'salary-attendance',
      partialize: ({ unmarkedDates }) => ({ unmarkedDates }),
      merge: (persistedState, currentState) => {
        const savedDates = (persistedState as { unmarkedDates?: unknown } | null)?.unmarkedDates;
        return {
          ...currentState,
          unmarkedDates: Array.isArray(savedDates)
            ? [...new Set(savedDates.filter((date): date is string => parseSalaryDate(date) !== null))]
            : [],
        };
      },
    },
  ),
);
