import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Briefcase, IndianRupee, Shield, CheckCircle, XCircle, Settings,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn, formatCurrency } from '@/lib/utils'
import type { AdminStats, AdminWorker, AdminUser } from '@/types'

type Tab = 'overview' | 'workers' | 'users' | 'settings'

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [workerFilter, setWorkerFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending')
  const [feePercent, setFeePercent] = useState('')
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats'),
  })

  const { data: workers = [] } = useQuery({
    queryKey: ['admin-workers', workerFilter],
    queryFn: () => {
      const qs = workerFilter !== 'all' ? `?status=${workerFilter}` : ''
      return api.get<AdminWorker[]>(`/admin/workers${qs}`)
    },
    enabled: tab === 'workers' || tab === 'overview',
  })

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<AdminUser[]>('/admin/users'),
    enabled: tab === 'users',
  })

  const { data: config } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => api.get<Record<string, string>>('/admin/config'),
    enabled: tab === 'settings',
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/workers/${id}/verify`, { verification_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const configMutation = useMutation({
    mutationFn: (value: string) =>
      api.patch('/admin/config', { key: 'convenience_fee_percent', value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-config'] }),
  })

  const viewDocument = async (workerId: string) => {
    try {
      const res = await api.get<{ signed_url: string }>(`/admin/workers/${workerId}/id-document`)
      window.open(res.signed_url, '_blank')
    } catch {
      alert('Could not load document')
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'workers', label: 'Workers', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-px">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users },
              { label: 'Workers', value: stats.total_workers, icon: Shield },
              { label: 'Open Tasks', value: stats.total_tasks, icon: Briefcase },
              { label: 'Revenue', value: formatCurrency(stats.platform_revenue), icon: IndianRupee },
            ].map((s) => (
              <Card key={s.label} className="flex items-center gap-4">
                <div className="rounded-lg bg-brand-50 p-3">
                  <s.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="mb-4 font-semibold">
              Pending Verifications ({stats.pending_verifications})
            </h2>
            {workers.filter((w) => w.verification_status === 'pending').length === 0 ? (
              <p className="text-sm text-gray-500">No pending verifications</p>
            ) : (
              <div className="space-y-3">
                {workers
                  .filter((w) => w.verification_status === 'pending')
                  .slice(0, 5)
                  .map((w) => (
                    <WorkerRow
                      key={w.id}
                      worker={w}
                      onVerify={(status) => verifyMutation.mutate({ id: w.id, status })}
                      onViewDoc={() => viewDocument(w.id)}
                      loading={verifyMutation.isPending}
                    />
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'workers' && (
        <div>
          <div className="mb-4 flex gap-2">
            {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setWorkerFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm capitalize',
                  workerFilter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600',
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {workers.map((w) => (
              <WorkerRow
                key={w.id}
                worker={w}
                onVerify={(status) => verifyMutation.mutate({ id: w.id, status })}
                onViewDoc={() => viewDocument(w.id)}
                loading={verifyMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">{u.full_name || '—'}</td>
                  <td className="py-3 pr-4">{u.email || u.phone || '—'}</td>
                  <td className="py-3 pr-4">{u.city || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <Card className="max-w-md">
          <h2 className="mb-4 font-semibold">Platform Fee</h2>
          <p className="mb-4 text-sm text-gray-500">
            Current fee: {config?.convenience_fee_percent || '12'}%
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Fee %"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
            />
            <Button
              onClick={() => configMutation.mutate(feePercent)}
              disabled={!feePercent || configMutation.isPending}
            >
              Update
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function WorkerRow({
  worker,
  onVerify,
  onViewDoc,
  loading,
}: {
  worker: AdminWorker
  onVerify: (status: string) => void
  onViewDoc: () => void
  loading: boolean
}) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="font-semibold">{worker.profile?.full_name || 'Unknown'}</p>
        <p className="text-sm text-gray-500">
          {worker.profile?.city} · {worker.skills.join(', ')}
        </p>
        {worker.hourly_rate && (
          <p className="text-sm text-brand-600">{formatCurrency(worker.hourly_rate)}/hr</p>
        )}
        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
          {worker.verification_status}
        </span>
      </div>
      <div className="flex gap-2">
        {worker.id_doc_url && (
          <Button size="sm" variant="outline" onClick={onViewDoc}>
            View ID
          </Button>
        )}
        {worker.verification_status === 'pending' && (
          <>
            <Button size="sm" onClick={() => onVerify('verified')} disabled={loading}>
              <CheckCircle className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => onVerify('rejected')} disabled={loading}>
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}