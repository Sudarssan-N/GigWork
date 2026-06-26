import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink',
        'placeholder:text-cement',
        'outline-none transition-colors',
        'focus:border-teal focus:ring-2 focus:ring-teal/15',
        className,
      )}
      {...props}
    />
  )
}