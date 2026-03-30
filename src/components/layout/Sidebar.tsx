import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/seasons', label: 'Saisonplanung', icon: '📅' },
  { to: '/exercises', label: 'Übungsarchiv', icon: '🗂' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full w-56 bg-surface border-r border-border z-30',
          'flex flex-col transition-transform duration-200',
          'md:translate-x-0 md:static md:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <span className="text-2xl">🤾</span>
          <div>
            <div className="text-sm font-bold text-primary leading-tight">Handball</div>
            <div className="text-xs text-muted leading-tight">Training Planner</div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="ml-auto text-muted hover:text-primary md:hidden"
            aria-label="Menü schließen"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose()}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent/20 text-accent font-medium border-r-2 border-accent'
                    : 'text-muted hover:text-primary hover:bg-elevated',
                ].join(' ')
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted">v1.0 · localStorage</p>
        </div>
      </aside>
    </>
  )
}
