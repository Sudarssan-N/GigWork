import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-sm text-ink',
        'placeholder:text-muted',
        'outline-none transition-all',
        'focus:border-violet focus:ring-4 focus:ring-violet/15',
        className,
      )}
      {...props}
    />
  )
}