import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Application } from '@/types'

export function MyApplicationsPage() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<Application[]>('/applications/mine'),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Applications</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">No applications yet. Browse tasks to apply!</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{formatCurrency(app.proposed_price)}</p>
                  {app.message && <p className="mt-1 text-sm text-gray-500">{app.message}</p>}
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                  {app.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}