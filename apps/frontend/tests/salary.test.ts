import { describe, expect, test } from 'bun:test';
import {
  calculateSalary,
  calculateSalaryProgress,
  formatSalaryInput,
  prepareSalaryCalculation,
} from '../src/lib/salary';

const MONTHLY_SALARY = 10_000_000;
const OCTOBER_PERIOD_START = new Date(2026, 9, 1);
const OCTOBER_PAYDAY = new Date(2026, 9, 25);
const OCTOBER_CURRENT_TIME = new Date(2026, 9, 24, 12);

describe('salary input formatting', () => {
  test.each([
    [300, '300'],
    ['300', '300'],
    ['3000', '3.000'],
    ['1000000', '1.000.000'],
    ['1.000.000', '1.000.000'],
    ['abc1,000!000 VND', '1.000.000'],
    ['', ''],
    ['abc! .', ''],
    ['0', '0'],
    ['0003000', '3.000'],
    ['9007199254740993', '9.007.199.254.740.993'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatSalaryInput(value)).toBe(expected);
  });
});

function calculateOctoberSalary(
  unmarkedDates: string[] = [],
  currentTime = OCTOBER_CURRENT_TIME,
  hasReceivedSalary = false,
) {
  return calculateSalary(
    MONTHLY_SALARY,
    currentTime,
    OCTOBER_PAYDAY,
    OCTOBER_PERIOD_START,
    hasReceivedSalary,
    unmarkedDates,
  );
}

