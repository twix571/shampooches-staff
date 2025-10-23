'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface PetStatus {
  id: string;
  appointment_id: string;
  pet_name: string;
  customer_name: string;
  status: string;
  current_step: string;
  started_at?: string;
  updated_at: string;
}

const statusSteps = ['waiting', 'bathing', 'drying', 'haircut', 'nail-care', 'final-check', 'ready-for-pickup'];

export default function PetStatusTracking() {
  const [pets, setPets] = useState<PetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetStatus = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('pet_status')
          .select('*')
          .eq('status', 'grooming')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setPets(data || []);
      } catch (error) {
        console.error('Error fetching pet status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetStatus();
    const interval = setInterval(fetchPetStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (petId: string, newStep: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const updateData: any = {
        current_step: newStep,
        updated_at: new Date().toISOString(),
      };

      if (newStep === 'ready-for-pickup') {
        updateData.status = 'completed';
      }

      const { error } = await supabase
        .from('pet_status')
        .update(updateData)
        .eq('id', petId);

      if (error) throw error;

      setPets(
        pets.map((pet) =>
          pet.id === petId
            ? {
                ...pet,
                current_step: newStep,
                status: newStep === 'ready-for-pickup' ? 'completed' : pet.status,
              }
            : pet
        )
      );
    } catch (error) {
      console.error('Error updating pet status:', error);
    }
  };

  if (loading) {
    return <div>Loading pet status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Pet Status Tracking</h2>

      {pets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pets currently being groomed</p>
      ) : (
        <div className="space-y-6">
          {pets.map((pet) => (
            <div key={pet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pet.pet_name}</h3>
                <p className="text-sm text-gray-600">Customer: {pet.customer_name}</p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Progress</p>
                  <p className="text-xs text-gray-500">
                    Current: <span className="font-medium">{pet.current_step}</span>
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((statusSteps.indexOf(pet.current_step) + 1) / statusSteps.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {statusSteps.map((step) => (
                  <button
                    key={step}
                    onClick={() => handleStatusUpdate(pet.id, step)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      pet.current_step === step
                        ? 'bg-blue-600 text-white'
                        : statusSteps.indexOf(step) < statusSteps.indexOf(pet.current_step)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {step.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
