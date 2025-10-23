'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
}

export default function ServicePricingAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Service>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditingData({ ...service });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error } = await supabase
        .from('services')
        .update(editingData)
        .eq('id', editingId);

      if (error) throw error;

      setServices(
        services.map((s) => (s.id === editingId ? { ...s, ...editingData } : s)) as Service[]
      );

      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Service & Pricing Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Service Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                {editingId === service.id ? (
                  <>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editingData.description || ''}
                        onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.base_price || 0}
                        onChange={(e) => setEditingData({ ...editingData, base_price: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={editingData.duration_minutes || 0}
                        onChange={(e) => setEditingData({ ...editingData, duration_minutes: parseInt(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900 font-medium text-sm mr-3"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingData({});
                        }}
                        className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-gray-900">{service.name}</td>
                    <td className="py-3 px-4 text-gray-600">{service.description}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${service.base_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600">{service.duration_minutes} min</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
