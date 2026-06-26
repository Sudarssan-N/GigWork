import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function OnboardingPage() {
  const { refreshProfile } = useAuth()
  const { location, detect, loading: geoLoading } = useGeolocation(true)
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location?.city) setCity(location.city)
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/auth/me', {
        full_name: fullName,
        city,
        latitude: location?.latitude,
        longitude: location?.longitude,
      })
      await refreshProfile()
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">Welcome to GigWork</h1>
        <p className="mt-1 text-sm text-gray-500">
          One account for everything — post tasks, find work, or both
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Mumbai" />
            </div>
            <Button type="button" variant="outline" className="mt-6" onClick={detect} disabled={geoLoading}>
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Get Started'}
          </Button>
        </form>
      </Card>
    </div>
  )
}