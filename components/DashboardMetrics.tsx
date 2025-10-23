'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Metrics {
  totalAppointments: number;
  completedToday: number;
  pendingToday: number;
  totalRevenue: number;
  averageServiceTime: number;
  activePets: number;
}

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalAppointments: 0,
    completedToday: 0,
    pendingToday: 0,
    totalRevenue: 0,
    averageServiceTime: 0,
    activePets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch today's appointments
        const { data: todayAppointments } = await supabase
          .from('appointments')
          .select('*')
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

        // Fetch all appointments for revenue
        const { data: allAppointments } = await supabase
          .from('appointments')
          .select('status, total_service_cost');

        // Fetch active pet statuses
        const { data: activePets } = await supabase
          .from('pet_status')
          .select('id')
          .eq('status', 'grooming');

        const completed = todayAppointments?.filter((a) => a.status === 'completed').length || 0;
        const pending = todayAppointments?.filter((a) => a.status === 'pending').length || 0;
        const totalRevenue = allAppointments?.reduce((sum, a) => sum + (a.total_service_cost || 0), 0) || 0;

        setMetrics({
          totalAppointments: allAppointments?.length || 0,
          completedToday: completed,
          pendingToday: pending,
          totalRevenue: totalRevenue,
          averageServiceTime: 90, // Placeholder
          activePets: activePets?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Today&rsquo;s Appointments</h3>
        <p className="text-3xl font-bold text-gray-900">{metrics.completedToday + metrics.pendingToday}</p>
        <p className="text-xs text-gray-500 mt-2">{metrics.completedToday} completed, {metrics.pendingToday} pending</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Daily Revenue</h3>
        <p className="text-3xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-2">From all bookings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Currently Grooming</h3>
        <p className="text-3xl font-bold text-gray-900">{metrics.activePets}</p>
        <p className="text-xs text-gray-500 mt-2">Pets in progress</p>
      </div>
    </div>
  );
}
