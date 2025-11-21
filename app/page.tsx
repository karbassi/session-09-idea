import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Hairstylist Booking Platform</h1>
        <p className="text-lg mb-8 text-gray-600">
          Book your mobile hairstyling appointments with ease
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/booking"
            className="p-6 border rounded-lg hover:border-gray-400 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Book Appointment →</h2>
            <p className="text-gray-600">Schedule your hairstyling service</p>
          </Link>
          
          <Link
            href="/admin"
            className="p-6 border rounded-lg hover:border-gray-400 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Admin Dashboard →</h2>
            <p className="text-gray-600">Manage bookings and approvals</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
