import { format } from 'date-fns';
import { ArrowRight, CircleCheck, Sprout, Sun, TrendingUp, Wallet } from 'lucide-react';
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
  const isTodayPaid = !salary.unpaidDates.some((date) => date.getTime() === currentDay.getTime());
  const isEarning = isTicking && isTodayPaid;
  const displayAmount = (amount: number) => (hasSalary ? formatCurrency(amount) : '—');
  const progressLabel = calculation.periodProgress.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  const statusLabel = hasReceivedSalary
    ? 'Đã nhận lương'
    : calculation.isPeriodComplete
      ? 'Đã hoàn tất kỳ'
      : currentDay < salary.periodStart
        ? 'Chờ ngày bắt đầu'
        : !isTodayPaid
          ? 'Hôm nay không tính lương'
          : 'Đang tích lũy';

  return (
    <section aria-label="Thu nhập của bạn" className="surface-card overflow-hidden bg-card">
      <div className="earnings-card rounded-b-none px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium text-[#e0ecd9]">
            <TrendingUp className="size-4" aria-hidden="true" /> Thành quả của bạn
          </h2>
          {hasSalary && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-[#e5efc8]">
              <span className="live-dot" data-active={isEarning} aria-hidden="true" />
              {statusLabel}
            </span>
          )}
        </div>
        {hasSalary ? (
          <>
            <p className="mt-7 text-xs text-[#d1e2cd]">Bạn đã tích lũy được</p>
            <p className="earnings-amount mt-2" aria-live="off">
              {displayAmount(calculation.earnedInPeriod)}
            </p>
            <p className="mt-2 text-xs text-[#d1e2cd]">trên {displayAmount(salary.netSalary)} dự kiến thực nhận</p>
            <div className="mt-7 space-y-2.5">
              <div className="flex justify-between gap-3 text-xs text-[#e0ecd9]">
                <span>Hành trình đến ngày lương</span>
                <span className="font-medium tabular-nums">{progressLabel}%</span>
              </div>
              <Progress
                className="earnings-progress"
                value={calculation.periodProgress}
                aria-label="Tiến trình kỳ lương"
              />
              <div className="flex justify-between gap-3 text-[11px] text-[#d1e2cd]">
                <span>{format(calculation.periodStart, 'dd/MM/yyyy')}</span>
                <span>{format(calculation.payday, 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="relative pt-6 pb-1">
            <Sprout
              className="absolute top-7 right-0 size-16 rotate-12 text-[#d9e995]/20 sm:size-20"
              strokeWidth={1.2}
              aria-hidden="true"
            />
            <p className="relative max-w-sm text-3xl leading-snug font-semibold tracking-tight">
              Gieo một con số.
              <br />
              Gặt thêm động lực.
            </p>
            <p className="relative mt-3 max-w-xs text-sm leading-6 text-[#d1e2cd]">
              Nhập mức lương để xem mỗi giây của bạn đáng giá bao nhiêu.
            </p>
            <a
              href="#salary-settings"
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e5edbb] px-4 text-xs font-semibold text-[#26543d] transition-colors hover:bg-[#f1f5d9]"
            >
              Thiết lập kỳ lương <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
      <dl className="grid grid-cols-2 min-[480px]:grid-cols-3">
        <div className="col-span-2 flex items-center justify-between gap-3 border-b px-5 py-5 min-[480px]:col-span-1 min-[480px]:block min-[480px]:space-y-2 min-[480px]:border-r min-[480px]:border-b-0 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sun className="size-3.5 text-[var(--warm-foreground)]" aria-hidden="true" /> Hôm nay kiếm được
          </dt>
          <dd
            className="min-w-0 break-words text-right text-xl font-semibold tracking-tight text-primary tabular-nums min-[480px]:text-left"
            aria-live="off"
          >
            {displayAmount(calculation.earnedToday)}
          </dd>
        </div>
        <div className="min-w-0 space-y-2 border-r px-5 py-5 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3.5" aria-hidden="true" />
            {hasReceivedSalary ? 'Lương thực nhận' : 'Dự kiến thực nhận'}
          </dt>
          <dd className="break-words text-xl font-semibold tracking-tight tabular-nums">
            {displayAmount(calculation.netSalary)}
          </dd>
        </div>
        <div className="min-w-0 space-y-2 px-5 py-5 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleCheck className="size-3.5" aria-hidden="true" /> Khấu trừ · {calculation.unpaidDaysCount} ngày
          </dt>
          <dd className="break-words text-xl font-semibold tracking-tight tabular-nums">
            {displayAmount(calculation.salaryDeduction > 0 ? -calculation.salaryDeduction : 0)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
