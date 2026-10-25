import { differenceInCalendarDays, isValid, lastDayOfMonth, parseISO, startOfDay, startOfMonth } from 'date-fns';

export const MAX_MONTHLY_SALARY = 999_999_999_999;
export const SALARY_DATE_FORMAT = 'yyyy-MM-dd';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR;
const INTEGER_FORMATTER = new Intl.NumberFormat('vi-VN');
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});
const RATE_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatSalaryInput = (amount: number) => INTEGER_FORMATTER.format(amount);

export const formatCurrency = (amount: number, showDecimals = false) =>
  (showDecimals ? RATE_FORMATTER : CURRENCY_FORMATTER).format(amount);

export const isValidMonthlySalary = (amount: unknown): amount is number =>
  typeof amount === 'number' && Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_MONTHLY_SALARY;

export function parseSalaryInput(value: string) {
  const salaryText = value.trim();

  if (!/^(\d+|\d{1,3}([.,\s])\d{3}(?:\2\d{3})*)$/.test(salaryText)) return null;

  const amount = Number(salaryText.replace(/[.,\s]/g, ''));
  return isValidMonthlySalary(amount) ? amount : null;
}

export function parseSalaryDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function getSalaryPeriod(
  currentTime: Date,
  paydayDate: Date | null = null,
  periodStartDate: Date = startOfMonth(currentTime),
) {
  const periodStart = startOfDay(periodStartDate);
  const payday = startOfDay(paydayDate ?? lastDayOfMonth(currentTime));

  return {
    periodStart,
    payday,
    daysInPeriod: differenceInCalendarDays(payday, periodStart) + 1,
  };
}

export function prepareSalaryCalculation(
  monthlySalary: number,
  currentTime: Date,
  paydayDate: Date | null = null,
  periodStartDate?: Date,
  unmarkedDates: readonly string[] = [],
) {
  const period = getSalaryPeriod(currentTime, paydayDate, periodStartDate);
  const unpaidDates = [...new Set(unmarkedDates)]
    .map(parseSalaryDate)
    .filter((date): date is Date => date !== null && date >= period.periodStart && date <= period.payday);
  const unpaidDaysCount = unpaidDates.length;
  const paidDaysCount = period.daysInPeriod - unpaidDaysCount;
  const netSalary = monthlySalary * (paidDaysCount / period.daysInPeriod);
  const perDay = monthlySalary / period.daysInPeriod;
  const perHour = perDay / HOURS_PER_DAY;
  const perMinute = perHour / MINUTES_PER_HOUR;
  const perSecond = perMinute / SECONDS_PER_MINUTE;

  return {
    ...period,
    monthlySalary,
    unpaidDates,
    paidDaysCount,
    unpaidDaysCount,
    netSalary,
    salaryDeduction: monthlySalary - netSalary,
    perDay,
    perHour,
    perMinute,
    perSecond,
  };
}

export type PreparedSalaryCalculation = ReturnType<typeof prepareSalaryCalculation>;

export function calculateSalaryProgress(
  salary: PreparedSalaryCalculation,
  currentTime: Date,
  hasReceivedSalary = false,
) {
  const secondsToday =
    currentTime.getHours() * SECONDS_PER_HOUR +
    currentTime.getMinutes() * SECONDS_PER_MINUTE +
    currentTime.getSeconds();
  const todayFraction = secondsToday / SECONDS_PER_DAY;
  const todayTimestamp = startOfDay(currentTime).getTime();
  const elapsedDays = differenceInCalendarDays(currentTime, salary.periodStart) + todayFraction;
  const isPeriodComplete = hasReceivedSalary || differenceInCalendarDays(currentTime, salary.payday) > 0;
  let unpaidElapsedDays = 0;
  let isTodayUnpaid = false;

  for (const date of salary.unpaidDates) {
    const timestamp = date.getTime();
    if (timestamp < todayTimestamp) unpaidElapsedDays += 1;
    else if (timestamp === todayTimestamp) {
      unpaidElapsedDays += todayFraction;
      isTodayUnpaid = true;
    }
  }

  const paidElapsedDays = Math.max(0, Math.min(elapsedDays, salary.daysInPeriod) - unpaidElapsedDays);

  return {
    ...salary,
    daysUntilPayday: differenceInCalendarDays(salary.payday, currentTime),
    periodProgress: isPeriodComplete ? 100 : Math.max(0, Math.min(elapsedDays / salary.daysInPeriod, 1)) * 100,
    isPeriodComplete,
    hasReceivedSalary,
    earnedInPeriod: isPeriodComplete
      ? salary.netSalary
      : Math.min(salary.netSalary, salary.monthlySalary * (paidElapsedDays / salary.daysInPeriod)),
    earnedToday: isPeriodComplete || isTodayUnpaid || elapsedDays < 0 ? 0 : salary.perSecond * secondsToday,
  };
}

export function calculateSalary(
  monthlySalary: number,
  currentTime: Date,
  paydayDate: Date | null = null,
  periodStartDate?: Date,
  hasReceivedSalary = false,
  unmarkedDates: readonly string[] = [],
) {
  const salary = prepareSalaryCalculation(monthlySalary, currentTime, paydayDate, periodStartDate, unmarkedDates);
  return calculateSalaryProgress(salary, currentTime, hasReceivedSalary);
}

export type SalaryCalculation = ReturnType<typeof calculateSalary>;
