import { useState } from 'react';
import {
  addMonths,
  differenceInCalendarMonths,
  format,
  getDaysInMonth,
  getISODay,
  isSameDay,
  setDate,
  startOfMonth,
} from 'date-fns';
import { CalendarCheck2, Check, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SALARY_DATE_FORMAT, type SalaryCalculation } from '@/lib/salary';
import { useAttendanceStore } from '@/stores/attendance-store';

const WEEKDAYS = [
  { label: 'Thứ Hai', shortLabel: 'T2' },
  { label: 'Thứ Ba', shortLabel: 'T3' },
  { label: 'Thứ Tư', shortLabel: 'T4' },
  { label: 'Thứ Năm', shortLabel: 'T5' },
  { label: 'Thứ Sáu', shortLabel: 'T6' },
  { label: 'Thứ Bảy', shortLabel: 'T7' },
  { label: 'Chủ Nhật', shortLabel: 'CN' },
];

type MonthlyAttendanceProps = Pick<SalaryCalculation, 'periodStart' | 'payday' | 'daysInPeriod' | 'paidDaysCount'> & {
  currentDay: Date;
  hasSalary: boolean;
};

export function MonthlyAttendance({
  periodStart,
  payday,
  daysInPeriod,
  paidDaysCount,
  currentDay,
  hasSalary,
}: MonthlyAttendanceProps) {
  const lastMonthOffset = differenceInCalendarMonths(payday, periodStart);
  const [monthOffset, setMonthOffset] = useState(() =>
    Math.max(0, Math.min(differenceInCalendarMonths(currentDay, periodStart), lastMonthOffset)),
  );
  const month = addMonths(startOfMonth(periodStart), monthOffset);
  const unmarkedDates = useAttendanceStore((state) => state.unmarkedDates);
  const toggleAttendance = useAttendanceStore((state) => state.toggleAttendance);
  const unmarkedDateSet = new Set(unmarkedDates);
  const days = Array.from({ length: getDaysInMonth(month) }, (_, dayIndex) => {
    const date = setDate(month, dayIndex + 1);
    const dateKey = format(date, SALARY_DATE_FORMAT);
    return {
      date,
      dateKey,
      isMarked: !unmarkedDateSet.has(dateKey),
      isInPeriod: date >= periodStart && date <= payday,
    };
  });

  return (
    <Card id="attendance" className="surface-card py-6">
      <CardContent className="space-y-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
              <CalendarCheck2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Lịch chấm công</h2>
              <p id="attendance-hint" className="mt-1 text-[11px] text-muted-foreground">
                {hasSalary ? 'Bấm một ngày để bật / tắt tính lương.' : 'Lưu kỳ lương để bắt đầu chấm công.'}
              </p>
            </div>
          </div>
          <p
            role="status"
            className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground tabular-nums"
          >
            {hasSalary ? `${paidDaysCount}/${daysInPeriod} ngày có lương` : 'Chưa thiết lập'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            Tháng {format(month, 'MM')}{' '}
            <span className="ml-1 font-normal text-muted-foreground">{format(month, 'yyyy')}</span>
          </p>
          {lastMonthOffset > 0 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-10 rounded-xl"
                aria-label="Tháng chấm công trước"
                disabled={monthOffset === 0}
                onClick={() => setMonthOffset(monthOffset - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-10 rounded-xl"
                aria-label="Tháng chấm công sau"
                disabled={monthOffset === lastMonthOffset}
                onClick={() => setMonthOffset(monthOffset + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-describedby="attendance-hint">
          {WEEKDAYS.map(({ label, shortLabel }) => (
            <span key={shortLabel} className="py-1 text-center text-xs font-medium text-muted-foreground">
              <abbr title={label} className="no-underline">
                {shortLabel}
              </abbr>
            </span>
          ))}
          {days.map(({ date, dateKey, isMarked, isInPeriod }) => (
            <Button
              key={dateKey}
              type="button"
              variant={!hasSalary || !isInPeriod ? 'ghost' : isMarked ? 'secondary' : 'outline'}
              className="attendance-day h-12 min-w-0 flex-col gap-0.5 px-0.5 sm:h-14"
              data-paid={hasSalary && isInPeriod && isMarked}
              style={date.getDate() === 1 ? { gridColumnStart: getISODay(date) } : undefined}
              aria-label={`${format(date, 'dd/MM/yyyy')}: ${!hasSalary ? 'Chưa thiết lập kỳ lương' : !isInPeriod ? 'Ngoài kỳ tính lương' : isMarked ? 'Có tính lương' : 'Không tính lương'}`}
              aria-pressed={hasSalary && isInPeriod && isMarked}
              aria-current={isSameDay(date, currentDay) ? 'date' : undefined}
              disabled={!hasSalary || !isInPeriod}
              onClick={() => toggleAttendance(dateKey)}
            >
              <span className="text-xs font-medium tabular-nums">{format(date, 'dd')}</span>
              {hasSalary && isInPeriod && isMarked ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <Minus className="size-3" aria-hidden="true" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-[10px] text-muted-foreground sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 rounded bg-secondary text-primary" aria-hidden="true" /> Có tính lương
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus className="size-3.5 rounded bg-[var(--peach)] text-[var(--peach-foreground)]" aria-hidden="true" />{' '}
            Không tính lương
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded border border-primary" aria-hidden="true" /> Hôm nay
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
