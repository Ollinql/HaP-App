interface BadgeProps {
  label: string
  onRemove?: () => void
  className?: string
}

export function Badge({ label, onRemove, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-elevated border border-border text-muted',
        className,
      ].join(' ')}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-muted hover:text-primary leading-none ml-0.5"
          aria-label={`Tag "${label}" entfernen`}
        >
          ×
        </button>
      )}
    </span>
  )
}
