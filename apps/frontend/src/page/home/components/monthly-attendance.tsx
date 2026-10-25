import { format, getDaysInMonth, setDate } from 'date-fns';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SALARY_DATE_FORMAT } from '@/lib/salary';
import { useAttendanceStore } from '@/stores/attendance-store';

export function MonthlyAttendance({ month }: { month: Date }) {
  const unmarkedDates = useAttendanceStore((state) => state.unmarkedDates);
  const toggleAttendance = useAttendanceStore((state) => state.toggleAttendance);
  const unmarkedDateSet = new Set(unmarkedDates);
  const days = Array.from({ length: getDaysInMonth(month) }, (_, dayIndex) => {
    const date = setDate(month, dayIndex + 1);
    const dateKey = format(date, SALARY_DATE_FORMAT);
    return { date, dateKey, isMarked: !unmarkedDateSet.has(dateKey) };
  });
  const markedDaysCount = days.filter(({ isMarked }) => isMarked).length;

  return (
    <Card className="py-5">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Chấm công tháng {format(month, 'MM/yyyy')}</h2>
          <p role="status" className="text-xs text-muted-foreground tabular-nums">
            {markedDaysCount}/{days.length} ngày đã chấm
          </p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ date, dateKey, isMarked }) => (
            <Button
              key={dateKey}
              type="button"
              variant={isMarked ? 'secondary' : 'outline'}
              className="h-14 min-w-0 flex-col gap-1 px-1"
              aria-label={`${format(date, 'dd/MM/yyyy')}: ${isMarked ? 'Đã chấm công' : 'Không chấm công'}`}
              aria-pressed={isMarked}
              onClick={() => toggleAttendance(dateKey)}
            >
              <span className="tabular-nums">{format(date, 'dd')}</span>
              {isMarked ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5" aria-hidden="true" /> Đã chấm công
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus className="size-3.5" aria-hidden="true" /> Không chấm công
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Bấm vào ngày để đổi trạng thái chấm công.</p>
      </CardContent>
    </Card>
  );
}
