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
      className="payday-companion relative grid items-center gap-5 py-7 sm:py-9 md:grid-cols-[1.2fr_1fr] md:gap-8"
      aria-labelledby="salary-heading"
      data-celebrating={isCelebrating}
    >
      <div className="relative z-10 flex min-w-0 flex-col gap-5">
        <p className="section-eyebrow cozy-sticker inline-flex w-fit items-center gap-2 rounded-full border-[1.5px] border-cozy-border-cocoa bg-cozy-cream px-3.5 py-1.5 text-cozy-burgundy">
          <Sparkles className="size-3.5 text-cozy-coral" aria-hidden="true" /> Mỗi ngày một chút rủng rỉnh
        </p>
        <div className="space-y-3.5">
          <h1
            id="salary-heading"
            className="max-w-2xl text-[2.05rem] leading-[1.18] font-extrabold tracking-[-0.025em] text-cozy-burgundy sm:text-[2.75rem] lg:text-[3.15rem]"
          >
            Mỗi giây trôi qua,
            <br />
            <span className="hero-highlight relative inline-block text-cozy-forest">thêm một chút vui.</span>
          </h1>
          <p className="max-w-md text-sm leading-7 font-medium text-cozy-taupe">
            Nhìn thu nhập lớn lên theo từng giây. Một chút động lực để ngày làm việc của bạn nhẹ nhàng hơn.
          </p>
        </div>
        <div className="cozy-note-card flex items-start gap-3 px-4 py-3.5" role="status" aria-atomic="true">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-cozy-border-cocoa bg-cozy-cream text-cozy-burgundy shadow-[inset_0_1px_0_rgba(255,253,247,0.85),0_2px_0_0_rgba(125,99,91,0.3)]">
            {isCelebrating ? (
              <PartyPopper className="size-4 text-cozy-coral" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4 text-cozy-gold" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="text-sm font-bold text-cozy-espresso">{message}</p>
            <p className="mt-0.5 text-xs leading-relaxed font-medium text-cozy-taupe">{description}</p>
          </div>
        </div>
      </div>
      <div className="relative mx-auto hidden w-full min-w-0 max-w-[430px] items-center justify-center md:flex">
        <PaydayScene
          speech={speech}
          paydayLabel={hasSalary ? format(payday, 'dd') : '₫'}
          isCelebrating={isCelebrating}
        />
        <span className="hero-sticker cozy-sticker absolute right-1 bottom-5 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-cozy-border-cocoa bg-cozy-mint px-3.5 py-1.5 text-xs font-bold text-cozy-espresso">
          <ArrowUpRight className="size-4 text-cozy-forest" aria-hidden="true" /> Tích tiểu thành đại
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-cozy-taupe md:absolute md:right-4 md:bottom-4">
        <ShieldCheck className="size-3.5 text-cozy-forest" aria-hidden="true" /> Không cần tài khoản · Dữ liệu chỉ ở
        trên máy bạn
      </p>
    </section>
  );
}
