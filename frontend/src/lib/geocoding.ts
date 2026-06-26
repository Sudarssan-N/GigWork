export interface GeoResult {
  latitude: number
  longitude: number
  city: string
  address: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigWork/1.0' } },
  )
  if (!res.ok) throw new Error('Could not detect location')
  const data = await res.json()
  const addr = data.address || {}
  const city =
    addr.city || addr.town || addr.village || addr.suburb || addr.county || ''
  const road = addr.road || addr.neighbourhood || ''
  const address = [road, city].filter(Boolean).join(', ') || data.display_name || ''
  return { latitude: lat, longitude: lng, city, address }
}

export async function forwardGeocode(query: string): Promise<GeoResult | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigWork/1.0' } },
  )
  if (!res.ok) return null
  const data = await res.json()
  if (!data[0]) return null
  const item = data[0]
  return {
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    city: item.address?.city || item.address?.town || query,
    address: item.display_name,
  }
}