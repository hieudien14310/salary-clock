import { useMemo } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { CalculatorIcon, CalendarCheck, CalendarDays, Clock3, Hourglass, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, parseSalaryDate, prepareSalaryCalculation } from '@/lib/salary';
import { useCurrentDay } from '@/hooks/use-current-time';
import { useAttendanceStore } from '@/stores/attendance-store';
import { useSalaryStore } from '@/stores/salary-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MonthlyAttendance } from './monthly-attendance';
import { SalaryLiveSummary } from './salary-live-summary';

const RATE_UNITS = [
  { key: 'perSecond', label: 'Mỗi giây', icon: Timer },
  { key: 'perMinute', label: 'Mỗi phút', icon: Hourglass },
  { key: 'perHour', label: 'Mỗi giờ', icon: Clock3 },
  { key: 'perDay', label: 'Mỗi ngày', icon: CalendarDays },
] as const;

export function SalaryOverview() {
  const currentDay = useCurrentDay();
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDate = useSalaryStore((state) => state.paydayDate);
  const periodStartDate = useSalaryStore((state) => state.periodStartDate);
  const hasReceivedSalary = useSalaryStore((state) => state.hasReceivedSalary);
  const markSalaryReceived = useSalaryStore((state) => state.markSalaryReceived);
  const unmarkedDates = useAttendanceStore((state) => state.unmarkedDates);
  const salary = useMemo(
    () =>
      prepareSalaryCalculation(
        monthlySalary ?? 0,
        currentDay,
        parseSalaryDate(paydayDate),
        parseSalaryDate(periodStartDate) ?? undefined,
        unmarkedDates,
      ),
    [monthlySalary, currentDay, paydayDate, periodStartDate, unmarkedDates],
  );
  const hasSalary = monthlySalary !== null;
  const daysUntilPayday = differenceInCalendarDays(salary.payday, currentDay);
  const isPeriodComplete = hasReceivedSalary || daysUntilPayday < 0;
  const displayAmount = (amount: number, showDecimals = false) =>
    hasSalary ? formatCurrency(amount, showDecimals) : '—';
  const paydayLabel = format(salary.payday, 'dd/MM/yyyy');

  return (
    <div className="min-w-0 space-y-3">
      <SalaryLiveSummary salary={salary} currentDay={currentDay} hasReceivedSalary={hasReceivedSalary} />

      <section aria-label="Thu nhập theo thời gian" className="space-y-3">
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
          {RATE_UNITS.map(({ key, label, icon: Icon }) => (
            <Card key={key} className="min-w-0 gap-0 py-4">
              <CardContent>
                <dl className="space-y-4">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="space-y-1">
                    <p className="break-words text-lg font-semibold tracking-tight tabular-nums">
                      {displayAmount(salary[key], true)}
                    </p>
                  </dd>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <MonthlyAttendance
        key={`${salary.periodStart.getTime()}-${salary.payday.getTime()}`}
        periodStart={salary.periodStart}
        payday={salary.payday}
        daysInPeriod={salary.daysInPeriod}
        paidDaysCount={salary.paidDaysCount}
      />

      <Card className="py-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs text-muted-foreground">Ngày nhận lương đã chọn</h2>
              <p className="font-medium tabular-nums">{paydayLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="status">
            <Badge variant="secondary" className="h-auto px-3 py-1.5">
              {hasReceivedSalary
                ? 'Đã nhận lương'
                : daysUntilPayday < 0
                  ? 'Đã qua ngày nhận lương'
                  : daysUntilPayday === 0
                    ? 'Hôm nay là ngày nhận lương'
                    : `Còn ${daysUntilPayday} ngày`}
            </Badge>
            {hasSalary && daysUntilPayday === 0 && !isPeriodComplete && (
              <Button type="button" onClick={markSalaryReceived}>
                Đã nhận lương
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Alert>
        <CalculatorIcon />
        <AlertTitle>Cách tính</AlertTitle>
        <AlertDescription>
          Đơn giá cơ bản: lương ban đầu ÷ {salary.daysInPeriod} ngày ÷ 24 giờ ÷ 60 phút ÷ 60 giây. Kỳ tính từ{' '}
          {format(salary.periodStart, 'dd/MM/yyyy')} đến hết {format(salary.payday, 'dd/MM/yyyy')}, gồm cả cuối tuần và
          ngày nghỉ. Mỗi ngày chọn “Không tính lương” bị trừ một đơn giá ngày; ngày ngoài kỳ không ảnh hưởng đến lương.{' '}
          <br /> Tiền tích lũy chỉ ghi nhận các ngày có tính lương đã trôi qua. Khi kỳ kết thúc hoặc xác nhận đã nhận
          lương, tích lũy bằng lương thực nhận sau khấu trừ và thu nhập trong ngày bằng 0. Chọn ngày bắt đầu và ngày
          nhận lương mới để tính kỳ tiếp theo. Số tiền tích lũy là ước tính.
        </AlertDescription>
      </Alert>
    </div>
  );
}
