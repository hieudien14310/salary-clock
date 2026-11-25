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
import { CalendarCheck2, Check, ChevronLeft, ChevronRight, Minus, Sparkles } from 'lucide-react';
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
  const firstMonth = startOfMonth(periodStart);
  const month = addMonths(firstMonth, monthOffset);
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
      isPayday: hasSalary && isSameDay(date, payday),
    };
  });
  const monthTabs =
    lastMonthOffset > 0 && lastMonthOffset <= 3
      ? Array.from({ length: lastMonthOffset + 1 }, (_, offset) => ({
          offset,
          label: `Tháng ${format(addMonths(firstMonth, offset), 'MM/yyyy')}`,
        }))
      : null;

  return (
    <Card id="attendance" className="surface-card py-6">
      <CardContent className="space-y-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[12px] border-[1.5px] border-cozy-border-cocoa bg-cozy-blue text-cozy-burgundy shadow-[inset_0_1px_0_rgba(255,253,247,0.85),0_2.5px_0_0_rgba(125,99,91,0.3)]">
              <CalendarCheck2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-cozy-burgundy">Lịch chấm công</h2>
              <p id="attendance-hint" className="mt-0.5 text-[11px] font-medium text-cozy-taupe">
                {hasSalary ? 'Bấm một ngày để bật / tắt tính lương.' : 'Lưu kỳ lương để bắt đầu chấm công.'}
              </p>
            </div>
          </div>
          <p
            role="status"
            className="rounded-full border-[1.5px] border-cozy-border-table bg-cozy-mint px-3 py-1 text-[11px] font-bold text-cozy-forest shadow-[inset_0_1px_0_rgba(255,253,247,0.75),0_2px_0_0_#82AE94] tabular-nums"
          >
            {hasSalary ? `${paidDaysCount}/${daysInPeriod} ngày có lương` : 'Chưa thiết lập'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p className="font-heading text-base font-bold text-cozy-espresso">
            Tháng {format(month, 'MM')}{' '}
            <span className="ml-0.5 font-semibold text-cozy-taupe">{format(month, 'yyyy')}</span>
          </p>
          {monthTabs ? (
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Chọn tháng trong kỳ lương">
              {monthTabs.map(({ offset, label }) => (
                <button
                  key={offset}
                  type="button"
                  role="tab"
                  aria-selected={monthOffset === offset}
                  data-active={monthOffset === offset}
                  className="cozy-pill-tab px-3 py-1 text-xs"
                  onClick={() => setMonthOffset(offset)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            lastMonthOffset > 0 && (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full bg-cozy-surface hover:bg-cozy-cream"
                  aria-label="Tháng chấm công trước"
                  disabled={monthOffset === 0}
                  onClick={() => setMonthOffset(monthOffset - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full bg-cozy-surface hover:bg-cozy-cream"
                  aria-label="Tháng chấm công sau"
                  disabled={monthOffset === lastMonthOffset}
                  onClick={() => setMonthOffset(monthOffset + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-describedby="attendance-hint">
          {WEEKDAYS.map(({ label, shortLabel }) => (
            <span key={shortLabel} className="py-1 text-center text-xs font-bold text-cozy-taupe">
              <abbr title={label} className="no-underline">
                {shortLabel}
              </abbr>
            </span>
          ))}
          {days.map(({ date, dateKey, isMarked, isInPeriod, isPayday }) => {
            const isOutside = !hasSalary || !isInPeriod;
            const statusText = !hasSalary
              ? 'Chưa thiết lập kỳ lương'
              : !isInPeriod
                ? 'Ngoài kỳ tính lương'
                : isMarked
                  ? 'Có tính lương'
                  : 'Không tính lương';

            return (
              <Button
                key={dateKey}
                type="button"
                variant="ghost"
                className="attendance-day h-12 min-w-0 flex-col gap-0.5 px-0.5 sm:h-14"
                data-outside={isOutside}
                data-paid={!isOutside && isMarked}
                style={date.getDate() === 1 ? { gridColumnStart: getISODay(date) } : undefined}
                aria-label={`${format(date, 'dd/MM/yyyy')}${isPayday ? ' (Ngày nhận lương)' : ''}: ${statusText}`}
                aria-pressed={!isOutside && isMarked}
                aria-current={isSameDay(date, currentDay) ? 'date' : undefined}
                disabled={isOutside}
                onClick={() => toggleAttendance(dateKey)}
              >
                {isPayday && <Sparkles className="absolute top-1 right-1 size-2.5 text-cozy-gold" aria-hidden="true" />}
                <span className="text-xs font-bold tabular-nums">{format(date, 'dd')}</span>
                {!isOutside && isMarked ? (
                  <Check className="size-3 text-cozy-forest" aria-hidden="true" />
                ) : (
                  <Minus className="size-3" aria-hidden="true" />
                )}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t-[1.5px] border-dashed border-cozy-border-sand pt-4 text-[11px] font-semibold text-cozy-taupe">
          <span className="inline-flex items-center gap-1.5">
            <Check
              className="size-4 rounded-[5px] border border-cozy-border-table bg-cozy-mint p-0.5 text-cozy-forest"
              aria-hidden="true"
            />
            Có tính lương
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus
              className="size-4 rounded-[5px] border border-cozy-rust/40 bg-[var(--peach)] p-0.5 text-cozy-rust"
              aria-hidden="true"
            />
            Không tính lương
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] border-2 border-cozy-coral bg-cozy-canvas" aria-hidden="true" />
            Hôm nay
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-cozy-gold" aria-hidden="true" />
            Ngày nhận lương
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
