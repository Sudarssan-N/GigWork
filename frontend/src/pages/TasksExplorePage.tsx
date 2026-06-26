import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Map, List, MapPin, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TaskCard } from '@/components/TaskCard'
import { TaskMap } from '@/components/TaskMap'
import { cn } from '@/lib/utils'
import type { Task, Category } from '@/types'

export function TasksExplorePage() {
  const { profile } = useAuth()
  const { location, loading: geoLoading, detect } = useGeolocation(true)
  const [view, setView] = useState<'list' | 'map'>('map')
  const [city, setCity] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  })

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['open-tasks', city, categoryId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (categoryId) params.set('category_id', categoryId)
      const qs = params.toString()
      return api.get<Task[]>(`/tasks${qs ? `?${qs}` : ''}`)
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-teal">Explore</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Tasks near you</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Post your own or apply to open gigs — same account
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/tasks/new">
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Post task</Button>
          </Link>
          {!profile?.has_worker_profile && (
            <Link to="/worker/onboard">
              <Button size="sm" variant="outline">Start earning</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <Input
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="max-w-xs border-0 bg-mist focus:bg-surface"
        />
        <select
          className="rounded-lg border border-border bg-mist px-3 py-2 text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={detect} disabled={geoLoading}>
          <MapPin className="mr-1 h-4 w-4" />
          {geoLoading ? 'Detecting…' : 'Use my location'}
        </Button>
        {location?.city && !city && (
          <span className="text-sm text-cement">Near {location.city}</span>
        )}
        <div className="ml-auto flex rounded-lg bg-mist p-1">
          <button
            onClick={() => setView('map')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              view === 'map' ? 'bg-surface text-ink shadow-sm' : 'text-cement',
            )}
            aria-label="Map view"
          >
            <Map className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              view === 'list' ? 'bg-surface text-ink shadow-sm' : 'text-cement',
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-ink-muted">Loading tasks…</p>
      ) : view === 'map' ? (
        <TaskMap
          tasks={tasks}
          userLocation={location}
          linkPrefix="/tasks"
        />
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-mist/50 px-6 py-16 text-center">
          <p className="font-medium text-ink">No open tasks match your filters</p>
          <p className="mt-2 text-sm text-ink-muted">Try a different city or post one yourself.</p>
          <Link to="/tasks/new" className="mt-6 inline-block">
            <Button>Post a task</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} linkTo={`/tasks/${task.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}