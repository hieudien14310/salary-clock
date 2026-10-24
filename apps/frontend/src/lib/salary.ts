import { differenceInCalendarDays, differenceInSeconds, getDate, getDaysInMonth, lastDayOfMonth, startOfDay } from "date-fns";

export const MAX_MONTHLY_SALARY = 999_999_999_999;

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const INTEGER_FORMATTER = new Intl.NumberFormat("vi-VN");
const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const RATE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatSalaryInput = (amount: number) => INTEGER_FORMATTER.format(amount);

export const formatCurrency = (amount: number, showDecimals = false) =>
  (showDecimals ? RATE_FORMATTER : CURRENCY_FORMATTER).format(amount);

export const isValidMonthlySalary = (amount: unknown): amount is number =>
  typeof amount === "number" && Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_MONTHLY_SALARY;

export function parseSalaryInput(value: string) {
  const salaryText = value.trim();

  if (!/^(\d+|\d{1,3}([.,\s])\d{3}(?:\2\d{3})*)$/.test(salaryText)) return null;

  const amount = Number(salaryText.replace(/[.,\s]/g, ""));
  return isValidMonthlySalary(amount) ? amount : null;
}

export function calculateSalary(monthlySalary: number, currentTime: Date) {
  const payday = lastDayOfMonth(currentTime);
  const daysInMonth = getDaysInMonth(currentTime);
  const secondsToday = differenceInSeconds(currentTime, startOfDay(currentTime));
  const elapsedDays = getDate(currentTime) - 1 + secondsToday / SECONDS_PER_DAY;
  const perDay = monthlySalary / daysInMonth;
  const perHour = perDay / HOURS_PER_DAY;
  const perMinute = perHour / MINUTES_PER_HOUR;
  const perSecond = perMinute / SECONDS_PER_MINUTE;

  return {
    payday,
    daysInMonth,
    daysUntilPayday: differenceInCalendarDays(payday, currentTime),
    monthProgress: (elapsedDays / daysInMonth) * 100,
    earnedThisMonth: perDay * elapsedDays,
    earnedToday: perSecond * secondsToday,
    perDay,
    perHour,
    perMinute,
    perSecond,
  };
}

export type SalaryCalculation = ReturnType<typeof calculateSalary>;
