import { Clock3, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCurrentTime } from "@/hooks/use-current-time";
import { calculateSalary } from "@/lib/salary";
import { useSalaryStore } from "@/stores/salary-store";
import { SalaryForm } from "./components/salary-form";
import { SalaryOverview } from "./components/salary-overview";

const HomePage = () => {
  const { theme, setTheme } = useTheme();
  const currentTime = useCurrentTime();
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const calculation = calculateSalary(monthlySalary ?? 0, currentTime);
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" aria-label="Salary — Trang chủ" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Salary<span className="text-muted-foreground">.</span></span>
          </a>
          <div className="flex items-center gap-5">
            <span className="hidden text-xs text-muted-foreground sm:inline">Mỗi giây đều có giá trị.</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            >
              {isDarkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Thu nhập & thời gian</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nhìn mức lương theo cách khác.</h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Từ một tháng lương đến từng giây bạn đang sống.</p>
          </div>
          <div className="space-y-1 text-sm sm:text-right">
            <p className="font-medium">Tháng {currentTime.getMonth() + 1}, {currentTime.getFullYear()}</p>
            <p className="text-xs text-muted-foreground">{calculation.daysInMonth} ngày · 24 giờ mỗi ngày</p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
          <SalaryForm />
          <SalaryOverview monthlySalary={monthlySalary} calculation={calculation} />
        </div>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t px-5 py-5 text-xs text-muted-foreground sm:px-8">
        <span>Salary · Giá trị của từng khoảnh khắc.</span>
        <span>Không cần tài khoản. Bắt đầu bằng mức lương của bạn.</span>
      </footer>
    </div>
  );
};

export default HomePage;
