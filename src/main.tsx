import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppProvider } from './store/AppContext'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { SeasonPlannerPage } from './pages/SeasonPlannerPage'
import { SessionEditorPage } from './pages/SessionEditorPage'
import { ExerciseArchivePage } from './pages/ExerciseArchivePage'
import { FeedbackPage } from './pages/FeedbackPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'seasons', element: <SeasonPlannerPage /> },
      { path: 'sessions/new', element: <SessionEditorPage /> },
      { path: 'sessions/:id', element: <SessionEditorPage /> },
      { path: 'exercises', element: <ExerciseArchivePage /> },
      { path: 'feedback/:id', element: <FeedbackPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
], { basename: '/HaP-App' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
