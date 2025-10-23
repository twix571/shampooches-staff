import StaffNavigation from '@/components/StaffNavigation';
import DashboardMetrics from '@/components/DashboardMetrics';
import PetStatusTracking from '@/components/PetStatusTracking';
import AppointmentManagement from '@/components/AppointmentManagement';

export const metadata = {
  title: 'Dashboard | Shampooches Staff Portal',
};

export default function DashboardPage() {
  return (
    <>
      <StaffNavigation />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Staff Dashboard</h1>

          <DashboardMetrics />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PetStatusTracking />
            </div>
            <div>
              <AppointmentManagement />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
