import { useState } from 'react';
import { format, isValid, startOfDay } from 'date-fns';
import { Controller, useForm, useWatch, type ResolverResult } from 'react-hook-form';
import { ArrowRight, CalendarDays, Check, RotateCcw, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatSalaryInput, getSalaryPeriod, parseSalaryDate } from '@/lib/salary';
import { salaryFormSchema, type SalaryFormInput, type SalaryFormValues } from '@/schema/salary-form-schema';
import { useSalaryStore } from '@/stores/salary-store';
import { useStorageStatusStore } from '@/stores/storage-status-store';

const SALARY_SUGGESTIONS = [10_000_000, 20_000_000, 30_000_000];
const PERIOD_DATE_FIELDS = [
  {
    name: 'periodStartDate',
    id: 'period-start-date',
    label: 'Ngày bắt đầu',
    placeholder: 'Chọn ngày bắt đầu',
  },
  { name: 'paydayDate', id: 'payday-date', label: 'Ngày nhận lương', placeholder: 'Chọn ngày nhận lương' },
] as const;

export function SalaryForm() {
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
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
  const [draftSalary, draftPeriodStart, draftPayday] = useWatch({
    control,
    name: ['monthlySalary', 'periodStartDate', 'paydayDate'],
  });
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
    setSaveMessage('Đã cập nhật! Cùng xem thành quả của bạn nhé.');
    requestAnimationFrame(() => {
      const overview = document.getElementById('salary-overview');
      overview?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
      overview?.focus({ preventScroll: true });
    });
  }

  function clearSalary() {
    setMonthlySalary(null);
    reset({ monthlySalary: '', periodStartDate: getValues('periodStartDate'), paydayDate: getValues('paydayDate') });
    setResetDialogOpen(false);
    setSaveMessage('Đã xóa mức lương. Bạn có thể nhập mức lương mới.');
  }

  return (
    <Card id="salary-settings" className="salary-settings surface-card h-fit gap-6 py-6">
      <CardHeader className="gap-3 px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="section-eyebrow mb-1 text-muted-foreground">Bắt đầu từ đây</p>
            <h2 className="text-lg font-semibold tracking-tight">Kỳ lương của bạn</h2>
          </div>
        </div>
        <CardDescription className="text-xs leading-relaxed">Thiết lập một lần, theo dõi mỗi ngày.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <form onSubmit={handleSubmit(saveSalary)} noValidate className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="monthly-salary" className="text-xs font-semibold">
              Tổng lương trong kỳ
            </Label>
            <InputGroup className="h-14 rounded-xl">
              <Controller
                name="monthlySalary"
                control={control}
                render={({ field }) => (
                  <InputGroupInput
                    {...field}
                    id="monthly-salary"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Nhập mức lương"
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
                    className="h-full px-4 text-xl font-semibold tracking-tight tabular-nums placeholder:text-sm placeholder:font-normal md:text-xl"
                  />
                )}
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                <InputGroupText>VND</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p id="salary-hint" className="text-xs leading-relaxed text-muted-foreground">
              Chọn nhanh hoặc nhập số tiền của bạn.
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
                  className="h-9 flex-1 rounded-lg text-xs aria-pressed:border-primary/40 aria-pressed:bg-secondary aria-pressed:text-primary"
                  aria-pressed={draftSalary === formatSalaryInput(amount)}
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
          <div className="space-y-4 border-t pt-5">
            {PERIOD_DATE_FIELDS.map(({ name, id, label, placeholder }) => (
              <div key={name} className="space-y-3">
                <Label htmlFor={id} className="text-xs font-semibold">
                  {label}
                </Label>
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
          </div>
          <div className="space-y-3">
            <p id="period-hint" className="text-xs leading-relaxed text-muted-foreground">
              Tính cả ngày bắt đầu, ngày nhận lương và cuối tuần.
            </p>
            {previewPeriod && (
              <div className="flex items-center gap-3 rounded-xl bg-[var(--warm)] p-3.5 text-[var(--warm-foreground)]">
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold">{previewPeriod.daysInPeriod} ngày cùng cố gắng</p>
                  <p className="text-[11px] tabular-nums">
                    {format(previewPeriod.periodStart, 'dd/MM/yyyy')} – {format(previewPeriod.payday, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-sm shadow-sm"
            disabled={monthlySalary !== null && !isDirty}
          >
            {monthlySalary === null ? 'Xem tiền lớn lên' : isDirty ? 'Cập nhật kỳ lương' : 'Đã lưu kỳ lương'}
            {monthlySalary !== null && !isDirty ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </Button>
          {monthlySalary !== null && (
            <AlertDialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" className="h-10 w-full text-xs text-muted-foreground" />}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" /> Xóa mức lương đã lưu
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa mức lương đã lưu?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bảng thu nhập sẽ trở về trạng thái chưa thiết lập. Ngày của kỳ lương và lịch chấm công vẫn được giữ
                    lại.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-10">Giữ lại</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" className="h-10" onClick={clearSalary}>
                    Xóa mức lương
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <p role="status" className="text-xs leading-relaxed text-primary">
            {!isDirty && saveMessage}
          </p>
        </form>
        <div className="space-y-3 border-t pt-5">
          {hasStorageError && (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              Không thể đọc hoặc lưu đầy đủ dữ liệu trên trình duyệt. Bạn vẫn có thể sử dụng trang, nhưng thay đổi có
              thể mất khi tải lại. Hãy kiểm tra quyền lưu trữ và dung lượng trống.
            </p>
          )}
          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Lương là chuyện riêng của bạn. Dữ liệu chỉ lưu trên trình duyệt này.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
