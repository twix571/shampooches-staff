import StaffNavigation from '@/components/StaffNavigation';
import ServicePricingAdmin from '@/components/ServicePricingAdmin';

export const metadata = {
  title: 'Services | Shampooches Staff Portal',
};

export default function ServicesPage() {
  return (
    <>
      <StaffNavigation />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Service & Pricing Management</h1>
          <ServicePricingAdmin />
        </div>
      </main>
    </>
  );
}
