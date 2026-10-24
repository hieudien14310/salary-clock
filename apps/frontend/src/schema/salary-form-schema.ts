import { format, startOfDay, startOfMonth } from 'date-fns';
import { z } from 'zod';
import { formatSalaryInput, MAX_MONTHLY_SALARY, parseSalaryInput } from '@/lib/salary';

export function createSalaryFormSchema(currentTime: Date) {
  const periodStart = startOfMonth(currentTime);

  return z
    .object({
      monthlySalary: z.string().transform((value, context) => {
        const amount = parseSalaryInput(value);
        if (amount !== null) return amount;

        context.addIssue({
          code: 'custom',
          message: `Nhập số tiền nguyên từ 1 đến ${formatSalaryInput(MAX_MONTHLY_SALARY)} đồng.`,
        });
        return z.NEVER;
      }),
      paydayDate: z
        .date({ error: 'Vui lòng chọn ngày nhận lương hợp lệ.' })
        .refine((date) => startOfDay(date) >= periodStart, {
          message: `Ngày nhận lương phải từ ${format(periodStart, 'dd/MM/yyyy')} trở đi.`,
        }),
    })
    .transform(({ monthlySalary, paydayDate }) => ({
      monthlySalary,
      paydayDate: startOfDay(paydayDate),
      periodStart,
    }));
}

export type SalaryFormInput = z.input<ReturnType<typeof createSalaryFormSchema>>;
export type SalaryFormValues = z.output<ReturnType<typeof createSalaryFormSchema>>;
