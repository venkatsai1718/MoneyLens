import React from 'react'
import clsx from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  as?: 'button'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          {
            'bg-carbon text-on-accent hover:bg-gunmetal shadow-card hover:shadow-glow': variant === 'primary',
            'bg-platinum text-ink hover:bg-alabaster': variant === 'secondary',
            'text-ink-soft hover:bg-platinum/70': variant === 'ghost',
            'border border-border text-ink hover:border-gunmetal bg-white': variant === 'outline',
          },
          {
            'text-xs px-3 py-1.5': size === 'sm',
            'text-sm px-4 py-2.5': size === 'md',
            'text-[15px] px-6 py-3.5': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {variant === 'primary' && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
        )}
        <span className="relative inline-flex items-center gap-2">{children}</span>
      </button>
    )
  },
)
Button.displayName = 'Button'
