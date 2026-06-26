import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TaskCard } from '@/components/TaskCard'
import { formatCurrency } from '@/lib/utils'
import type { Task, Application, Booking } from '@/types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: task } = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => api.get<Application[]>(`/tasks/${id}/applications`),
    enabled: !!id,
  })

  const acceptMutation = useMutation({
    mutationFn: (applicationId: string) =>
      api.post<Booking>('/bookings', { application_id: applicationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['applications', id] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  if (!task) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <TaskCard task={task} />

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">
          Applications ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">No applications yet. Workers will apply soon!</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{app.worker?.full_name || 'Worker'}</p>
                    <p className="text-lg font-bold text-brand-600">
                      {formatCurrency(app.proposed_price)}
                    </p>
                    {app.message && (
                      <p className="mt-2 text-sm text-gray-500">{app.message}</p>
                    )}
                    <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'pending' && task.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(app.id)}
                      disabled={acceptMutation.isPending}
                    >
                      Accept
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}