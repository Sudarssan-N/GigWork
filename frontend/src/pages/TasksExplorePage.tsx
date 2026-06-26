import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Map, List, MapPin, Plus, Zap } from 'lucide-react'
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
          <span className="sticker sticker-lime text-ink">live gigs</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">
            What's near you
          </h1>
          <p className="mt-2 font-medium text-ink-muted">
            Browse, apply, or post your own — same account
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/tasks/new">
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Post gig</Button>
          </Link>
          {!profile?.has_worker_profile && (
            <Link to="/worker/onboard">
              <Button size="sm" variant="lime"><Zap className="mr-1 h-4 w-4" /> Hustle</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-surface p-3 shadow-sm">
        <Input
          placeholder="City filter"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="max-w-xs border-0 bg-violet-light/60 focus:bg-surface"
        />
        <select
          className="rounded-xl border-2 border-border bg-violet-light/60 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All vibes</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={detect} disabled={geoLoading}>
          <MapPin className="mr-1 h-4 w-4" />
          {geoLoading ? 'Locating…' : 'Near me'}
        </Button>
        {location?.city && !city && (
          <span className="sticker sticker-cyan">{location.city}</span>
        )}
        <div className="ml-auto flex rounded-full bg-violet-light p-1">
          <button
            onClick={() => setView('map')}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-all',
              view === 'map' ? 'gradient-btn text-white shadow-sm' : 'text-muted',
            )}
            aria-label="Map view"
          >
            <Map className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-all',
              view === 'list' ? 'gradient-btn text-white shadow-sm' : 'text-muted',
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="font-medium text-muted">Loading gigs…</p>
      ) : view === 'map' ? (
        <TaskMap
          tasks={tasks}
          userLocation={location}
          linkPrefix="/tasks"
        />
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-violet/30 bg-violet-light/40 px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-ink">Nothing here yet</p>
          <p className="mt-2 font-medium text-ink-muted">Try another city or be first — post a gig.</p>
          <Link to="/tasks/new" className="mt-6 inline-block">
            <Button>Post a gig</Button>
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