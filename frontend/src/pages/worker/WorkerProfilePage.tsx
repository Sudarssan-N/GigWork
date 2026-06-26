import { useQuery } from '@tanstack/react-query'
import { Shield, Star, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { cn, formatCurrency } from '@/lib/utils'
import type { WorkerProfile } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function WorkerProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
  })

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>
  if (!profile) return <div className="p-8 text-center text-gray-500">Profile not found</div>

  const days = profile.availability
    ? Object.entries(profile.availability).filter(([, v]) => v).map(([d]) => d)
    : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Worker Profile</h1>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize',
              STATUS_STYLES[profile.verification_status] || 'bg-gray-100',
            )}
          >
            <Shield className="mr-1 inline h-3 w-3" />
            {profile.verification_status}
          </span>
          {profile.rating_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {profile.rating_avg} ({profile.rating_count} reviews)
            </span>
          )}
        </div>

        {profile.verification_status === 'pending' && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Your profile is under review. You'll be able to apply for tasks once verified.
          </div>
        )}

        <p className="text-gray-600">{profile.bio}</p>

        {profile.hourly_rate && (
          <p className="text-lg font-semibold text-brand-600">
            {formatCurrency(profile.hourly_rate)}/hr
          </p>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                {s}
              </span>
            ))}
          </div>
        </div>

        {days.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-500">
              <Clock className="h-4 w-4" /> Available days
            </h3>
            <p className="text-sm">{days.join(', ')}</p>
          </div>
        )}

        {profile.id_doc_url && (
          <p className="text-xs text-gray-400">ID document uploaded</p>
        )}
      </Card>
    </div>
  )
}