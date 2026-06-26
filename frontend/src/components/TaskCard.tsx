import { Link } from 'react-router-dom'
import { MapPin, Clock, IndianRupee } from 'lucide-react'
import type { Task } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  task: Task
  linkTo?: string
}

const statusStyles: Record<string, string> = {
  open: 'bg-lime text-ink font-bold',
  assigned: 'bg-pink-light text-pink font-bold',
  in_progress: 'bg-violet-light text-violet font-bold',
  completed: 'bg-cyan-light text-violet-dark font-bold',
  cancelled: 'bg-mist text-muted',
}

export function TaskCard({ task, linkTo }: Props) {
  const content = (
    <Card className="transition-all hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-lg hover:shadow-violet/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {task.category && (
            <span className="sticker sticker-violet text-[10px]">{task.category.name}</span>
          )}
          <h3 className="mt-2 font-bold text-ink">{task.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm font-medium text-ink-muted">
            {task.description}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${statusStyles[task.status] || 'bg-mist text-muted'}`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-pink" />
          {task.city}
        </span>
        {(task.budget_min || task.budget_max) && (
          <span className="flex items-center gap-1.5 font-bold text-violet">
            <IndianRupee className="h-3.5 w-3.5" />
            {task.budget_min && task.budget_max
              ? `${formatCurrency(task.budget_min)} – ${formatCurrency(task.budget_max)}`
              : formatCurrency(task.budget_max || task.budget_min || 0)}
          </span>
        )}
        {task.scheduled_at && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan" />
            {formatDate(task.scheduled_at)}
          </span>
        )}
      </div>
      {task.application_count !== undefined && task.application_count > 0 && (
        <p className="mt-3 text-xs font-bold text-pink">
          {task.application_count} applied already 👀
        </p>
      )}
    </Card>
  )

  if (linkTo) return <Link to={linkTo} className="block">{content}</Link>
  return content
}