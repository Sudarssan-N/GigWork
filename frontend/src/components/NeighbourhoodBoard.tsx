import { MapPin, IndianRupee, Zap } from 'lucide-react'
import type { Category } from '@/types'

const SAMPLE_TASKS = [
  { title: 'Deep clean my 2BHK before the party', city: 'Koramangala', budget: '₹1,200', vibe: '🔥 urgent' },
  { title: 'Move my sofa up 3 floors lol', city: 'Andheri', budget: '₹800', vibe: '💪 quick cash' },
  { title: 'Cook lunch for 8 — help!', city: 'Indiranagar', budget: '₹1,500', vibe: '✨ today' },
]

const CARD_STYLES = [
  'border-pink/40 bg-gradient-to-br from-pink-light to-surface',
  'border-cyan/40 bg-gradient-to-br from-cyan-light to-surface',
  'border-violet/40 bg-gradient-to-br from-violet-light to-surface',
]

interface Props {
  categories: Category[]
}

export function NeighbourhoodBoard({ categories }: Props) {
  const labels = categories.slice(0, 3).map((c) => c.name)
  const tasks = SAMPLE_TASKS.map((t, i) => ({
    ...t,
    tag: labels[i] || 'Gig',
    style: CARD_STYLES[i % CARD_STYLES.length],
    tilt: i % 2 === 0 ? '-1.5deg' : '1.5deg',
  }))

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -right-4 -top-4 sticker sticker-lime rotate-6 shadow-md" style={{ '--tilt': '6deg' } as React.CSSProperties}>
        ₹15k/mo avg
      </div>
      <div className="absolute -left-2 top-1/3 sticker sticker-pink -rotate-3">
        no cap 🚀
      </div>

      <div className="relative space-y-3 p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink" />
          </span>
          <p className="text-sm font-bold text-violet">Live gigs near you</p>
        </div>

        {tasks.map((task, i) => (
          <div
            key={task.title}
            className={`animate-pop-in rounded-2xl border-2 p-4 shadow-md ${task.style}`}
            style={{ animationDelay: `${i * 100}ms`, transform: `rotate(${task.tilt})` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="sticker sticker-violet text-[10px]">{task.tag}</span>
                  <span className="text-[10px] font-medium text-muted">{task.vibe}</span>
                </div>
                <p className="mt-2 font-semibold leading-snug text-ink">{task.title}</p>
              </div>
              <span className="shrink-0 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold text-ink">
                OPEN
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-xs font-medium text-ink-muted">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-pink" /> {task.city}</span>
              <span className="flex items-center gap-1 font-bold text-violet"><IndianRupee className="h-3.5 w-3.5" /> {task.budget}</span>
            </div>
          </div>
        ))}

        <div className="animate-float flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet/40 bg-violet-light/60 px-4 py-3 text-sm font-semibold text-violet">
          <Zap className="h-4 w-4" />
          {categories.length || 8}+ categories · people applying rn
        </div>
      </div>
    </div>
  )
}