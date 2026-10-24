import { format } from "date-fns";
import { useCurrentTime } from "@/hooks/use-current-time";
import { calculateSalary } from "@/lib/salary";
import { useSalaryStore } from "@/stores/salary-store";
import { SalaryForm } from "./components/salary-form";
import { SalaryOverview } from "./components/salary-overview";

const HomePage = () => {
  const currentTime = useCurrentTime();
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const calculation = calculateSalary(monthlySalary ?? 0, currentTime);

  return (
    <main className="flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Thu nhập & thời gian</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nhìn mức lương theo cách khác.</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Từ một tháng lương đến từng giây bạn đang sống.</p>
        </div>
        <div className="space-y-1 text-sm sm:text-right">
          <p className="font-medium">{format(currentTime, "'Tháng' M, yyyy")}</p>
          <p className="text-xs text-muted-foreground">{calculation.daysInMonth} ngày · 24 giờ mỗi ngày</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        <SalaryForm />
        <SalaryOverview monthlySalary={monthlySalary} calculation={calculation} />
      </div>
    </main>
  );
};

export default HomePage;
