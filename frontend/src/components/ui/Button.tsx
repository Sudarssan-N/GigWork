import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'pink' | 'secondary' | 'outline' | 'ghost'
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
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet',
        'active:scale-[0.98]',
        {
          'gradient-btn text-white shadow-lg shadow-violet/25 hover:brightness-110 hover:shadow-violet/40': variant === 'primary',
          'gradient-btn-lime shadow-lg shadow-lime/30 hover:brightness-105': variant === 'lime',
          'bg-pink text-white shadow-lg shadow-pink/30 hover:brightness-110': variant === 'pink',
          'bg-violet-light text-violet hover:bg-violet/15': variant === 'secondary',
          'border-2 border-violet/30 bg-surface text-ink hover:border-violet hover:bg-violet-light/50': variant === 'outline',
          'text-ink-muted hover:bg-violet-light/60 hover:text-violet': variant === 'ghost',
          'px-4 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )
}