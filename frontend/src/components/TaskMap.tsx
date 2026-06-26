import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import type { Task } from '@/types'
import { formatCurrency } from '@/lib/utils'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface Props {
  tasks: Task[]
  center?: [number, number]
  zoom?: number
  linkPrefix?: string
  userLocation?: { latitude: number; longitude: number } | null
}

export function TaskMap({
  tasks,
  center,
  zoom = 12,
  linkPrefix = '/tasks',
  userLocation,
}: Props) {
  const mapped = tasks.filter((t) => t.latitude && t.longitude)

  const mapCenter: [number, number] = center
    || (userLocation ? [userLocation.latitude, userLocation.longitude] : null)
    || (mapped[0] ? [mapped[0].latitude!, mapped[0].longitude!] : [19.076, 72.8777])

  useEffect(() => {
    // Leaflet needs invalidateSize after mount in some layouts
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
  }, [])

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-gray-200">
      <MapContainer center={mapCenter} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {mapped.map((task) => (
          <Marker key={task.id} position={[task.latitude!, task.longitude!]}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-gray-500">{task.city}</p>
                {task.budget_max && (
                  <p className="mt-1 text-sm text-brand-600">{formatCurrency(task.budget_max)}</p>
                )}
                <Link to={`${linkPrefix}/${task.id}`} className="mt-2 block text-xs text-brand-600 underline">
                  View task
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}