import { SalaryForm } from './components/salary-form';
import { SalaryOverview } from './components/salary-overview';
import { PaydayCompanion } from './components/payday-companion';
import { useSalaryStore } from '@/stores/salary-store';

const HomePage = () => {
  const hasSalary = useSalaryStore((state) => state.monthlySalary !== null);

  return (
    <main id="main-content" className="page-container flex-1 pb-8">
      <PaydayCompanion />

      <div
        className="salary-workspace grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]"
        data-has-salary={hasSalary}
      >
        <SalaryForm />
        <SalaryOverview />
      </div>
    </main>
  );
};

export default HomePage;
