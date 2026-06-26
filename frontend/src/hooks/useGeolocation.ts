import { useEffect, useState } from 'react'
import { reverseGeocode, type GeoResult } from '@/lib/geocoding'

export function useGeolocation(autoDetect = true) {
  const [location, setLocation] = useState<GeoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detect = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
          setLocation(result)
        } catch {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            city: '',
            address: '',
          })
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    if (autoDetect) detect()
  }, [autoDetect])

  return { location, loading, error, detect, setLocation }
}