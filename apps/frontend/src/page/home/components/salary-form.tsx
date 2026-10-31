import { useState } from 'react';
import { format, isValid, startOfDay } from 'date-fns';
import { Controller, useForm, useWatch, type ResolverResult } from 'react-hook-form';
import { ArrowRight, CalendarDays, Check, HardDrive, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { formatSalaryInput, getSalaryPeriod, parseSalaryDate } from '@/lib/salary';
import { salaryFormSchema, type SalaryFormInput, type SalaryFormValues } from '@/schema/salary-form-schema';
import { useSalaryStore } from '@/stores/salary-store';
import { useStorageStatusStore } from '@/stores/storage-status-store';

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

export function SalaryForm() {
  const hasStorageError = useStorageStatusStore((state) => state.hasStorageError);
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDate = useSalaryStore((state) => state.paydayDate);
  const periodStartDate = useSalaryStore((state) => state.periodStartDate);
  const setMonthlySalary = useSalaryStore((state) => state.setMonthlySalary);
  const setSalarySettings = useSalaryStore((state) => state.setSalarySettings);
  const [defaultValues] = useState<SalaryFormInput>(() => {
    const savedPeriod = getSalaryPeriod(
      new Date(),
      parseSalaryDate(paydayDate),
      parseSalaryDate(periodStartDate) ?? undefined,
    );
    return {
      monthlySalary: monthlySalary === null ? '' : formatSalaryInput(monthlySalary),
      periodStartDate: savedPeriod.periodStart,
      paydayDate: savedPeriod.payday,
    };
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isDirty, isSubmitted },
  } = useForm<SalaryFormInput, unknown, SalaryFormValues>({
    defaultValues,
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
      ? getSalaryPeriod(draftPeriodStart, draftPayday, draftPeriodStart)
      : null;

  function saveSalary(values: SalaryFormValues) {
    setSalarySettings(values.monthlySalary, values.paydayDate, values.periodStart);
    reset({
      monthlySalary: formatSalaryInput(values.monthlySalary),
      periodStartDate: values.periodStart,
      paydayDate: values.paydayDate,
    });
  }

  function clearSalary() {
    setMonthlySalary(null);
    reset({ monthlySalary: '', periodStartDate: getValues('periodStartDate'), paydayDate: getValues('paydayDate') });
  }

  return (
    <Card className="h-fit gap-6 py-6">
      <CardHeader className="gap-2 px-6">
        <h2 className="text-lg font-semibold">Mức lương của bạn</h2>
        <CardDescription className="leading-relaxed">
          Nhập lương của bạn và sau đó chọn thời gian nhận lương trong tháng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <form onSubmit={handleSubmit(saveSalary)} noValidate className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="monthly-salary">Lương của bạn</Label>
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
                      const inputElement = event.currentTarget;
                      const formattedSalary = formatSalaryInput(inputElement.value);
                      const digitsAfterCaret = inputElement.value
                        .slice(inputElement.selectionStart ?? inputElement.value.length)
                        .replace(/\D/g, '').length;
                      const digitPositions = Array.from(formattedSalary.matchAll(/\d/g), (match) => match.index);
                      const digitsBeforeCaret = Math.max(0, digitPositions.length - digitsAfterCaret);
                      let caretPosition = digitPositions[digitsBeforeCaret] ?? formattedSalary.length;

                      if ((event.nativeEvent as InputEvent).inputType === 'deleteContentBackward') {
                        caretPosition = digitsBeforeCaret > 0 ? digitPositions[digitsBeforeCaret - 1] + 1 : 0;
                      }

                      field.onChange(formattedSalary);
                      requestAnimationFrame(() => inputElement.setSelectionRange(caretPosition, caretPosition));
                    }}
                    onBlur={field.onBlur}
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
          <Button type="button" variant="destructive" className="h-10 w-full" onClick={clearSalary}>
            <RefreshCwIcon />
            Xóa mức lương đã lưu
          </Button>
        </form>
        <div className="space-y-3 border-t pt-5">
          {hasStorageError && (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              Không thể đọc hoặc lưu đầy đủ dữ liệu trên trình duyệt. Bạn vẫn có thể sử dụng trang, nhưng thay đổi có
              thể mất khi tải lại. Hãy kiểm tra quyền lưu trữ và dung lượng trống.
            </p>
          )}
          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <HardDrive className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Dữ liệu chỉ được lưu trong trình duyệt của bạn, không gửi lên máy chủ.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
