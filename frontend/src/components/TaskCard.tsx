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
  open: 'bg-teal-light text-teal',
  assigned: 'bg-saffron-light text-saffron',
  in_progress: 'bg-mist text-ink-muted',
  completed: 'bg-verified/10 text-verified',
  cancelled: 'bg-mist text-cement',
}

export function TaskCard({ task, linkTo }: Props) {
  const content = (
    <Card className="transition-all hover:border-teal/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {task.category && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-saffron">
              {task.category.name}
            </span>
          )}
          <h3 className="mt-1 font-medium text-ink">{task.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {task.description}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${statusStyles[task.status] || 'bg-mist text-cement'}`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-cement">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {task.city}
        </span>
        {(task.budget_min || task.budget_max) && (
          <span className="flex items-center gap-1.5 font-mono text-ink-muted">
            <IndianRupee className="h-3.5 w-3.5" />
            {task.budget_min && task.budget_max
              ? `${formatCurrency(task.budget_min)} – ${formatCurrency(task.budget_max)}`
              : formatCurrency(task.budget_max || task.budget_min || 0)}
          </span>
        )}
        {task.scheduled_at && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(task.scheduled_at)}
          </span>
        )}
      </div>
      {task.application_count !== undefined && task.application_count > 0 && (
        <p className="mt-3 font-mono text-xs text-teal">
          {task.application_count} application{task.application_count !== 1 ? 's' : ''}
        </p>
      )}
    </Card>
  )

  if (linkTo) return <Link to={linkTo} className="block">{content}</Link>
  return content
}