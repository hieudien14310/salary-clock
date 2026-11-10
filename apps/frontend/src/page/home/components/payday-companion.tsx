import { differenceInCalendarDays, format } from 'date-fns';
import { ArrowUpRight, PartyPopper, ShieldCheck, Sparkles } from 'lucide-react';
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
  const isCelebrating = hasSalary && (hasReceivedSalary || daysUntilPayday === 0);
  const speech = isCelebrating
    ? 'Ting ting! Lương về!'
    : hasSalary && daysUntilPayday < 0
      ? 'Hẹn kỳ lương mới!'
      : 'Cứ thong thả,\nlương đang lớn lên!';
  let message = 'Chờ lương cũng có đồng đội.';
  let description = 'Thêm mức lương của bạn để bắt đầu nhé.';

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
      className="payday-companion relative grid items-center gap-4 py-8 sm:py-10 md:grid-cols-[1.25fr_1fr] md:gap-8"
      aria-labelledby="salary-heading"
      data-celebrating={isCelebrating}
    >
      <div className="relative z-10 flex min-w-0 flex-col gap-5">
        <p className="section-eyebrow flex items-center gap-2 text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" /> Mỗi ngày một chút rủng rỉnh
        </p>
        <div className="space-y-4">
          <h1
            id="salary-heading"
            className="max-w-2xl text-[2rem] leading-[1.2] font-semibold tracking-[-0.045em] sm:text-[2.75rem] lg:text-[3.2rem]"
          >
            Mỗi giây trôi qua,
            <br />
            <span className="hero-highlight relative inline-block text-primary">thêm một chút vui.</span>
          </h1>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Nhìn thu nhập lớn lên theo từng giây. Một chút động lực để ngày làm việc của bạn nhẹ nhàng hơn.
          </p>
        </div>
        <div className="flex items-start gap-3" role="status" aria-atomic="true">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--warm)] text-[var(--warm-foreground)]">
            {isCelebrating ? (
              <PartyPopper className="size-4" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="text-sm font-medium">{message}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="relative mx-auto hidden w-full min-w-0 max-w-[420px] items-center justify-center md:flex">
        <PaydayScene
          speech={speech}
          paydayLabel={hasSalary ? format(payday, 'dd') : '₫'}
          isCelebrating={isCelebrating}
        />
        <span className="hero-sticker absolute right-0 bottom-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-2 text-xs shadow-sm">
          <ArrowUpRight className="size-4 text-primary" aria-hidden="true" /> Tích tiểu thành đại
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground md:absolute md:right-4 md:bottom-4">
        <ShieldCheck className="size-3.5" aria-hidden="true" /> Không cần tài khoản · Dữ liệu chỉ ở trên máy bạn
      </p>
    </section>
  );
}
