type BadgeColor = 'default' | 'accent' | 'green' | 'orange' | 'red'

interface BadgeProps {
  label: string
  onRemove?: () => void
  className?: string
  color?: BadgeColor
}

const COLORS: Record<BadgeColor, string> = {
  default: 'bg-elevated border-border text-secondary',
  accent:  'bg-accent/12 border-accent/25 text-accent',
  green:   'bg-green-950/60 border-green-800/40 text-green-400',
  orange:  'bg-orange-950/60 border-orange-800/40 text-orange-400',
  red:     'bg-red-950/60 border-red-800/40 text-red-400',
}

export function Badge({ label, onRemove, className = '', color = 'default' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border tracking-wide',
        COLORS[color],
        className,
      ].join(' ')}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-current opacity-50 hover:opacity-100 leading-none ml-0.5 transition-opacity"
          aria-label={`Tag "${label}" entfernen`}
        >
          ×
        </button>
      )}
    </span>
  )
}
