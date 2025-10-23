'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Appointment {
  id: string;
  customer_name: string;
  pet_name: string;
  appointment_date: string;
  service_id: string;
  status: string;
  deposit_status: string;
}

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        let query = supabase
          .from('appointments')
          .select('id, customer_name, pet_name, appointment_date, service_id, status, deposit_status')
          .order('appointment_date', { ascending: true });

        if (selectedStatus !== 'all') {
          query = query.eq('status', selectedStatus);
        }

        const { data, error } = await query;
        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedStatus]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(
        appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Management</h2>

      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Pet</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Time</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Deposit</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{apt.customer_name}</td>
                  <td className="py-3 px-4 text-gray-900">{apt.pet_name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(apt.appointment_date).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        apt.deposit_status === 'applied'
                          ? 'bg-green-100 text-green-800'
                          : apt.deposit_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {apt.deposit_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
