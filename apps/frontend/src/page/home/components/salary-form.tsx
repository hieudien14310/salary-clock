import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { ArrowRight, CalendarDays, Check, HardDrive, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatSalaryInput, getSalaryPeriod, MAX_MONTHLY_SALARY, MAX_PAYDAY_DAY, parseSalaryInput } from '@/lib/salary';
import { useSalaryStore } from '@/stores/salary-store';

const SALARY_SUGGESTIONS = [10_000_000, 20_000_000, 30_000_000];
const LAST_DAY_OPTION = 'last_day';
const PAYDAY_OPTIONS = [
  { value: LAST_DAY_OPTION, label: 'Ngày cuối tháng' },
  ...Array.from({ length: MAX_PAYDAY_DAY }, (_, index) => ({ value: String(index + 1), label: `Ngày ${index + 1}` })),
];

export function SalaryForm({ currentTime }: { currentTime: Date }) {
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDay = useSalaryStore((state) => state.paydayDay);
  const setMonthlySalary = useSalaryStore((state) => state.setMonthlySalary);
  const setSalarySettings = useSalaryStore((state) => state.setSalarySettings);
  const [salaryInput, setSalaryInput] = useState(() =>
    monthlySalary === null ? '' : formatSalaryInput(monthlySalary),
  );
  const [draftPaydayDay, setDraftPaydayDay] = useState(paydayDay);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const parsedSalary = parseSalaryInput(salaryInput);
  const hasUnsavedChanges =
    parsedSalary !== monthlySalary || draftPaydayDay !== paydayDay || (salaryInput !== '' && parsedSalary === null);
  const previewPeriod = getSalaryPeriod(currentTime, draftPaydayDay);

  function updateSalaryInput(value: string) {
    setSalaryInput(value);
    setError('');
    setStatusMessage('');
  }

  function saveSalary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (parsedSalary === null) {
      setError(`Nhập số tiền nguyên từ 1 đến ${formatSalaryInput(MAX_MONTHLY_SALARY)} đồng.`);
      return;
    }

    setSalarySettings(parsedSalary, draftPaydayDay);
    setSalaryInput(formatSalaryInput(parsedSalary));
    setError('');
    setStatusMessage('Đã lưu mức lương và ngày nhận lương.');
  }

  function clearSalary() {
    setMonthlySalary(null);
    setSalaryInput('');
    setError('');
    setStatusMessage('Đã xóa mức lương đã lưu.');
  }

  return (
    <Card className="h-fit gap-6 py-6">
      <CardHeader className="gap-2 px-6">
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted/50">
          <Wallet className="size-5" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Mức lương của bạn</h2>
        <CardDescription className="leading-relaxed">Bắt đầu với số tiền bạn nhận mỗi tháng.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <form onSubmit={saveSalary} noValidate className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="monthly-salary">Lương hàng tháng</Label>
            <InputGroup className="h-12">
              <InputGroupInput
                id="monthly-salary"
                name="monthlySalary"
                inputMode="numeric"
                autoComplete="off"
                placeholder="10.000.000"
                value={salaryInput}
                onChange={(event) => updateSalaryInput(event.target.value)}
                onBlur={() => {
                  if (parsedSalary !== null) setSalaryInput(formatSalaryInput(parsedSalary));
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'salary-error' : 'salary-hint'}
                className="h-full text-lg font-medium tabular-nums md:text-lg"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                <InputGroupText>VND</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p id="salary-hint" className="text-xs leading-relaxed text-muted-foreground">
              Nhập số tiền bằng đồng, ví dụ 10.000.000.
            </p>
            {error && (
              <p id="salary-error" role="alert" className="text-xs leading-relaxed text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2" aria-label="Mức lương gợi ý">
              {SALARY_SUGGESTIONS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateSalaryInput(formatSalaryInput(amount))}
                >
                  {amount / 1_000_000} triệu
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="payday-day">Ngày nhận lương hàng tháng</Label>
            <Select
              items={PAYDAY_OPTIONS}
              value={draftPaydayDay === null ? LAST_DAY_OPTION : String(draftPaydayDay)}
              onValueChange={(value) => {
                if (value === null) return;
                setDraftPaydayDay(value === LAST_DAY_OPTION ? null : Number(value));
                setStatusMessage('');
              }}
            >
              <SelectTrigger id="payday-day" aria-describedby="payday-hint" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {PAYDAY_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="payday-hint" className="text-xs leading-relaxed text-muted-foreground">
              Nếu tháng không có ngày đã chọn, dùng ngày cuối tháng đó.
            </p>
            <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Kỳ tính lương tháng này</p>
                <p className="text-sm font-medium tabular-nums">
                  {format(previewPeriod.periodStart, 'dd/MM')} – {format(previewPeriod.payday, 'dd/MM/yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {previewPeriod.daysInPeriod} ngày, tính cả ngày nhận lương.
                </p>
              </div>
            </div>
          </div>
          <Button type="submit" className="h-10 w-full" disabled={monthlySalary !== null && !hasUnsavedChanges}>
            {monthlySalary === null ? 'Bắt đầu quy đổi' : hasUnsavedChanges ? 'Lưu thay đổi' : 'Đã lưu thông tin'}
            {monthlySalary !== null && !hasUnsavedChanges ? (
              <Check aria-hidden="true" />
            ) : (
              <ArrowRight aria-hidden="true" />
            )}
          </Button>
          <div role="status" className="text-xs leading-relaxed text-muted-foreground">
            {statusMessage ||
              (hasUnsavedChanges
                ? 'Lưu thay đổi để cập nhật kết quả bên cạnh.'
                : 'Bạn có thể thay đổi mức lương và ngày nhận lương bất cứ lúc nào.')}
          </div>
        </form>
        <div className="space-y-3 border-t pt-5">
          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <HardDrive className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Mức lương và ngày nhận lương được lưu trong trình duyệt này cho lần truy cập tiếp theo.
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