describe('salary deductions from attendance', () => {
  test('counts unsorted unpaid dates before, on, and after the calculation day', () => {
    const preparedSalary = prepareSalaryCalculation(
      25_000_000,
      OCTOBER_CURRENT_TIME,
      OCTOBER_PAYDAY,
      OCTOBER_PERIOD_START,
      ['2026-10-25', '2026-10-10', '2026-10-01', '2026-10-10'],
    );
    for (const [day, earnedInPeriod, earnedToday] of [
      [1, 0, 0],
      [2, 500_000, 500_000],
      [10, 8_000_000, 0],
      [11, 8_500_000, 500_000],
      [25, 22_000_000, 0],
      [26, 22_000_000, 0],
    ]) {
      const result = calculateSalaryProgress(preparedSalary, new Date(2026, 9, day, 12));
      expect(result.earnedInPeriod).toBeCloseTo(earnedInPeriod);
      expect(result.earnedToday).toBeCloseTo(earnedToday);
    }
  });

  test('reuses prepared rates and attendance while earnings advance every second', () => {
    const preparedSalary = prepareSalaryCalculation(
      MONTHLY_SALARY,
      OCTOBER_CURRENT_TIME,
      OCTOBER_PAYDAY,
      OCTOBER_PERIOD_START,
      ['2026-10-10'],
    );
    const initial = calculateSalaryProgress(preparedSalary, OCTOBER_CURRENT_TIME);
    const nextSecond = calculateSalaryProgress(preparedSalary, new Date(2026, 9, 24, 12, 0, 1));

    expect(nextSecond.earnedInPeriod - initial.earnedInPeriod).toBeCloseTo(initial.perSecond);
    expect(nextSecond.unpaidDates).toBe(preparedSalary.unpaidDates);
    expect(nextSecond.perSecond).toBe(initial.perSecond);
    expect(nextSecond.netSalary).toBe(initial.netSalary);
  });

  test('reuses attendance correctly when an unpaid day becomes a past day at midnight', () => {
    const preparedSalary = prepareSalaryCalculation(
      MONTHLY_SALARY,
      OCTOBER_CURRENT_TIME,
      OCTOBER_PAYDAY,
      OCTOBER_PERIOD_START,
      ['2026-10-24'],
    );
    const unpaidDay = calculateSalaryProgress(preparedSalary, new Date(2026, 9, 24, 23, 59, 59));
    const nextDay = calculateSalaryProgress(preparedSalary, new Date(2026, 9, 25));
    const paidDay = calculateSalaryProgress(preparedSalary, new Date(2026, 9, 25, 12));

    expect(nextDay.earnedInPeriod).toBe(unpaidDay.earnedInPeriod);
    expect(nextDay.earnedToday).toBe(0);
    expect(paidDay.earnedInPeriod).toBe(9_400_000);
    expect(paidDay.earnedToday).toBe(200_000);
  });

  test('calculates a 60-day period with a custom start, including unpaid days across all months', () => {
    const salary = calculateSalary(
      60_000_000,
      new Date(2026, 9, 25, 12),
      new Date(2026, 10, 18),
      new Date(2026, 8, 20),
      false,
      ['2026-09-19', '2026-09-20', '2026-10-25', '2026-11-18', '2026-11-19'],
    );

    expect(salary.daysInPeriod).toBe(60);
    expect(salary.perDay).toBe(1_000_000);
    expect(salary.unpaidDaysCount).toBe(3);
    expect(salary.paidDaysCount).toBe(57);
    expect(salary.netSalary).toBe(57_000_000);
    expect(salary.salaryDeduction).toBe(3_000_000);
    expect(salary.earnedInPeriod).toBe(34_000_000);
    expect(salary.earnedToday).toBe(0);
  });

  test('does not accrue income before a future custom period starts', () => {
    const salary = calculateSalary(60_000_000, new Date(2026, 9, 25, 12), new Date(2027, 0, 8), new Date(2026, 10, 10));

    expect(salary.daysInPeriod).toBe(60);
    expect(salary.earnedInPeriod).toBe(0);
    expect(salary.earnedToday).toBe(0);
    expect(salary.periodProgress).toBe(0);
  });

  test('supports a 60-day period beginning on January 31 without shifting its start', () => {
    const salary = calculateSalary(60_000_000, new Date(2027, 1, 28, 12), new Date(2027, 2, 31), new Date(2027, 0, 31));

    expect(salary.daysInPeriod).toBe(60);
    expect(salary.periodStart).toEqual(new Date(2027, 0, 31));
    expect(salary.earnedInPeriod).toBe(28_500_000);
    expect(salary.perDay).toBe(1_000_000);
  });

  test('keeps the original rates and accrual when every day is paid', () => {
    const salary = calculateOctoberSalary();

    expect(salary.perDay).toBe(400_000);
    expect(salary.earnedToday).toBe(200_000);
    expect(salary.earnedInPeriod).toBe(9_400_000);
    expect(salary.netSalary).toBe(MONTHLY_SALARY);
    expect(salary.salaryDeduction).toBe(0);
    expect(salary.periodProgress).toBe(94);
  });

  test('deducts a past unpaid day from both net salary and accrued earnings', () => {
    const salary = calculateOctoberSalary(['2026-10-10']);

    expect(salary.earnedInPeriod).toBe(9_000_000);
    expect(salary.earnedToday).toBe(200_000);
    expect(salary.netSalary).toBe(9_600_000);
    expect(salary.salaryDeduction).toBe(400_000);
    expect(salary.unpaidDaysCount).toBe(1);
    expect(salary.perDay).toBe(400_000);
  });

  test('does not accrue any income today when today is unpaid', () => {
    const salary = calculateOctoberSalary(['2026-10-24']);

    expect(salary.earnedToday).toBe(0);
    expect(salary.earnedInPeriod).toBe(9_200_000);
    expect(salary.netSalary).toBe(9_600_000);
    expect(salary.periodProgress).toBe(94);
  });

  test('a future unpaid day reduces net salary without removing earned income', () => {
    const salary = calculateOctoberSalary(['2026-10-25']);

    expect(salary.netSalary).toBe(9_600_000);
    expect(salary.earnedInPeriod).toBe(9_400_000);
    expect(salary.earnedToday).toBe(200_000);
  });

  test('ignores dates outside the period and deduplicates unpaid days', () => {
    const salary = calculateOctoberSalary([
      '2026-09-30',
      '2026-10-26',
      '2026-11-01',
      'invalid',
      '2026-02-30',
      '2026-10-10',
      '2026-10-10',
    ]);

    expect(salary.unpaidDaysCount).toBe(1);
    expect(salary.netSalary).toBe(9_600_000);
  });

  test('two unpaid days reduce 10 million to 9.2 million without lowering the day rate', () => {
    const salary = calculateOctoberSalary(['2026-10-10', '2026-10-25']);

    expect(salary.netSalary).toBe(9_200_000);
    expect(salary.salaryDeduction).toBe(800_000);
    expect(salary.paidDaysCount).toBe(23);
    expect(salary.earnedInPeriod).toBe(9_000_000);
    expect(salary.perDay).toBe(400_000);
  });

  test('restoring a paid day restores its salary and earned income', () => {
    const unpaid = calculateOctoberSalary(['2026-10-10']);
    const restored = calculateOctoberSalary([]);

    expect(restored.netSalary - unpaid.netSalary).toBe(400_000);
    expect(restored.earnedInPeriod - unpaid.earnedInPeriod).toBe(400_000);
    expect(restored.perSecond).toBe(unpaid.perSecond);
  });

  test('manual salary receipt completes the period at its net amount', () => {
    const salary = calculateOctoberSalary(['2026-10-10', '2026-10-25'], new Date(2026, 9, 25, 12), true);

    expect(salary.earnedInPeriod).toBe(9_200_000);
    expect(salary.periodProgress).toBe(100);
    expect(salary.isPeriodComplete).toBe(true);
    expect(salary.earnedToday).toBe(0);
  });

  test('automatic completion also caps earnings at net salary', () => {
    const salary = calculateOctoberSalary(['2026-10-10', '2026-10-25'], new Date(2026, 9, 26));

    expect(salary.earnedInPeriod).toBe(9_200_000);
    expect(salary.periodProgress).toBe(100);
    expect(salary.hasReceivedSalary).toBe(false);
    expect(salary.earnedToday).toBe(0);
  });

  test('all days can be unpaid without negative earnings', () => {
    const unmarkedDates = Array.from({ length: 25 }, (_, index) => `2026-10-${String(index + 1).padStart(2, '0')}`);
    const salary = calculateOctoberSalary(unmarkedDates);

    expect(salary.netSalary).toBe(0);
    expect(salary.salaryDeduction).toBe(MONTHLY_SALARY);
    expect(salary.earnedInPeriod).toBe(0);
    expect(salary.earnedToday).toBe(0);
    expect(salary.periodProgress).toBe(94);
  });

  test('future unpaid days are counted correctly across months', () => {
    const unmarkedDates = ['2026-10-31', '2026-11-01', '2026-11-05'];
    const payday = new Date(2026, 10, 5);
    const october = calculateSalary(
      36_000_000,
      OCTOBER_CURRENT_TIME,
      payday,
      OCTOBER_PERIOD_START,
      false,
      unmarkedDates,
    );
    const november = calculateSalary(
      36_000_000,
      new Date(2026, 10, 1, 12),
      payday,
      OCTOBER_PERIOD_START,
      false,
      unmarkedDates,
    );

    expect(october.daysInPeriod).toBe(36);
    expect(october.perDay).toBe(1_000_000);
    expect(october.netSalary).toBe(33_000_000);
    expect(october.earnedInPeriod).toBe(23_500_000);
    expect(november.earnedInPeriod).toBe(30_000_000);
    expect(november.earnedToday).toBe(0);
  });

  test('counts leap days, weekends, and a period crossing the year boundary', () => {
    const leapYear = calculateSalary(
      31_000_000,
      new Date(2028, 2, 1, 12),
      new Date(2028, 2, 2),
      new Date(2028, 1, 1),
      false,
      ['2028-02-29', '2028-03-01'],
    );
    const newYear = calculateSalary(
      33_000_000,
      new Date(2027, 0, 1, 12),
      new Date(2027, 0, 2),
      new Date(2026, 11, 1),
      false,
      ['2026-12-31', '2027-01-01'],
    );

    expect(leapYear.daysInPeriod).toBe(31);
    expect(leapYear.netSalary).toBe(29_000_000);
    expect(leapYear.earnedInPeriod).toBe(28_000_000);
    expect(leapYear.earnedToday).toBe(0);
    expect(newYear.daysInPeriod).toBe(33);
    expect(newYear.netSalary).toBe(31_000_000);
    expect(newYear.earnedInPeriod).toBe(30_000_000);
  });
});
