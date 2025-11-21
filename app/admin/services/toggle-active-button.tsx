'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ToggleActiveButton({ serviceId, currentActive }: { serviceId: string; currentActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentActive })
        .eq('id', serviceId)

      if (error) {
        alert('Error updating service: ' + error.message)
      } else {
        router.refresh()
      }
    } catch (err) {
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : currentActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}
