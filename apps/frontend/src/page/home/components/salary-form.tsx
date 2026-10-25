import { useState } from 'react';
import { format, isValid, startOfDay } from 'date-fns';
import { Controller, useForm, useWatch, type ResolverResult } from 'react-hook-form';
import { ArrowRight, CalendarDays, Check, HardDrive, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { formatSalaryInput, getSalaryPeriod, parseSalaryDate, parseSalaryInput } from '@/lib/salary';
import { salaryFormSchema, type SalaryFormInput, type SalaryFormValues } from '@/schema/salary-form-schema';
import { useSalaryStore } from '@/stores/salary-store';

const SALARY_SUGGESTIONS = [10_000_000, 20_000_000, 30_000_000];
const PERIOD_DATE_FIELDS = [
  {
    name: 'periodStartDate',
    id: 'period-start-date',
    label: 'Ngày bắt đầu kỳ lương',
    placeholder: 'Chọn ngày bắt đầu',
  },
  { name: 'paydayDate', id: 'payday-date', label: 'Ngày nhận lương', placeholder: 'Chọn ngày nhận lương' },
] as const;

export function SalaryForm({ currentTime }: { currentTime: Date }) {
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDate = useSalaryStore((state) => state.paydayDate);
  const periodStartDate = useSalaryStore((state) => state.periodStartDate);
  const setMonthlySalary = useSalaryStore((state) => state.setMonthlySalary);
  const setSalarySettings = useSalaryStore((state) => state.setSalarySettings);
  const savedPeriod = getSalaryPeriod(
    currentTime,
    parseSalaryDate(paydayDate),
    parseSalaryDate(periodStartDate) ?? undefined,
  );
  const [statusMessage, setStatusMessage] = useState('');
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isDirty, isSubmitted },
  } = useForm<SalaryFormInput, unknown, SalaryFormValues>({
    defaultValues: {
      monthlySalary: monthlySalary === null ? '' : formatSalaryInput(monthlySalary),
      periodStartDate: savedPeriod.periodStart,
      paydayDate: savedPeriod.payday,
    },
    resolver: (values): ResolverResult<SalaryFormInput, SalaryFormValues> => {
      const result = salaryFormSchema.safeParse(values);
      if (result.success) return { values: result.data, errors: {} };

      const fieldError = (name: keyof SalaryFormInput) => {
        const issue = result.error.issues.find((issue) => issue.path[0] === name);
        return issue ? { type: issue.code, message: issue.message } : undefined;
      };
      return {
        values: {},
        errors: {
          monthlySalary: fieldError('monthlySalary'),
          periodStartDate: fieldError('periodStartDate'),
          paydayDate: fieldError('paydayDate'),
        },
      };
    },
  });
  const [draftPeriodStart, draftPayday] = useWatch({ control, name: ['periodStartDate', 'paydayDate'] });
  const previewPeriod =
    isValid(draftPeriodStart) && isValid(draftPayday) && startOfDay(draftPayday) >= startOfDay(draftPeriodStart)
      ? getSalaryPeriod(currentTime, draftPayday, draftPeriodStart)
      : null;

  function saveSalary(values: SalaryFormValues) {
    setSalarySettings(values.monthlySalary, values.paydayDate, values.periodStart);
    reset({
      monthlySalary: formatSalaryInput(values.monthlySalary),
      periodStartDate: values.periodStart,
      paydayDate: values.paydayDate,
    });
    setStatusMessage('Đã lưu mức lương và kỳ tính.');
  }

  function clearSalary() {
    setMonthlySalary(null);
    reset({ monthlySalary: '', periodStartDate: getValues('periodStartDate'), paydayDate: getValues('paydayDate') });
    setStatusMessage('Đã xóa mức lương đã lưu.');
  }

  return (
    <Card className="h-fit gap-6 py-6">
      <CardHeader className="gap-2 px-6">
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted/50">
          <Wallet className="size-5" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Mức lương của bạn</h2>
        <CardDescription className="leading-relaxed">Nhập tổng lương và chọn khoảng thời gian của kỳ.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <form onSubmit={handleSubmit(saveSalary)} noValidate className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="monthly-salary">Tổng lương của kỳ</Label>
            <InputGroup className="h-12">
              <Controller
                name="monthlySalary"
                control={control}
                render={({ field }) => (
                  <InputGroupInput
                    {...field}
                    id="monthly-salary"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="10.000.000"
                    onChange={(event) => {
                      field.onChange(event);
                      setStatusMessage('');
                    }}
                    onBlur={() => {
                      const amount = parseSalaryInput(field.value);
                      if (amount !== null) field.onChange(formatSalaryInput(amount));
                      field.onBlur();
                    }}
                    aria-invalid={Boolean(errors.monthlySalary)}
                    aria-describedby={errors.monthlySalary ? 'salary-error' : 'salary-hint'}
                    className="h-full text-lg font-medium tabular-nums md:text-lg"
                  />
                )}
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                <InputGroupText>VND</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p id="salary-hint" className="text-xs leading-relaxed text-muted-foreground">
              Nhập tổng số tiền của toàn bộ kỳ bằng đồng, ví dụ 10.000.000.
            </p>
            {errors.monthlySalary && (
              <p id="salary-error" role="alert" className="text-xs leading-relaxed text-destructive">
                {errors.monthlySalary.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2" aria-label="Mức lương gợi ý">
              {SALARY_SUGGESTIONS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValue('monthlySalary', formatSalaryInput(amount), {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    });
                    setStatusMessage('');
                  }}
                >
                  {amount / 1_000_000} triệu
                </Button>
              ))}
            </div>
          </div>
          {PERIOD_DATE_FIELDS.map(({ name, id, label, placeholder }) => (
            <div key={name} className="space-y-3">
              <Label htmlFor={id}>{label}</Label>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id={id}
                    ref={field.ref}
                    value={field.value}
                    placeholder={placeholder}
                    onBlur={field.onBlur}
                    onChange={(date) => {
                      field.onChange(date);
                      setStatusMessage('');
                      if (isSubmitted) void trigger(['periodStartDate', 'paydayDate']);
                    }}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${id}-error` : 'period-hint'}
                  />
                )}
              />
              {errors[name] && (
                <p id={`${id}-error`} role="alert" className="text-xs leading-relaxed text-destructive">
                  {errors[name].message}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-3">
            <p id="period-hint" className="text-xs leading-relaxed text-muted-foreground">
              Ngày nhận lương phải bằng hoặc sau ngày bắt đầu. Kỳ tính bao gồm cả hai ngày, kể cả cuối tuần.
            </p>
            {previewPeriod && (
              <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Kỳ lương đã chọn</p>
                  <p className="text-sm font-medium tabular-nums">
                    {format(previewPeriod.periodStart, 'dd/MM/yyyy')} – {format(previewPeriod.payday, 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {previewPeriod.daysInPeriod} ngày, tính cả ngày bắt đầu và ngày nhận lương.
                  </p>
                </div>
              </div>
            )}
          </div>
          <Button type="submit" className="h-10 w-full" disabled={monthlySalary !== null && !isDirty}>
            {monthlySalary === null ? 'Bắt đầu quy đổi' : isDirty ? 'Lưu thay đổi' : 'Đã lưu thông tin'}
            {monthlySalary !== null && !isDirty ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </Button>
          <div role="status" className="text-xs leading-relaxed text-muted-foreground">
            {statusMessage ||
              (isDirty
                ? 'Lưu thay đổi để cập nhật kết quả bên cạnh.'
                : 'Bạn có thể thay đổi mức lương và hai ngày của kỳ bất cứ lúc nào.')}
          </div>
        </form>
        <div className="space-y-3 border-t pt-5">
          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <HardDrive className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Mức lương và kỳ tính được lưu trong trình duyệt này cho lần truy cập tiếp theo.
          </p>
          {monthlySalary !== null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2.5 text-muted-foreground"
              onClick={clearSalary}
            >
              Xóa mức lương đã lưu
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
