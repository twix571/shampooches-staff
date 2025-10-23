'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_bookings: number;
  last_booking?: string;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  notes: string;
}

export default function CustomerDatabase() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPets, setCustomerPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            phone,
            appointments (id),
            pets (id)
          `)
          .order('name', { ascending: true });

        if (error) throw error;

        const customersWithCounts = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          total_bookings: c.appointments?.length || 0,
          last_booking: c.appointments?.[0]?.appointment_date,
        }));

        setCustomers(customersWithCounts);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data, error } = await supabase
        .from('pets')
        .select('id, name, breed, age, notes')
        .eq('customer_id', customer.id);

      if (error) throw error;
      setCustomerPets(data || []);
    } catch (error) {
      console.error('Error fetching customer pets:', error);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading customer database...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Database & Pet Records</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-gray-500 text-sm">No customers found</p>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`w-full text-left p-3 rounded-md transition ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{customer.total_bookings} bookings</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedCustomer ? (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedCustomer.name}</h3>

              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Email:</span> {selectedCustomer.email}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Bookings:</span> {selectedCustomer.total_bookings}
                </p>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-4">Pet Records</h4>

              {customerPets.length === 0 ? (
                <p className="text-gray-500 text-sm">No pets on record</p>
              ) : (
                <div className="space-y-4">
                  {customerPets.map((pet) => (
                    <div key={pet.id} className="p-4 border border-gray-200 rounded-md">
                      <p className="font-medium text-gray-900">{pet.name}</p>
                      <p className="text-sm text-gray-600">{pet.breed}, Age {pet.age}</p>
                      {pet.notes && <p className="text-sm text-gray-600 mt-2">Notes: {pet.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a customer to view their details and pet records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
