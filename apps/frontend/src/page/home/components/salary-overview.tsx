import { useMemo } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  ChevronDown,
  Clock3,
  Gift,
  Hourglass,
  PartyPopper,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, parseSalaryDate, prepareSalaryCalculation } from '@/lib/salary';
import { useCurrentDay } from '@/hooks/use-current-time';
import { useAttendanceStore } from '@/stores/attendance-store';
import { useSalaryStore } from '@/stores/salary-store';
import { MonthlyAttendance } from './monthly-attendance';
import { SalaryLiveSummary } from './salary-live-summary';

const RATE_UNITS = [
  { key: 'perSecond', label: 'Mỗi giây', icon: Timer, tone: 'green' },
  { key: 'perMinute', label: 'Mỗi phút', icon: Hourglass, tone: 'peach' },
  { key: 'perHour', label: 'Mỗi giờ', icon: Clock3, tone: 'lavender' },
  { key: 'perDay', label: 'Mỗi ngày', icon: CalendarDays, tone: 'gold' },
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
    <div
      id="salary-overview"
      tabIndex={-1}
      aria-label="Tổng quan kỳ lương"
      className="min-w-0 space-y-5 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <SalaryLiveSummary salary={salary} currentDay={currentDay} hasReceivedSalary={hasReceivedSalary} />

      <section aria-label="Thu nhập theo thời gian" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold">Từng khoảnh khắc đều đáng giá</h2>
          <span className="text-[10px] text-muted-foreground">Quy đổi từ tổng lương trong kỳ</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {RATE_UNITS.map(({ key, label, icon: Icon, tone }) => (
            <Card key={key} className="rate-card surface-card min-w-0 gap-0 rounded-2xl py-4">
              <CardContent className="px-4">
                <dl className="space-y-3">
                  <dt className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rate-icon shrink-0" data-tone={tone}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {label}
                  </dt>
                  <dd className="space-y-1">
                    <p className="break-words text-base font-semibold tracking-tight tabular-nums">
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
        key={`${salary.periodStart.getTime()}-${salary.payday.getTime()}-${format(currentDay, 'yyyy-MM')}`}
        currentDay={currentDay}
        periodStart={salary.periodStart}
        payday={salary.payday}
        daysInPeriod={salary.daysInPeriod}
        paidDaysCount={salary.paidDaysCount}
        hasSalary={hasSalary}
      />

      {hasSalary && (
        <Card
          key={String(hasReceivedSalary)}
          className={`surface-card border-[var(--warm)] bg-[var(--warm)] py-5 ${hasReceivedSalary ? 'payday-celebration' : ''}`}
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card/70 text-[var(--warm-foreground)]">
                {hasReceivedSalary ? (
                  <PartyPopper className="size-5" aria-hidden="true" />
                ) : (
                  <Gift className="size-5" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold">
                  {hasReceivedSalary
                    ? 'Lương về rồi, tự thưởng thôi!'
                    : daysUntilPayday < 0
                      ? 'Một kỳ cố gắng đã hoàn thành'
                      : daysUntilPayday === 0
                        ? 'Hôm nay là ngày lương!'
                        : 'Ngày vui đang đến gần'}
                </h2>
                <p className="text-xs text-muted-foreground tabular-nums">Ngày nhận lương · {paydayLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="status">
              <Badge
                variant="secondary"
                className="h-auto rounded-full bg-card/80 px-3 py-1.5 text-[var(--warm-foreground)]"
              >
                {hasReceivedSalary
                  ? 'Đã nhận lương'
                  : daysUntilPayday < 0
                    ? 'Đã qua ngày nhận lương'
                    : daysUntilPayday === 0
                      ? 'Hôm nay là ngày nhận lương'
                      : `Còn ${daysUntilPayday} ngày`}
              </Badge>
              {daysUntilPayday === 0 && !isPeriodComplete && (
                <Button type="button" className="h-10 rounded-full px-4" onClick={markSalaryReceived}>
                  <PartyPopper aria-hidden="true" />
                  Đã nhận lương
                </Button>
              )}
              {isPeriodComplete && (
                <a
                  href="#salary-settings"
                  className="inline-flex min-h-10 items-center gap-1 text-xs font-medium text-primary"
                >
                  Thiết lập kỳ mới <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <details className="calculation-details rounded-2xl border bg-card/50 px-5">
        <summary className="flex min-h-14 items-center gap-2 text-xs text-muted-foreground">
          <Calculator className="size-4" aria-hidden="true" /> Salary tính thu nhập thế nào?
          <ChevronDown className="disclosure-chevron ml-auto size-4" aria-hidden="true" />
        </summary>
        <div className="space-y-3 border-t pt-4 pb-5 text-xs leading-6 text-muted-foreground">
          <p>
            Đơn giá cơ bản: lương ban đầu ÷ {salary.daysInPeriod} ngày ÷ 24 giờ ÷ 60 phút ÷ 60 giây. Kỳ tính từ{' '}
            {format(salary.periodStart, 'dd/MM/yyyy')} đến hết {format(salary.payday, 'dd/MM/yyyy')}, gồm cả cuối tuần
            và ngày nghỉ. Mỗi ngày chọn “Không tính lương” bị trừ một đơn giá ngày; ngày ngoài kỳ không ảnh hưởng đến
            lương.{' '}
          </p>
          <p>
            Tiền tích lũy chỉ ghi nhận các ngày có tính lương đã trôi qua. Khi kỳ kết thúc hoặc xác nhận đã nhận lương,
            tích lũy bằng lương thực nhận sau khấu trừ và thu nhập trong ngày bằng 0. Chọn ngày bắt đầu và ngày nhận
            lương mới để tính kỳ tiếp theo. Số tiền tích lũy là ước tính.
          </p>
        </div>
      </details>
    </div>
  );
}
