import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TaskCard } from '@/components/TaskCard'
import type { Task } from '@/types'

export function MyTasksPage() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get<Task[]>('/tasks?mine=true'),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Tasks</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Post your first task!</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} linkTo={`/customer/tasks/${task.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}