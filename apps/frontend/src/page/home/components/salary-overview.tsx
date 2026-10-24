import { format } from 'date-fns';
import { CalendarCheck, CalendarDays, Clock3, Hourglass, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, type SalaryCalculation } from '@/lib/salary';

const RATE_UNITS = [
  { key: 'perSecond', label: 'Mỗi giây', detail: '1 giây', icon: Timer },
  { key: 'perMinute', label: 'Mỗi phút', detail: '60 giây', icon: Hourglass },
  { key: 'perHour', label: 'Mỗi giờ', detail: '60 phút', icon: Clock3 },
  { key: 'perDay', label: 'Mỗi ngày', detail: '24 giờ', icon: CalendarDays },
] as const;

type SalaryOverviewProps = {
  monthlySalary: number | null;
  calculation: SalaryCalculation;
};

export function SalaryOverview({ monthlySalary, calculation }: SalaryOverviewProps) {
  const hasSalary = monthlySalary !== null;
  const displayAmount = (amount: number, showDecimals = false) =>
    hasSalary ? formatCurrency(amount, showDecimals) : '—';
  const paydayLabel = format(calculation.payday, 'dd/MM/yyyy');
  const progressLabel = calculation.periodProgress.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

  return (
    <div className="min-w-0 space-y-6">
      <Card className="gap-0 py-0">
        <CardContent className="space-y-7 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Tích lũy ước tính trong kỳ</h2>
            <Badge variant="outline" className="gap-1.5 py-3">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {!hasSalary ? 'Chờ mức lương' : calculation.isPeriodComplete ? 'Đã kết thúc kỳ' : 'Cập nhật mỗi giây'}
            </Badge>
          </div>
          <div className="space-y-3">
            <p
              className="break-words text-4xl leading-tight font-semibold tracking-tight tabular-nums sm:text-5xl lg:text-6xl"
              aria-live="off"
            >
              {displayAmount(calculation.earnedInPeriod)}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {hasSalary
                ? calculation.isPeriodComplete
                  ? 'Đã tích lũy đủ lương của kỳ này. Chọn ngày nhận lương mới để tính kỳ tiếp theo.'
                  : 'Tính từ ngày 01 đến hết ngày nhận lương bạn đã chọn.'
                : 'Nhập và lưu mức lương để thấy thời gian của bạn thành tiền.'}
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
        <dl className="grid grid-cols-1 border-t bg-muted/30 sm:grid-cols-2">
          <div className="space-y-2 p-5 sm:px-7">
            <dt className="text-xs text-muted-foreground">Tích lũy từ 00:00 hôm nay</dt>
            <dd className="break-words text-xl font-medium tabular-nums" aria-live="off">
              {displayAmount(calculation.earnedToday)}
            </dd>
          </div>
          <div className="space-y-2 border-t p-5 sm:border-t-0 sm:border-l sm:px-7">
            <dt className="text-xs text-muted-foreground">Tổng lương của kỳ này</dt>
            <dd className="break-words text-xl font-medium tabular-nums">{displayAmount(monthlySalary ?? 0)}</dd>
          </div>
        </dl>
      </Card>

      <section aria-labelledby="salary-rates-heading" className="space-y-3">
        {/* <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="salary-rates-heading" className="text-sm font-medium">
            Thời gian của bạn đáng giá bao nhiêu?
          </h2>
          <span className="text-xs text-muted-foreground">VND / đơn vị thời gian</span>
        </div> */}
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
          {RATE_UNITS.map(({ key, label, detail, icon: Icon }) => (
            <Card key={key} className="min-w-0 gap-0 py-4">
              <CardContent>
                <dl className="space-y-4">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="space-y-1">
                    <p className="break-words text-lg font-semibold tracking-tight tabular-nums">
                      {displayAmount(calculation[key], true)}
                    </p>
                    <p className="text-xs text-muted-foreground">/ {detail}</p>
                  </dd>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="py-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs text-muted-foreground">Ngày nhận lương đã chọn</h2>
              <p className="font-medium tabular-nums">{paydayLabel}</p>
            </div>
          </div>
          <Badge variant="secondary" className="h-auto px-3 py-1.5">
            {calculation.daysUntilPayday < 0
              ? 'Đã qua ngày nhận lương'
              : calculation.daysUntilPayday === 0
                ? 'Hôm nay là ngày nhận lương'
                : `Còn ${calculation.daysUntilPayday} ngày`}
          </Badge>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Cách tính: lương ÷ {calculation.daysInPeriod} ngày ÷ 24 giờ ÷ 60 phút ÷ 60 giây. Kỳ tính từ{' '}
        {format(calculation.periodStart, 'dd/MM/yyyy')} đến hết {format(calculation.payday, 'dd/MM/yyyy')}, gồm cả cuối
        tuần và ngày nghỉ. Sau kỳ này, tích lũy giữ ở mức đủ lương, thu nhập phát sinh trong ngày bằng 0. Chọn ngày nhận
        lương mới để bắt đầu kỳ tiếp theo từ ngày 01 của tháng hiện tại. Số tiền tích lũy là ước tính.
      </p>
    </div>
  );
}
