import { z } from 'zod';
import { isValidMonthlySalary, parseSalaryDate } from '@/lib/salary';

const SALARY_DATE_SCHEMA = z.string().refine((value) => parseSalaryDate(value) !== null);

const SALARY_HISTORY_ENTRY_SCHEMA = z
  .object({
    monthlySalary: z.custom<number>(isValidMonthlySalary),
    periodStartDate: SALARY_DATE_SCHEMA,
    paydayDate: SALARY_DATE_SCHEMA,
    confirmedDate: SALARY_DATE_SCHEMA,
    unmarkedDates: z.array(SALARY_DATE_SCHEMA),
  })
  .refine(
    ({ periodStartDate, paydayDate, confirmedDate, unmarkedDates }) =>
      periodStartDate <= paydayDate &&
      paydayDate <= confirmedDate &&
      unmarkedDates.every((date) => date >= periodStartDate && date <= paydayDate),
  );

export type SalaryHistoryEntry = z.infer<typeof SALARY_HISTORY_ENTRY_SCHEMA>;

export function parseSalaryHistory(value: unknown): SalaryHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  const historyByPeriod = new Map<string, SalaryHistoryEntry>();
  for (const savedEntry of value) {
    const result = SALARY_HISTORY_ENTRY_SCHEMA.safeParse(savedEntry);
    if (!result.success) continue;

    const periodKey = `${result.data.periodStartDate}/${result.data.paydayDate}`;
    if (!historyByPeriod.has(periodKey)) historyByPeriod.set(periodKey, result.data);
  }
  return [...historyByPeriod.values()];
}
