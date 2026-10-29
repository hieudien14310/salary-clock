import { startOfDay } from 'date-fns';
import * as z from 'zod/mini';
import { formatSalaryInput, MAX_MONTHLY_SALARY, parseSalaryInput } from '@/lib/salary';

export const salaryFormSchema = z.pipe(
  z
    .object({
      monthlySalary: z.pipe(
        z.string(),
        z.transform((value, context) => {
          const amount = parseSalaryInput(value);
          if (amount !== null) return amount;

          context.issues.push({
            code: 'custom',
            input: value,
            message: `Nhập số tiền nguyên từ 1 đến ${formatSalaryInput(MAX_MONTHLY_SALARY)} đồng.`,
          });
          return z.NEVER;
        }),
      ),
      periodStartDate: z.date({ error: 'Vui lòng chọn ngày bắt đầu kỳ lương hợp lệ.' }),
      paydayDate: z.date({ error: 'Vui lòng chọn ngày nhận lương hợp lệ.' }),
    })
    .check(
      z.refine(({ periodStartDate, paydayDate }) => startOfDay(paydayDate) >= startOfDay(periodStartDate), {
        path: ['paydayDate'],
        message: 'Ngày nhận lương phải bằng hoặc sau ngày bắt đầu kỳ lương.',
      }),
    ),
  z.transform(({ monthlySalary, paydayDate, periodStartDate }) => ({
    monthlySalary,
    paydayDate: startOfDay(paydayDate),
    periodStart: startOfDay(periodStartDate),
  })),
);

export type SalaryFormInput = z.input<typeof salaryFormSchema>;
export type SalaryFormValues = z.output<typeof salaryFormSchema>;
