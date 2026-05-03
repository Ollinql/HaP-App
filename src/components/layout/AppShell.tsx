import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/seasons': 'Saisonplanung',
  '/gym': 'Gym Training',
  '/exercises': 'Übungsarchiv',
  '/settings': 'Einstellungen',
  '/feedback': 'Feedback',
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
  )?.[1] ?? 'Handball Training Planner'

  return (
    <div className="flex h-full bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface border-b border-border shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:bg-elevated transition-colors text-lg"
            aria-label="Menü öffnen"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🤾</span>
            <span className="text-sm font-semibold text-primary">{title}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
