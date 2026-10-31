import { differenceInCalendarDays, format } from 'date-fns';
import { useCurrentDay } from '@/hooks/use-current-time';
import { getSalaryPeriod, parseSalaryDate } from '@/lib/salary';
import { useSalaryStore } from '@/stores/salary-store';
import { PaydayScene } from './payday-scene';
import './payday-companion.css';

export function PaydayCompanion() {
  const currentDay = useCurrentDay();
  const monthlySalary = useSalaryStore((state) => state.monthlySalary);
  const paydayDate = useSalaryStore((state) => state.paydayDate);
  const hasReceivedSalary = useSalaryStore((state) => state.hasReceivedSalary);
  const { payday } = getSalaryPeriod(currentDay, parseSalaryDate(paydayDate));
  const daysUntilPayday = differenceInCalendarDays(payday, currentDay);
  const hasSalary = monthlySalary !== null;
  const isCelebrating = hasSalary && daysUntilPayday === 0;
  const speech = isCelebrating
    ? 'Ting ting! Lương về!'
    : hasSalary && daysUntilPayday < 0
      ? 'Hẹn kỳ lương mới!'
      : 'Chăm chỉ làm việc,\nchờ lương về';
  let message = 'Chờ lương cũng có đồng đội.';
  let description = 'Điền kỳ lương bên dưới, mình cùng đếm ngược nhé.';

  if (hasSalary && hasReceivedSalary) {
    message = 'Lương về rồi. Bạn xứng đáng!';
    description = 'Một kỳ cố gắng đã được đền đáp. Tự thưởng một chút nhé.';
  } else if (hasSalary && daysUntilPayday < 0) {
    message = 'Một kỳ lương đã khép lại.';
    description = 'Cập nhật kỳ lương mới để tiếp tục đồng hành cùng nhau.';
  } else if (isCelebrating) {
    message = 'Hôm nay là ngày nhận lương!';
    description = 'Khi tiền về, nhớ xác nhận “Đã nhận lương” ở bên dưới nhé.';
  } else if (hasSalary) {
    message = `Còn ${daysUntilPayday} ngày nữa là đến ngày lương.`;
    description = `Ngày hẹn ${format(payday, 'dd/MM/yyyy')} · Mỗi ngày cố gắng đều có giá trị.`;
  }

  return (
    <section
      className="payday-companion mb-3 grid items-center gap-4 overflow-hidden rounded-2xl border p-5 sm:p-7 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:px-8 lg:py-5"
      aria-labelledby="salary-heading"
      data-celebrating={isCelebrating}
    >
      <div className="relative z-10 flex min-w-0 flex-col gap-5">
        <div className="space-y-3">
          <h1
            id="salary-heading"
            className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Nhìn mức lương theo cách khác.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Mỗi giây trôi qua, một chút thu nhập tích lũy. Thêm một chút động lực cho ngày làm việc của bạn.
          </p>
        </div>
        <div className="payday-message border-l-2 pl-3" role="status" aria-atomic="true">
          <p className="text-sm font-medium">{message}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mx-auto flex w-full min-w-0 max-w-[460px] items-center justify-center">
        <PaydayScene
          speech={speech}
          paydayLabel={hasSalary ? format(payday, 'dd') : '₫'}
          isCelebrating={isCelebrating}
        />
      </div>
    </section>
  );
}
