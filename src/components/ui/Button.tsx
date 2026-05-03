import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-white shadow-sm',
  secondary: 'bg-elevated hover:bg-input text-primary border border-border',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
  ghost: 'text-muted hover:text-primary hover:bg-elevated',
}

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
