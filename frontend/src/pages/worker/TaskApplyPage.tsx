import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { TaskCard } from '@/components/TaskCard'
import type { Task } from '@/types'

export function TaskApplyPage() {
  const { id } = useParams<{ id: string }>()
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: task } = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })

  const applyMutation = useMutation({
    mutationFn: () =>
      api.post(`/tasks/${id}/applications`, {
        proposed_price: parseInt(price),
        message: message || null,
      }),
    onSuccess: () => setSubmitted(true),
  })

  if (!task) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <TaskCard task={task} />

      <Card className="mt-6">
        {submitted ? (
          <p className="text-center text-brand-600 font-medium">
            Application submitted! The customer will review your quote.
          </p>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">Apply to this task</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Your price (₹)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Message (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I have 2 years experience in..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => applyMutation.mutate()}
                disabled={!price || applyMutation.isPending}
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}