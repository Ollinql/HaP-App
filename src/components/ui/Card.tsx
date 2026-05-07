import { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'default' | 'elevated' | 'ghost' | 'accent'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: boolean
  variant?: CardVariant
  shadow?: boolean
}

const VARIANTS: Record<CardVariant, string> = {
  default:  'bg-surface border border-border',
  elevated: 'bg-elevated border border-border',
  ghost:    'bg-transparent border border-border/50',
  accent:   'bg-elevated border border-accent/25',
}

export function Card({
  children,
  padding = true,
  variant = 'default',
  shadow = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        'rounded-xl',
        VARIANTS[variant],
        padding ? 'p-4' : '',
        shadow ? 'shadow-md' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
