import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Booking } from '@/types'

export function BookingsPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  })

  const payMutation = useMutation({
    mutationFn: (bookingId: string) => api.post(`/payments/dev-confirm/${bookingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Bookings</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{booking.task?.title || 'Task'}</h3>
                  <p className="mt-1 text-sm text-gray-500">{booking.task?.city}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>Worker price: {formatCurrency(booking.agreed_price)}</p>
                    <p>Platform fee: {formatCurrency(booking.platform_fee)}</p>
                    <p className="font-semibold">Total: {formatCurrency(booking.total_charge)}</p>
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {profile?.role === 'customer' && booking.status === 'pending_payment' && (
                    <Button
                      size="sm"
                      onClick={() => payMutation.mutate(booking.id)}
                      disabled={payMutation.isPending}
                    >
                      Pay Now
                    </Button>
                  )}
                  {booking.status === 'paid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({ id: booking.id, status: 'in_progress' })
                      }
                    >
                      Start Job
                    </Button>
                  )}
                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: booking.id, status: 'completed' })
                      }
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}