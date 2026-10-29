import { format, parseISO } from 'date-fns';
import { CalendarDays, Check, ChevronDown, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { formatCurrency, prepareSalaryCalculation } from '@/lib/salary';
import { useSalaryStore } from '@/stores/salary-store';

export function SalaryHistory() {
  const salaryHistory = useSalaryStore((state) => state.salaryHistory);
  const sortedHistory = salaryHistory.toSorted(
    (firstEntry, secondEntry) =>
      secondEntry.paydayDate.localeCompare(firstEntry.paydayDate) ||
      secondEntry.periodStartDate.localeCompare(firstEntry.periodStartDate),
  );

  return (
    <section aria-labelledby="salary-history-heading" className="mt-6">
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <h2 id="salary-history-heading" className="text-lg font-semibold tracking-tight">
              Lịch sử kỳ lương
            </h2>
            <CardDescription className="text-xs leading-relaxed sm:text-sm">
              Xem lại thu nhập và ngày tính lương của từng kỳ.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="mt-0.5 h-6 px-2.5 tabular-nums">
            {salaryHistory.length} kỳ
          </Badge>
        </CardHeader>
        <CardContent className="border-t px-0">
          {sortedHistory.length === 0 ? (
            <Empty className="px-6 py-10 sm:py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-12 rounded-xl [&_svg]:size-5">
                  <History aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Chưa có kỳ lương đã nhận</EmptyTitle>
                <EmptyDescription className="text-xs">
                  Các kỳ lương sẽ xuất hiện ở đây sau khi bạn xác nhận “Đã nhận lương”.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ol className="divide-y">
              {sortedHistory.map((entry) => {
                const periodStart = parseISO(entry.periodStartDate);
                const payday = parseISO(entry.paydayDate);
                const salary = prepareSalaryCalculation(
                  entry.monthlySalary,
                  periodStart,
                  payday,
                  periodStart,
                  entry.unmarkedDates,
                );

                return (
                  <li key={`${entry.periodStartDate}/${entry.paydayDate}`}>
                    <details className="group">
                      <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-center gap-x-3 gap-y-3 p-5 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_1rem] sm:gap-x-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          <CalendarDays className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="text-sm font-medium tabular-nums">
                            {format(
                              periodStart,
                              periodStart.getFullYear() === payday.getFullYear() ? 'dd/MM' : 'dd/MM/yyyy',
                            )}
                            {' – '}
                            {format(payday, 'dd/MM/yyyy')}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <Check className="size-3" aria-hidden="true" /> Đã nhận
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                              · {salary.paidDaysCount}/{salary.daysInPeriod} ngày tính lương
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 col-start-2 row-start-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:block sm:space-y-1 sm:pr-2 sm:text-right">
                          <p className="text-xs text-muted-foreground">Thực nhận</p>
                          <p className="break-words text-lg font-semibold tracking-tight tabular-nums">
                            {formatCurrency(salary.netSalary)}
                          </p>
                        </div>
                        <ChevronDown
                          className="col-start-3 row-start-1 size-4 text-muted-foreground transition-transform group-open:rotate-180 sm:col-start-4"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="border-t bg-muted/25 px-5 py-4 sm:px-6 sm:py-5">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                          <div className="min-w-0 space-y-1.5">
                            <dt className="text-xs text-muted-foreground">Tổng lương</dt>
                            <dd className="break-words text-sm font-medium tabular-nums">
                              {formatCurrency(entry.monthlySalary)}
                            </dd>
                          </div>
                          <div className="min-w-0 space-y-1.5">
                            <dt className="text-xs text-muted-foreground">Khấu trừ · {salary.unpaidDaysCount} ngày</dt>
                            <dd className="break-words text-sm font-medium tabular-nums">
                              {formatCurrency(salary.salaryDeduction > 0 ? -salary.salaryDeduction : 0)}
                            </dd>
                          </div>
                          <div className="col-span-2 space-y-1.5 sm:col-span-1">
                            <dt className="text-xs text-muted-foreground">Ngày xác nhận</dt>
                            <dd className="text-sm font-medium tabular-nums">
                              {format(parseISO(entry.confirmedDate), 'dd/MM/yyyy')}
                            </dd>
                          </div>
                        </dl>
                        {salary.unpaidDaysCount > 0 && (
                          <div className="mt-4 space-y-2.5 border-t pt-4">
                            <p className="text-xs text-muted-foreground">Ngày không tính lương</p>
                            <ul className="flex flex-wrap gap-2">
                              {salary.unpaidDates
                                .toSorted((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime())
                                .map((date) => (
                                  <li key={date.getTime()}>
                                    <Badge variant="outline" className="h-6 rounded-md bg-background px-2 tabular-nums">
                                      {format(date, 'dd/MM/yyyy')}
                                    </Badge>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
