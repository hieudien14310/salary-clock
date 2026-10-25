import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCurrentTime } from '@/hooks/use-current-time';
import { calculateSalaryProgress, formatCurrency, type PreparedSalaryCalculation } from '@/lib/salary';

type SalaryLiveSummaryProps = {
  salary: PreparedSalaryCalculation;
  currentDay: Date;
  hasReceivedSalary: boolean;
};

export function SalaryLiveSummary({ salary, currentDay, hasReceivedSalary }: SalaryLiveSummaryProps) {
  const hasSalary = salary.monthlySalary > 0;
  const isTicking = hasSalary && !hasReceivedSalary && currentDay >= salary.periodStart && currentDay <= salary.payday;
  const clockTime = useCurrentTime(isTicking);
  const calculation = calculateSalaryProgress(salary, isTicking ? clockTime : currentDay, hasReceivedSalary);
  const monthlySalary = salary.monthlySalary;
  const displayAmount = (amount: number) => (hasSalary ? formatCurrency(amount) : '—');
  const progressLabel = calculation.periodProgress.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Tích lũy ước tính trong kỳ</h2>
        </div>
        <div className="space-y-3">
          <p
            className="break-words text-4xl leading-tight font-semibold tracking-tight tabular-nums sm:text-5xl lg:text-6xl"
            aria-live="off"
          >
            {displayAmount(calculation.earnedInPeriod)}
            {' / '}
            {displayAmount(monthlySalary)}
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between gap-3 text-xs text-muted-foreground">
            <span>Tiến trình kỳ lương</span>
            <span className="tabular-nums">{progressLabel}%</span>
          </div>
          <Progress value={calculation.periodProgress} aria-label="Tiến trình kỳ lương" />
          <div className="flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{format(calculation.periodStart, 'dd/MM/yyyy')}</span>
            <span>{format(calculation.payday, 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </CardContent>
      <dl className="grid grid-cols-1 border-t bg-muted/30 sm:grid-cols-3">
        <div className="space-y-2 p-5 sm:px-7">
          <dt className="text-xs text-muted-foreground">Tích lũy của hôm nay</dt>
          <dd className="break-words text-xl font-medium tabular-nums" aria-live="off">
            {displayAmount(calculation.earnedToday)}
          </dd>
        </div>
        <div className="space-y-2 border-t p-5 sm:border-t-0 sm:border-l sm:px-7">
          <dt className="text-xs text-muted-foreground">
            {calculation.hasReceivedSalary ? 'Lương thực nhận' : 'Lương dự kiến thực nhận'}
          </dt>
          <dd className="break-words text-xl font-medium tabular-nums">{displayAmount(calculation.netSalary)}</dd>
        </div>
        <div className="space-y-2 border-t p-5 sm:border-t-0 sm:border-l sm:px-7">
          <dt className="text-xs text-muted-foreground">
            Khấu trừ · {calculation.unpaidDaysCount} ngày không tính lương
          </dt>
          <dd className="break-words text-xl font-medium tabular-nums">
            {displayAmount(calculation.salaryDeduction > 0 ? -calculation.salaryDeduction : 0)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
