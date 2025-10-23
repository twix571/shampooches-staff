import StaffNavigation from '@/components/StaffNavigation';
import GroomerScheduling from '@/components/GroomerScheduling';

export const metadata = {
  title: 'Scheduling | Shampooches Staff Portal',
};

export default function SchedulingPage() {
  return (
    <>
      <StaffNavigation />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Groomer Availability</h1>
          <GroomerScheduling />
        </div>
      </main>
    </>
  );
}
