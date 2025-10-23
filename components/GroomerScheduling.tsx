'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Groomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AvailabilitySlot {
  id: string;
  groomer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function GroomerScheduling() {
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedGroomer, setSelectedGroomer] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: groomersData, error: groomersError } = await supabase
          .from('groomers')
          .select('id, name, email, phone');

        if (groomersError) throw groomersError;
        setGroomers(groomersData || []);
        if (groomersData && groomersData.length > 0) {
          setSelectedGroomer(groomersData[0].id);
        }
      } catch (error) {
        console.error('Error fetching groomers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedGroomer) return;

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('groomer_availability')
          .select('*')
          .eq('groomer_id', selectedGroomer)
          .order('day_of_week', { ascending: true });

        if (error) throw error;
        setAvailability(data || []);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [selectedGroomer]);

  const toggleAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error } = await supabase
        .from('groomer_availability')
        .update({ is_available: !currentStatus })
        .eq('id', slotId);

      if (error) throw error;

      setAvailability(
        availability.map((slot) => (slot.id === slotId ? { ...slot, is_available: !currentStatus } : slot))
      );
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return <div>Loading groomer scheduling...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Groomer Availability Management</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Groomer</label>
        <select
          value={selectedGroomer}
          onChange={(e) => setSelectedGroomer(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Choose a groomer...</option>
          {groomers.map((groomer) => (
            <option key={groomer.id} value={groomer.id}>
              {groomer.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroomer && (
        <div className="space-y-4">
          {availability.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {daysOfWeek[slot.day_of_week % 7]}
                </p>
                <p className="text-sm text-gray-600">
                  {slot.start_time} - {slot.end_time}
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.is_available}
                  onChange={() => toggleAvailability(slot.id, slot.is_available)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {slot.is_available ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
