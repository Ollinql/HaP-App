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
      {/* Desktop overlay when manually toggled (optional) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 hidden md:block"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'hidden md:flex flex-col',
          'w-52 h-full bg-surface border-r border-border z-30 shrink-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(26,106,255,0.12)', border: '1px solid rgba(26,106,255,0.2)' }}
          >
            🤾
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-primary tracking-tight leading-tight">
              Handball
            </div>
            <div className="text-[11px] font-medium text-muted leading-tight tracking-wide uppercase">
              Training Planner
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-primary hover:bg-elevated',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
                  <span className="tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border shrink-0">
          <p className="text-[11px] text-muted font-medium">v1.0 · Offline · localStorage</p>
        </div>
      </aside>
    </>
  )
}
