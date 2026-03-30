import { useState, ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  badge?: number
  defaultOpen?: boolean
  children: ReactNode
  headerExtra?: ReactNode
}

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
  headerExtra,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-elevated transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-primary">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <span className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </button>
      {open && <div className="p-4 bg-base border-t border-border">{children}</div>}
    </div>
  )
}
