import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { DeleteServiceButton } from './delete-service-button'
import { ToggleActiveButton } from './toggle-active-button'

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <Link href="/admin/services/new">
          <Button>Add Service</Button>
        </Link>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-red-600">
              Error loading services. Make sure the database is set up.
            </div>
          </CardContent>
        </Card>
      )}

      {!error && services && services.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-600">No services yet. Add your first service to get started.</p>
              <Link href="/admin/services/new">
                <Button className="mt-4">Add Service</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && services && services.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      service.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{service.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">${service.price}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/services/edit/${service.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <ToggleActiveButton serviceId={service.id} currentActive={service.active} />
                  <DeleteServiceButton serviceId={service.id} serviceName={service.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
