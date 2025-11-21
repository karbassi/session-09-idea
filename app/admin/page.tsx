'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PendingBookings from '@/components/PendingBookings';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  pending: number;
  confirmed: number;
  total: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ pending: 0, confirmed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('status');

      if (allBookings) {
        const pending = allBookings.filter(b => b.status === 'pending').length;
        const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
        setStats({
          pending,
          confirmed,
          total: allBookings.length,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage bookings and approvals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? '-' : stats.pending}
                </p>
              </div>
              <Clock className="text-orange-600" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '-' : stats.confirmed}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '-' : stats.total}
                </p>
              </div>
              <Calendar className="text-blue-600" size={40} />
            </div>
          </div>
        </div>

        {/* Pending Bookings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <PendingBookings />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={fetchStats}
              className="p-4 border rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-semibold mb-1">Refresh Stats</h3>
              <p className="text-sm text-gray-600">Update dashboard statistics</p>
            </button>
            
            <a
              href="/admin/all-bookings"
              className="p-4 border rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-semibold mb-1">View All Bookings</h3>
              <p className="text-sm text-gray-600">See complete booking history</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
