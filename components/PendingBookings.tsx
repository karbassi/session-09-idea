'use client';

import { useState, useEffect } from 'react';
import { supabase, Booking } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default function PendingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          service:services(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings list
      await fetchPendingBookings();
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error approving booking:', err);
      alert('Failed to approve booking');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;

    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings list
      await fetchPendingBookings();
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Clock className="mx-auto text-gray-400 mb-2" size={48} />
        <p className="text-gray-600">No pending bookings</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pending Bookings</h2>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {booking.client?.name || 'Unknown Client'}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(booking.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{booking.client?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{booking.client?.phone}</p>
                  </div>
                </div>

                {booking.client?.address && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{booking.client.address}</p>
                  </div>
                )}

                {booking.client?.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-700">{booking.client.notes}</p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col gap-2">
                {booking.deposit_receipt_url && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Receipt
                  </button>
                )}
                
                <button
                  onClick={() => handleApprove(booking.id)}
                  disabled={processingId === booking.id}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                
                <button
                  onClick={() => handleReject(booking.id)}
                  disabled={processingId === booking.id}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt Modal */}
      {selectedBooking && selectedBooking.deposit_receipt_url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-3xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Payment Receipt</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Client: {selectedBooking.client?.name}</p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(selectedBooking.date)} at {formatTime(selectedBooking.start_time)}
              </p>
            </div>

            <img
              src={selectedBooking.deposit_receipt_url}
              alt="Payment receipt"
              className="w-full rounded-lg shadow-lg"
            />

            <div className="mt-6 flex gap-4 justify-end">
              <button
                onClick={() => handleReject(selectedBooking.id)}
                disabled={processingId === selectedBooking.id}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedBooking.id)}
                disabled={processingId === selectedBooking.id}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
