'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format, addDays, isBefore, startOfDay } from 'date-fns'

function BookingForm() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  const router = useRouter()
  const supabase = createClient()

  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    hair_info: '',
    notes: '',
    date: '',
    start_time: '',
  })

  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  useEffect(() => {
    if (serviceId) {
      loadService()
      loadAvailableDates()
    }
  }, [serviceId])

  useEffect(() => {
    if (formData.date) {
      loadAvailableTimes(formData.date)
    }
  }, [formData.date])

  const loadService = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('active', true)
      .single()

    if (error) {
      setError('Service not found')
    } else {
      setService(data)
    }
  }

  const loadAvailableDates = () => {
    // Generate next 30 days (excluding weekends for simplicity in MVP)
    const dates: string[] = []
    const today = startOfDay(new Date())
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i)
      const dayOfWeek = date.getDay()
      // Skip Sundays (0) and Saturdays (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(format(date, 'yyyy-MM-dd'))
      }
    }
    
    setAvailableDates(dates)
  }

  const loadAvailableTimes = async (date: string) => {
    // Business hours: 9 AM to 5 PM
    const times = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ]

    // Fetch existing bookings for the date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])

    // Fetch blocked times
    const { data: blocked } = await supabase
      .from('blocked_times')
      .select('start_time, end_time')
      .eq('date', date)

    // Filter out unavailable times
    const unavailableTimes = new Set<string>()
    
    if (bookings) {
      bookings.forEach((booking) => {
        times.forEach((time) => {
          if (time >= booking.start_time && time < booking.end_time) {
            unavailableTimes.add(time)
          }
        })
      })
    }

    if (blocked) {
      blocked.forEach((block) => {
        times.forEach((time) => {
          if (time >= block.start_time && time < block.end_time) {
            unavailableTimes.add(time)
          }
        })
      })
    }

    const available = times.filter((time) => !unavailableTimes.has(time))
    setAvailableTimes(available)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!service) {
        throw new Error('Service not selected')
      }

      // Create client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            hair_info: formData.hair_info || null,
            notes: formData.notes || null,
          },
        ])
        .select()
        .single()

      if (clientError) throw clientError

      // Calculate end time
      const [hours, minutes] = formData.start_time.split(':')
      const startDate = new Date()
      startDate.setHours(parseInt(hours), parseInt(minutes), 0)
      const endDate = new Date(startDate.getTime() + service.duration * 60000)
      const end_time = format(endDate, 'HH:mm')

      // Create booking
      const { error: bookingError } = await supabase.from('bookings').insert([
        {
          client_id: clientData.id,
          service_id: serviceId,
          date: formData.date,
          start_time: formData.start_time,
          end_time,
          status: 'pending',
        },
      ])

      if (bookingError) throw bookingError

      // Success
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!serviceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Please select a service to book.
            </p>
            <div className="mt-4 text-center">
              <Link href="/services">
                <Button>View Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Booking Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your booking. We'll contact you shortly to confirm your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{formData.start_time}</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Link href="/services">
                <Button className="w-full">Book Another Service</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Service: {service.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {step} of 2: {step === 1 ? 'Date & Time' : 'Your Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="date">Select Date *</Label>
                    <select
                      id="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.date && (
                    <div className="space-y-2">
                      <Label htmlFor="time">Select Time *</Label>
                      <select
                        id="time"
                        value={formData.start_time}
                        onChange={(e) =>
                          setFormData({ ...formData, start_time: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Choose a time</option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {availableTimes.length === 0 && (
                        <p className="text-sm text-gray-600">
                          No available times for this date. Please select another date.
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.date || !formData.start_time}
                    className="w-full"
                  >
                    Next: Your Information
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      placeholder="Where should we come to provide the service?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hair_info">Hair Type/Length (optional)</Label>
                    <Input
                      id="hair_info"
                      value={formData.hair_info}
                      onChange={(e) =>
                        setFormData({ ...formData, hair_info: e.target.value })
                      }
                      placeholder="e.g., Long curly hair"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requests (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}
