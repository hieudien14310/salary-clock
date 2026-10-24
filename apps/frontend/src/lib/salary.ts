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

export function calculateSalary(
  monthlySalary: number,
  currentTime: Date,
  paydayDate: Date | null = null,
  periodStartDate?: Date,
  hasReceivedSalary = false,
) {
  const period = getSalaryPeriod(currentTime, paydayDate, periodStartDate);
  const secondsToday =
    currentTime.getHours() * SECONDS_PER_HOUR +
    currentTime.getMinutes() * SECONDS_PER_MINUTE +
    currentTime.getSeconds();
  const elapsedDays = differenceInCalendarDays(currentTime, period.periodStart) + secondsToday / SECONDS_PER_DAY;
  const isPeriodComplete = hasReceivedSalary || differenceInCalendarDays(currentTime, period.payday) > 0;
  const periodFraction = isPeriodComplete ? 1 : Math.max(0, Math.min(elapsedDays / period.daysInPeriod, 1));
  const perDay = monthlySalary / period.daysInPeriod;
  const perHour = perDay / HOURS_PER_DAY;
  const perMinute = perHour / MINUTES_PER_HOUR;
  const perSecond = perMinute / SECONDS_PER_MINUTE;

  return {
    ...period,
    daysUntilPayday: differenceInCalendarDays(period.payday, currentTime),
    periodProgress: periodFraction * 100,
    isPeriodComplete,
    hasReceivedSalary,
    earnedInPeriod: monthlySalary * periodFraction,
    earnedToday: isPeriodComplete ? 0 : perSecond * secondsToday,
    perDay,
    perHour,
    perMinute,
    perSecond,
  };
}

export type SalaryCalculation = ReturnType<typeof calculateSalary>;
