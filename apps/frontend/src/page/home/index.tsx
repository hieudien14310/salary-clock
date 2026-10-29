import { SalaryForm } from './components/salary-form';
import { SalaryHistory } from './components/salary-history';
import { SalaryOverview } from './components/salary-overview';

const HomePage = () => {
  return (
    <main className="flex-1 p-3">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-3">
          {/* <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Thu nhập & thời gian</p> */}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nhìn mức lương theo cách khác.</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Chuyển đổi tiền lương của bạn thành số tiền kiếm được mỗi giây mỗi phút mỗi giờ mỗi ngày để tạo cảm giác vui
            vẻ, tăng sự hào hứng khi làm việc 🥳
          </p>
        </div>
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <SalaryForm />
        <SalaryOverview />
      </div>
      <SalaryHistory />
    </main>
  );
};

export default HomePage;
