import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/seasons', label: 'Saisonplanung', icon: '📅' },
  { to: '/gym', label: 'Gym Training', icon: '🏋' },
  { to: '/exercises', label: 'Übungsarchiv', icon: '🗂' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full w-56 bg-surface border-r border-border z-30',
          'flex flex-col transition-transform duration-200 ease-in-out',
          'md:translate-x-0 md:static md:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-lg shrink-0">
            🤾
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-primary leading-tight">Handball</div>
            <div className="text-[11px] text-muted leading-tight">Training Planner</div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-elevated transition-colors md:hidden shrink-0"
            aria-label="Menü schließen"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose()}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 my-0.5',
                  isActive
                    ? 'bg-accent/12 text-accent font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-elevated',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-base w-5 text-center shrink-0 opacity-80">
                    {item.icon}
                  </span>
                  <span className={isActive ? 'text-accent' : ''}>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border shrink-0">
          <p className="text-[11px] text-muted">v1.0 · Offline · localStorage</p>
        </div>
      </aside>
    </>
  )
}
