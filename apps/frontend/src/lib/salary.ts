import { differenceInCalendarDays, getDate, getDaysInMonth, setDate, startOfMonth } from 'date-fns';

export const MAX_MONTHLY_SALARY = 999_999_999_999;
export const MAX_PAYDAY_DAY = 31;

export type PaydayDay = number | null;

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

export const isValidPaydayDay = (day: unknown): day is PaydayDay =>
  day === null || (typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= MAX_PAYDAY_DAY);

export function parseSalaryInput(value: string) {
  const salaryText = value.trim();

  if (!/^(\d+|\d{1,3}([.,\s])\d{3}(?:\2\d{3})*)$/.test(salaryText)) return null;

  const amount = Number(salaryText.replace(/[.,\s]/g, ''));
  return isValidMonthlySalary(amount) ? amount : null;
}

export function getSalaryPeriod(currentTime: Date, paydayDay: PaydayDay = null) {
  const daysInMonth = getDaysInMonth(currentTime);
  const daysInPeriod = Math.min(paydayDay ?? daysInMonth, daysInMonth);
  const periodStart = startOfMonth(currentTime);

  return {
    periodStart,
    payday: setDate(periodStart, daysInPeriod),
    daysInPeriod,
  };
}

export function calculateSalary(monthlySalary: number, currentTime: Date, paydayDay: PaydayDay = null) {
  const period = getSalaryPeriod(currentTime, paydayDay);
  const secondsToday =
    currentTime.getHours() * SECONDS_PER_HOUR +
    currentTime.getMinutes() * SECONDS_PER_MINUTE +
    currentTime.getSeconds();
  const elapsedDays = getDate(currentTime) - 1 + secondsToday / SECONDS_PER_DAY;
  const periodFraction = Math.min(elapsedDays / period.daysInPeriod, 1);
  const isPeriodComplete = getDate(currentTime) > period.daysInPeriod;
  const perDay = monthlySalary / period.daysInPeriod;
  const perHour = perDay / HOURS_PER_DAY;
  const perMinute = perHour / MINUTES_PER_HOUR;
  const perSecond = perMinute / SECONDS_PER_MINUTE;

  return {
    ...period,
    daysUntilPayday: differenceInCalendarDays(period.payday, currentTime),
    periodProgress: periodFraction * 100,
    isPeriodComplete,
    earnedThisMonth: monthlySalary * periodFraction,
    earnedToday: isPeriodComplete ? 0 : perSecond * secondsToday,
    perDay,
    perHour,
    perMinute,
    perSecond,
  };
}

export type SalaryCalculation = ReturnType<typeof calculateSalary>;
