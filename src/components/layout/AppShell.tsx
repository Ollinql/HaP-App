import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/seasons', label: 'Saison', icon: '📅' },
  { to: '/gym', label: 'Gym', icon: '🏋' },
  { to: '/exercises', label: 'Archiv', icon: '🗂' },
  { to: '/settings', label: 'Mehr', icon: '⚙' },
]

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-full bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-[68px] md:pb-0">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'rgba(15,15,15,0.96)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid #1e1e1e',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors duration-150',
                    isActive ? 'text-accent' : 'text-muted',
                  ].join(' ')
                }
              >
                <span className="text-[22px] leading-none">{item.icon}</span>
                <span
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ letterSpacing: '0.07em' }}
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
