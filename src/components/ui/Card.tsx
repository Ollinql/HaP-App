import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: boolean
}

export function Card({ children, padding = true, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        'bg-surface border border-border rounded-xl',
        padding ? 'p-4' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
