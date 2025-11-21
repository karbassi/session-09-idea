import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  // Fetch today's bookings
  const { data: todayBookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(*),
      service:services(*)
    `)
    .eq('date', today)
    .order('start_time', { ascending: true })

  // Fetch pending bookings
  const { data: pendingBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'pending')
    .gte('date', today)

  // Fetch total services
  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayBookings?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingBookings?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{servicesCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-gray-600">
              Error loading appointments. Make sure the database is set up.
            </div>
          )}
          {!error && todayBookings && todayBookings.length === 0 && (
            <div className="text-sm text-gray-600">
              No appointments scheduled for today.
            </div>
          )}
          {!error && todayBookings && todayBookings.length > 0 && (
            <div className="space-y-4">
              {todayBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{booking.client?.name}</p>
                    <p className="text-sm text-gray-600">{booking.service?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{booking.start_time}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
