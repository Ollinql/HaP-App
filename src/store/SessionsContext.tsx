import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { TrainingSession } from '../types/session'

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface SessionsContextValue {
  sessions: TrainingSession[]
  setSessions: Setter<TrainingSession[]>
  addSession: (session: TrainingSession) => void
  updateSession: (session: TrainingSession) => void
  deleteSession: (id: string) => void
}

const SessionsContext = createContext<SessionsContextValue | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useLocalStorage<TrainingSession[]>('htp_v1_sessions', [])

  function addSession(session: TrainingSession) {
    setSessions((prev) => [...prev, session])
  }

  function updateSession(session: TrainingSession) {
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <SessionsContext.Provider value={{ sessions, setSessions, addSession, updateSession, deleteSession }}>
      {children}
    </SessionsContext.Provider>
  )
}

export function useSessions(): SessionsContextValue {
  const ctx = useContext(SessionsContext)
  if (!ctx) throw new Error('useSessions must be used inside SessionsProvider')
  return ctx
}
