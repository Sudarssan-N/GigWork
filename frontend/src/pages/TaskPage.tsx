import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { TaskDetailPage } from '@/pages/customer/TaskDetailPage'
import { TaskApplyPage } from '@/pages/worker/TaskApplyPage'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Task } from '@/types'

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const { data: task } = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })

  if (!task || !profile) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (task.customer_id === profile.id) {
    return <TaskDetailPage />
  }

  return <TaskApplyPage />
}