import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { TaskMap } from '@/components/TaskMap'
import type { Category } from '@/types'

export function NewTaskPage() {
  const navigate = useNavigate()
  const { location, loading: geoLoading, detect } = useGeolocation(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    address: '',
    city: '',
    latitude: null as number | null,
    longitude: null as number | null,
    budget_min: '',
    budget_max: '',
    scheduled_at: '',
    duration_hours: '',
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  })

  useEffect(() => {
    if (location) {
      setForm((f) => ({
        ...f,
        city: location.city || f.city,
        address: location.address || f.address,
        latitude: location.latitude,
        longitude: location.longitude,
      }))
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const task = await api.post<{ id: string }>('/tasks', {
        category_id: form.category_id,
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        latitude: form.latitude,
        longitude: form.longitude,
        budget_min: form.budget_min ? parseInt(form.budget_min) : null,
        budget_max: form.budget_max ? parseInt(form.budget_max) : null,
        duration_hours: form.duration_hours ? parseFloat(form.duration_hours) : null,
        scheduled_at: form.scheduled_at || null,
      })
      navigate(`/tasks/${task.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post task')
    } finally {
      setLoading(false)
    }
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Post a new task</h1>
      <p className="mb-6 text-sm text-gray-500">Anyone can post tasks — you can also apply to other gigs</p>

      {form.latitude && form.longitude && (
        <div className="mb-6">
          <TaskMap
            tasks={[{
              id: 'preview', customer_id: '', category_id: '', title: form.title || 'Task location',
              description: '', address: form.address, city: form.city,
              latitude: form.latitude, longitude: form.longitude,
              budget_min: null, budget_max: null, scheduled_at: null, duration_hours: null,
              status: 'open', created_at: '',
            }]}
            center={[form.latitude, form.longitude]}
            zoom={14}
          />
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="Help with kitchen cleaning" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input value={form.address} onChange={(e) => update('address', e.target.value)} required />
            </div>
            <Button type="button" variant="outline" onClick={detect} disabled={geoLoading}>
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <Input value={form.city} onChange={(e) => update('city', e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Min budget (₹)</label>
              <Input type="number" value={form.budget_min} onChange={(e) => update('budget_min', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max budget (₹)</label>
              <Input type="number" value={form.budget_max} onChange={(e) => update('budget_max', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Scheduled date & time</label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => update('scheduled_at', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Duration (hours)</label>
              <Input type="number" step="0.5" value={form.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Posting...' : 'Post Task'}
          </Button>
        </form>
      </Card>
    </div>
  )
}