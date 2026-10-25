import { useState } from 'react';
import {
  addMonths,
  differenceInCalendarMonths,
  format,
  getDaysInMonth,
  getISODay,
  setDate,
  startOfMonth,
} from 'date-fns';
import { Check, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
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

type MonthlyAttendanceProps = Pick<SalaryCalculation, 'periodStart' | 'payday' | 'daysInPeriod' | 'paidDaysCount'>;

export function MonthlyAttendance({ periodStart, payday, daysInPeriod, paidDaysCount }: MonthlyAttendanceProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const lastMonthOffset = differenceInCalendarMonths(payday, periodStart);
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
    <Card className="py-5">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Lịch biểu chấm công</h2>
          <p role="status" className="text-xs text-muted-foreground tabular-nums">
            {paidDaysCount}/{daysInPeriod} ngày tính lương
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">Tháng {format(month, 'MM/yyyy')}</p>
          {lastMonthOffset > 0 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Tháng chấm công trước"
                disabled={monthOffset === 0}
                onClick={() => setMonthOffset(monthOffset - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Tháng chấm công sau"
                disabled={monthOffset === lastMonthOffset}
                onClick={() => setMonthOffset(monthOffset + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map(({ label, shortLabel }) => (
            <span key={shortLabel} className="py-1 text-center text-xs font-medium text-muted-foreground">
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
          {days.map(({ date, dateKey, isMarked, isInPeriod }) => (
            <Button
              key={dateKey}
              type="button"
              variant={!isInPeriod ? 'ghost' : isMarked ? 'secondary' : 'outline'}
              className="h-14 min-w-0 flex-col gap-1 px-1"
              style={date.getDate() === 1 ? { gridColumnStart: getISODay(date) } : undefined}
              aria-label={`${format(date, 'dd/MM/yyyy')}: ${!isInPeriod ? 'Ngoài kỳ tính lương' : isMarked ? 'Có tính lương' : 'Không tính lương'}`}
              aria-pressed={isInPeriod && isMarked}
              disabled={!isInPeriod}
              onClick={() => toggleAttendance(dateKey)}
            >
              <span className="tabular-nums">{format(date, 'dd')}</span>
              {isInPeriod && isMarked ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5" aria-hidden="true" /> Có tính lương
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus className="size-3.5" aria-hidden="true" /> Không tính lương
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
