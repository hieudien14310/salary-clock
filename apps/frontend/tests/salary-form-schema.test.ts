import { describe, expect, test } from 'bun:test';
import { salaryFormSchema } from '../src/schema/salary-form-schema';

const VALID_VALUES = {
  monthlySalary: '60.000.000',
  periodStartDate: new Date(2026, 8, 20, 15),
  paydayDate: new Date(2026, 10, 18, 9),
};

describe('custom salary period validation', () => {
  test.each(['', '0', '-1', '1.5', '1e6', '1.000.000.000.000', '<script>alert(1)</script>'])(
    'rejects invalid salary %p and keeps the Vietnamese field error',
    (monthlySalary) => {
      const result = salaryFormSchema.safeParse({ ...VALID_VALUES, monthlySalary });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['monthlySalary']);
        expect(result.error.issues[0].message).toContain('Nhập số tiền nguyên');
      }
    },
  );

  test('accepts a 60-day period starting in the middle of a month and normalizes dates', () => {
    const values = salaryFormSchema.parse(VALID_VALUES);

    expect(values.monthlySalary).toBe(60_000_000);
    expect(values.periodStart).toEqual(new Date(2026, 8, 20));
    expect(values.paydayDate).toEqual(new Date(2026, 10, 18));
  });

  test('rejects a payday before the selected start and identifies the payday field', () => {
    const result = salaryFormSchema.safeParse({ ...VALID_VALUES, paydayDate: new Date(2026, 8, 19) });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(({ path }) => path[0] === 'paydayDate')).toBe(true);
  });

  test('allows a one-day period regardless of the input times', () => {
    const result = salaryFormSchema.safeParse({ ...VALID_VALUES, paydayDate: new Date(2026, 8, 20, 8) });
    expect(result.success).toBe(true);
  });

  test('allows past and future periods without a current-month restriction', () => {
    for (const year of [2020, 2030]) {
      expect(
        salaryFormSchema.safeParse({
          ...VALID_VALUES,
          periodStartDate: new Date(year, 11, 15),
          paydayDate: new Date(year + 1, 1, 12),
        }).success,
      ).toBe(true);
    }
  });

  test('requires both dates and rejects invalid Date values', () => {
    for (const field of ['periodStartDate', 'paydayDate']) {
      for (const invalidDate of [undefined, new Date(NaN), '2026-10-25']) {
        expect(salaryFormSchema.safeParse({ ...VALID_VALUES, [field]: invalidDate }).success).toBe(false);
      }
    }
  });
});
