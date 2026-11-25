import { useMemo, useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import {
  ArrowRight,
  BookOpenText,
  Calculator,
  CalendarDays,
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
  { key: 'perSecond', label: 'Mỗi giây', icon: Timer, tone: 'mint' },
  { key: 'perMinute', label: 'Mỗi phút', icon: Hourglass, tone: 'blue' },
  { key: 'perHour', label: 'Mỗi giờ', icon: Clock3, tone: 'cream' },
  { key: 'perDay', label: 'Mỗi ngày', icon: CalendarDays, tone: 'ivory' },
] as const;

type NoteTab = 'breakdown' | 'formula';

export function SalaryOverview() {
  const [selectedNoteTab, setSelectedNoteTab] = useState<NoteTab | null>(null);
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
  const activeNoteTab = selectedNoteTab ?? (hasSalary ? 'breakdown' : 'formula');
  const daysUntilPayday = differenceInCalendarDays(salary.payday, currentDay);
  const isPeriodComplete = hasReceivedSalary || daysUntilPayday < 0;
  const displayAmount = (amount: number, showDecimals = false) =>
    hasSalary ? formatCurrency(amount, showDecimals) : '—';
  const paydayLabel = format(salary.payday, 'dd/MM/yyyy');
  const breakdownRows = [
    {
      label: 'Tổng lương kỳ',
      value: hasSalary ? `+ ${formatCurrency(salary.monthlySalary)}` : '—',
      toneClass: 'text-cozy-forest',
    },
    {
      label: `Đơn giá mỗi ngày (${salary.daysInPeriod} ngày)`,
      value: displayAmount(salary.perDay, true),
      toneClass: 'text-cozy-espresso',
    },
    {
      label: 'Ngày có tính lương',
      value: hasSalary ? `${salary.paidDaysCount} / ${salary.daysInPeriod} ngày` : '—',
      toneClass: 'text-cozy-espresso',
    },
    {
      label: `Khấu trừ không tính lương (${salary.unpaidDaysCount} ngày)`,
      value: hasSalary
        ? salary.salaryDeduction > 0
          ? `- ${formatCurrency(salary.salaryDeduction)}`
          : formatCurrency(0)
        : '—',
      toneClass: hasSalary && salary.salaryDeduction > 0 ? 'text-cozy-rust' : 'text-cozy-taupe',
    },
  ];

  return (
    <div
      id="salary-overview"
      tabIndex={-1}
      aria-label="Tổng quan kỳ lương"
      className="min-w-0 space-y-5 rounded-[24px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <SalaryLiveSummary salary={salary} currentDay={currentDay} hasReceivedSalary={hasReceivedSalary} />

      <section aria-label="Thu nhập theo thời gian" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="text-base font-bold text-cozy-burgundy">Từng khoảnh khắc đều đáng giá</h2>
          <span className="text-[11px] font-semibold text-cozy-taupe">Quy đổi từ tổng lương trong kỳ</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {RATE_UNITS.map(({ key, label, icon: Icon, tone }) => (
            <Card key={key} data-tone={tone} className="rate-card min-w-0 gap-0 py-4">
              <CardContent className="px-4">
                <dl className="space-y-2.5">
                  <dt className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-cozy-espresso uppercase">
                    <span className="rate-icon shrink-0" data-tone={tone}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {label}
                  </dt>
                  <dd>
                    <p className="font-heading break-words text-base font-bold tracking-tight text-cozy-forest tabular-nums">
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
          className={`surface-card border-2 border-cozy-gold/75 bg-cozy-cream py-5 ${hasReceivedSalary ? 'payday-celebration' : ''}`}
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-cozy-border-cocoa bg-cozy-canvas text-cozy-burgundy">
                {hasReceivedSalary ? (
                  <PartyPopper className="size-5 text-cozy-coral" aria-hidden="true" />
                ) : (
                  <Gift className="size-5 text-cozy-gold" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-cozy-burgundy">
                  {hasReceivedSalary
                    ? 'Lương về rồi, tự thưởng thôi!'
                    : daysUntilPayday < 0
                      ? 'Một kỳ cố gắng đã hoàn thành'
                      : daysUntilPayday === 0
                        ? 'Hôm nay là ngày lương!'
                        : 'Ngày vui đang đến gần'}
                </h2>
                <p className="text-xs font-semibold text-cozy-taupe tabular-nums">Ngày nhận lương · {paydayLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="status">
              <Badge
                variant="outline"
                className="h-auto rounded-full border-[1.5px] border-cozy-border-cocoa bg-cozy-canvas px-3 py-1.5 text-xs font-bold text-cozy-espresso"
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
                <Button type="button" className="h-10 rounded-full px-4 font-bold" onClick={markSalaryReceived}>
                  <PartyPopper aria-hidden="true" />
                  Đã nhận lương
                </Button>
              )}
              {isPeriodComplete && (
                <a
                  href="#salary-settings"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border-[1.5px] border-cozy-border-cocoa bg-cozy-canvas px-3.5 py-1.5 text-xs font-bold text-cozy-burgundy transition-colors hover:bg-cozy-blue"
                >
                  Thiết lập kỳ mới <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="surface-card py-5">
        <CardContent className="space-y-4 px-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-[10px] border-[1.5px] border-cozy-border-cocoa bg-cozy-cream text-cozy-burgundy">
                <BookOpenText className="size-4" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-cozy-burgundy">Sổ ghi chép kỳ lương</h2>
            </div>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Xem sổ ghi chép kỳ lương">
              <button
                type="button"
                role="tab"
                aria-selected={activeNoteTab === 'breakdown'}
                data-active={activeNoteTab === 'breakdown'}
                className="cozy-pill-tab px-3.5 py-1 text-xs"
                onClick={() => setSelectedNoteTab('breakdown')}
              >
                Bảng kê số liệu
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeNoteTab === 'formula'}
                data-active={activeNoteTab === 'formula'}
                className="cozy-pill-tab inline-flex items-center gap-1.5 px-3.5 py-1 text-xs"
                onClick={() => setSelectedNoteTab('formula')}
              >
                <Calculator className="size-3.5" aria-hidden="true" />
                Cách tính
              </button>
            </div>
          </div>

          {activeNoteTab === 'breakdown' ? (
            <dl className="cozy-data-box space-y-2.5 px-4 py-3.5 text-xs leading-[1.6]">
              {breakdownRows.map(({ label, value, toneClass }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-cozy-espresso">{label}</dt>
                  <dd className={`font-bold tabular-nums ${toneClass}`}>{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-t-[1.5px] border-dashed border-cozy-border-table/50 pt-2.5">
                <dt className="font-bold text-cozy-burgundy">Dự kiến thực nhận</dt>
                <dd className="font-heading text-sm font-bold text-cozy-forest tabular-nums">
                  {hasSalary ? `+ ${formatCurrency(salary.netSalary)}` : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="cozy-data-box space-y-2.5 px-4 py-3.5 text-xs leading-[1.6] font-medium text-cozy-taupe">
              <p>
                Đơn giá cơ bản: <strong className="font-bold text-cozy-espresso">lương ban đầu</strong> ÷{' '}
                {salary.daysInPeriod} ngày ÷ 24 giờ ÷ 60 phút ÷ 60 giây. Kỳ tính từ{' '}
                <span className="font-semibold text-cozy-espresso tabular-nums">
                  {format(salary.periodStart, 'dd/MM/yyyy')}
                </span>{' '}
                đến hết{' '}
                <span className="font-semibold text-cozy-espresso tabular-nums">
                  {format(salary.payday, 'dd/MM/yyyy')}
                </span>
                , gồm cả cuối tuần và ngày nghỉ. Mỗi ngày chọn “Không tính lương” bị trừ một đơn giá ngày; ngày ngoài kỳ
                không ảnh hưởng đến lương.
              </p>
              <p>
                Tiền tích lũy chỉ ghi nhận các ngày có tính lương đã trôi qua. Khi kỳ kết thúc hoặc xác nhận đã nhận
                lương, tích lũy bằng lương thực nhận sau khấu trừ và thu nhập trong ngày bằng 0. Chọn ngày bắt đầu và
                ngày nhận lương mới để tính kỳ tiếp theo. Số tiền tích lũy là ước tính.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
