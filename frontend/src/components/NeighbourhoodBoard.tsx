import { MapPin, IndianRupee } from 'lucide-react'
import type { Category } from '@/types'

const SAMPLE_TASKS = [
  { title: 'Deep clean 2BHK before guests', city: 'Koramangala', budget: '₹1,200' },
  { title: 'Help move sofa to 3rd floor', city: 'Andheri West', budget: '₹800' },
  { title: 'Prep lunch for 8 people', city: 'Indiranagar', budget: '₹1,500' },
]

interface Props {
  categories: Category[]
}

export function NeighbourhoodBoard({ categories }: Props) {
  const labels = categories.slice(0, 3).map((c) => c.name)
  const tasks = SAMPLE_TASKS.map((t, i) => ({
    ...t,
    tag: labels[i] || 'Local gig',
  }))

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="local-radius absolute inset-0 rounded-3xl" aria-hidden />
      <div className="relative space-y-3 p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">Live near you</p>
        {tasks.map((task, i) => (
          <div
            key={task.title}
            className="animate-board-fade-in rounded-xl border border-border bg-surface p-4 shadow-md"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wide text-saffron">
                  {task.tag}
                </span>
                <p className="mt-1 font-medium text-ink">{task.title}</p>
              </div>
              <span className="shrink-0 rounded-md bg-teal-light px-2 py-1 font-mono text-xs text-teal">
                Open
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-cement">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {task.city}
              </span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> {task.budget}
              </span>
            </div>
          </div>
        ))}
        <div
          className="animate-board-float rounded-xl border border-dashed border-teal/30 bg-teal-light/40 px-4 py-3 text-center text-sm text-teal"
          style={{ animationDelay: '0.5s' }}
        >
          + {categories.length || 8} categories · workers applying now
        </div>
      </div>
    </div>
  )
}