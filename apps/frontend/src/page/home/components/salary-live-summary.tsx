import { format } from 'date-fns';
import { ArrowRight, CircleCheck, CircleMinus, Sprout, Sun, TrendingUp, Wallet } from 'lucide-react';
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
  const statusBadge = hasReceivedSalary
    ? { label: 'Đã nhận lương', className: 'bg-cozy-cream text-cozy-burgundy' }
    : calculation.isPeriodComplete
      ? { label: 'Đã hoàn tất kỳ', className: 'bg-cozy-cream text-cozy-burgundy' }
      : currentDay < salary.periodStart
        ? { label: 'Chờ ngày bắt đầu', className: 'bg-cozy-blue text-cozy-espresso' }
        : !isTodayPaid
          ? { label: 'Hôm nay không tính lương', className: 'bg-[#FBE8EA] text-cozy-rust' }
          : { label: 'Đang tích lũy', className: 'bg-cozy-mint text-cozy-forest' };
  const hasDeduction = hasSalary && calculation.salaryDeduction > 0;

  return (
    <section aria-label="Thu nhập của bạn" className="surface-card overflow-hidden">
      <div className="earnings-hero px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-cozy-burgundy">
            <span className="flex size-8 items-center justify-center rounded-[10px] border-[1.5px] border-cozy-border-table bg-cozy-mint text-cozy-forest">
              <TrendingUp className="size-4" aria-hidden="true" />
            </span>
            Thành quả của bạn
          </h2>
          {hasSalary && (
            <span
              className={`inline-flex items-center gap-2 rounded-full border-[1.5px] border-cozy-border-cocoa px-3 py-1 text-[11px] font-bold ${statusBadge.className}`}
            >
              <span className="live-dot" data-active={isEarning} aria-hidden="true" />
              {statusBadge.label}
            </span>
          )}
        </div>
        {hasSalary ? (
          <>
            <p className="mt-6 text-xs font-bold tracking-wider text-cozy-taupe uppercase">Bạn đã tích lũy được</p>
            <p className="earnings-amount mt-1.5 text-cozy-forest" aria-live="off">
              {displayAmount(calculation.earnedInPeriod)}
            </p>
            <p className="mt-2 text-xs font-medium text-cozy-taupe">
              trên{' '}
              <strong className="font-bold text-cozy-espresso tabular-nums">{displayAmount(salary.netSalary)}</strong>{' '}
              dự kiến thực nhận
            </p>
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-cozy-espresso">Hành trình đến ngày lương</span>
                <span className="rounded-full border border-cozy-border-sand bg-cozy-cream px-2.5 py-0.5 font-bold text-cozy-burgundy tabular-nums">
                  {progressLabel}%
                </span>
              </div>
              <Progress
                className="earnings-progress"
                value={calculation.periodProgress}
                aria-label="Tiến trình kỳ lương"
              />
              <div className="flex justify-between gap-3 text-[11px] font-semibold text-cozy-taupe tabular-nums">
                <span>{format(calculation.periodStart, 'dd/MM/yyyy')}</span>
                <span>{format(calculation.payday, 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="relative pt-5 pb-1">
            <Sprout
              className="absolute top-6 right-1 size-16 rotate-12 text-cozy-sage/75 sm:size-20"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <p className="font-heading relative max-w-sm text-3xl leading-snug font-extrabold tracking-tight text-cozy-burgundy">
              Gieo một con số.
              <br />
              <span className="text-cozy-forest">Gặt thêm động lực.</span>
            </p>
            <p className="relative mt-2.5 max-w-xs text-sm leading-6 font-medium text-cozy-taupe">
              Nhập mức lương để xem mỗi giây của bạn đáng giá bao nhiêu.
            </p>
            <a
              href="#salary-settings"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border-[1.5px] border-cozy-border-cocoa bg-cozy-sage px-4.5 text-xs font-bold text-cozy-espresso transition-colors hover:bg-[#84BC98]"
            >
              Thiết lập kỳ lương <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
      <dl className="grid grid-cols-2 bg-cozy-canvas min-[480px]:grid-cols-3">
        <div className="col-span-2 flex items-center justify-between gap-3 border-b-[1.5px] border-cozy-border-sand px-5 py-4.5 min-[480px]:col-span-1 min-[480px]:block min-[480px]:space-y-1.5 min-[480px]:border-r-[1.5px] min-[480px]:border-b-0 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs font-bold text-cozy-taupe">
            <Sun className="size-3.5 text-cozy-gold" aria-hidden="true" /> Hôm nay kiếm được
          </dt>
          <dd
            className="font-heading min-w-0 break-words text-right text-xl font-bold tracking-tight text-cozy-forest tabular-nums min-[480px]:text-left"
            aria-live="off"
          >
            {displayAmount(calculation.earnedToday)}
          </dd>
        </div>
        <div className="min-w-0 space-y-1.5 border-r-[1.5px] border-cozy-border-sand px-5 py-4.5 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs font-bold text-cozy-taupe">
            <Wallet className="size-3.5 text-cozy-burgundy" aria-hidden="true" />
            {hasReceivedSalary ? 'Lương thực nhận' : 'Dự kiến thực nhận'}
          </dt>
          <dd className="font-heading break-words text-xl font-bold tracking-tight text-cozy-espresso tabular-nums">
            {displayAmount(calculation.netSalary)}
          </dd>
        </div>
        <div className="min-w-0 space-y-1.5 px-5 py-4.5 sm:px-6">
          <dt className="flex items-center gap-1.5 text-xs font-bold text-cozy-taupe">
            {hasDeduction ? (
              <CircleMinus className="size-3.5 text-cozy-rust" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-3.5 text-cozy-forest" aria-hidden="true" />
            )}
            Khấu trừ · {calculation.unpaidDaysCount} ngày
          </dt>
          <dd
            className={`font-heading break-words text-xl font-bold tracking-tight tabular-nums ${hasDeduction ? 'text-cozy-rust' : 'text-cozy-taupe'}`}
          >
            {displayAmount(calculation.salaryDeduction > 0 ? -calculation.salaryDeduction : 0)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
