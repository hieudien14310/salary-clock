import { useState } from 'react';
import { addMonths, differenceInCalendarMonths, format, getDaysInMonth, setDate } from 'date-fns';
import { Check, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SALARY_DATE_FORMAT } from '@/lib/salary';
import { useAttendanceStore } from '@/stores/attendance-store';

export function MonthlyAttendance({ periodStart, payday }: { periodStart: Date; payday: Date }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const lastMonthOffset = differenceInCalendarMonths(payday, periodStart);
  const month = addMonths(periodStart, monthOffset);
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
  const daysInPeriod = days.filter(({ isInPeriod }) => isInPeriod);
  const paidDaysCount = daysInPeriod.filter(({ isMarked }) => isMarked).length;

  return (
    <Card className="py-5">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Chấm công tháng {format(month, 'MM/yyyy')}</h2>
            {lastMonthOffset > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Tháng chấm công trước"
                  disabled={monthOffset === 0}
                  onClick={() => setMonthOffset(monthOffset - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
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
          <p role="status" className="text-xs text-muted-foreground tabular-nums">
            {paidDaysCount}/{daysInPeriod.length} ngày tính lương
          </p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ date, dateKey, isMarked, isInPeriod }) => (
            <Button
              key={dateKey}
              type="button"
              variant={!isInPeriod ? 'ghost' : isMarked ? 'secondary' : 'outline'}
              className="h-14 min-w-0 flex-col gap-1 px-1"
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Bấm vào ngày để đổi trạng thái. Các ngày ngoài kỳ {format(periodStart, 'dd/MM/yyyy')} –{' '}
          {format(payday, 'dd/MM/yyyy')} được làm mờ.
        </p>
      </CardContent>
    </Card>
  );
}
