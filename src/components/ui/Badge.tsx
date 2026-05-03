type BadgeColor = 'default' | 'accent' | 'green' | 'orange' | 'red'

interface BadgeProps {
  label: string
  onRemove?: () => void
  className?: string
  color?: BadgeColor
}

const COLORS: Record<BadgeColor, string> = {
  default: 'bg-elevated border-border text-secondary',
  accent: 'bg-accent/15 border-accent/30 text-accent',
  green: 'bg-green-900/40 border-green-700/50 text-green-300',
  orange: 'bg-orange-900/40 border-orange-700/50 text-orange-300',
  red: 'bg-red-900/40 border-red-700/50 text-red-300',
}

export function Badge({ label, onRemove, className = '', color = 'default' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
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
