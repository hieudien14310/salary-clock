import { format } from 'date-fns';
import { useCurrentTime } from '@/hooks/use-current-time';
import { calculateSalary, parseSalaryDate } from '@/lib/salary';
import { useSalaryStore } from '@/stores/salary-store';
import { SalaryForm } from './components/salary-form';
import { SalaryOverview } from './components/salary-overview';

const HomePage = () => {
  const currentTime = useCurrentTime();
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDate = useSalaryStore((state) => state.paydayDate);
  const periodStartDate = useSalaryStore((state) => state.periodStartDate);
  const calculation = calculateSalary(
    monthlySalary ?? 0,
    currentTime,
    parseSalaryDate(paydayDate),
    parseSalaryDate(periodStartDate) ?? undefined,
  );

  return (
    <main className="flex-1 p-3">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Thu nhập & thời gian</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nhìn mức lương theo cách khác.</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Từ một tháng lương đến từng giây bạn đang sống.
          </p>
        </div>
        <div className="space-y-1 text-sm sm:text-right">
          <p className="font-medium">
            {format(calculation.periodStart, 'dd/MM/yyyy')} – {format(calculation.payday, 'dd/MM/yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">{calculation.daysInPeriod} ngày trong kỳ · 24 giờ mỗi ngày</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        <SalaryForm currentTime={currentTime} />
        <SalaryOverview monthlySalary={monthlySalary} calculation={calculation} />
      </div>
    </main>
  );
};

export default HomePage;
