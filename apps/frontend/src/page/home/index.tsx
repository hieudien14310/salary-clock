import { SalaryForm } from './components/salary-form';
import { SalaryOverview } from './components/salary-overview';
import { PaydayCompanion } from './components/payday-companion';

const HomePage = () => {
  return (
    <main className="flex-1 p-3">
      <PaydayCompanion />

      <div className="grid items-start gap-3 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <SalaryForm />
        <SalaryOverview />
      </div>
    </main>
  );
};

export default HomePage;
