import StaffNavigation from '@/components/StaffNavigation';
import AppointmentManagement from '@/components/AppointmentManagement';

export const metadata = {
  title: 'Appointments | Shampooches Staff Portal',
};

export default function AppointmentsPage() {
  return (
    <>
      <StaffNavigation />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment Management</h1>
          <AppointmentManagement />
        </div>
      </main>
    </>
  );
}
