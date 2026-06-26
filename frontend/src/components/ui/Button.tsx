import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'saffron'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
        {
          'bg-teal text-white shadow-sm hover:bg-teal-dark hover:shadow': variant === 'primary',
          'bg-mist text-ink hover:bg-border': variant === 'secondary',
          'border border-border bg-surface text-ink hover:border-teal/40 hover:bg-teal-light/30': variant === 'outline',
          'text-ink-muted hover:bg-mist hover:text-ink': variant === 'ghost',
          'bg-saffron text-white hover:brightness-95': variant === 'saffron',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )
}