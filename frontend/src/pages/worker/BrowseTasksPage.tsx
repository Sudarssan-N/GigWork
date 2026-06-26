import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { TaskCard } from '@/components/TaskCard'
import type { Task, Category, WorkerProfile } from '@/types'

export function BrowseTasksPage() {
  const [city, setCity] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: workerProfile } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: async () => {
      try {
        return await api.get<WorkerProfile>('/workers/me')
      } catch {
        return null
      }
    },
  })

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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Browse Tasks</h1>

      {workerProfile?.verification_status === 'pending' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <Shield className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Verification in progress</p>
            <p className="mt-1">You can browse tasks but cannot apply until an admin approves your profile.</p>
          </div>
        </div>
      )}

      {workerProfile?.verification_status === 'rejected' && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Your verification was rejected. Please <Link to="/worker/onboard" className="underline">re-submit your profile</Link>.
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No open tasks found.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} linkTo={`/worker/tasks/${task.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}