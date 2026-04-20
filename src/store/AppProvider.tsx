import { useEffect, ReactNode } from 'react'
import { SeasonsProvider } from './SeasonsContext'
import { SessionsProvider, useSessions } from './SessionsContext'
import { ExercisesProvider, useExercises, deduplicateExercises } from './ExercisesContext'
import { SettingsProvider } from './SettingsContext'
import { GymProvider } from './GymContext'
import type { Exercise, SessionExerciseRef, SectionKey, IntensityLevel } from '../types/session'
import type { TrainingSession } from '../types/session'

// Detects old-format sessions where sections still contain full Exercise objects
function isOldFormatSession(session: TrainingSession): boolean {
  for (const sectionKey of ['warmup', 'main', 'closing'] as SectionKey[]) {
    const items = session.sections[sectionKey] as unknown[]
    if (items.length > 0 && typeof items[0] === 'object' && items[0] !== null && 'title' in items[0]) {
      return true
    }
  }
  return false
}

// Inner component that has access to both Sessions and Exercises contexts
function SessionFormatMigration() {
  const { sessions, setSessions } = useSessions()
  const { setExercises } = useExercises()

  useEffect(() => {
    const needsMigration = sessions.some(isOldFormatSession)
    if (!needsMigration) return

    const extractedExercises: Exercise[] = []

    const migratedSessions: TrainingSession[] = sessions.map((session) => {
      if (!isOldFormatSession(session)) return session

      const newSections: Record<SectionKey, SessionExerciseRef[]> = { warmup: [], main: [], closing: [] }
      for (const sectionKey of ['warmup', 'main', 'closing'] as SectionKey[]) {
        const items = session.sections[sectionKey] as unknown[]
        newSections[sectionKey] = items.map((item) => {
          const raw = item as Record<string, unknown>
          if ('exerciseId' in raw) return raw as unknown as SessionExerciseRef
          const ex = raw as unknown as Exercise & { intensityFeedback?: IntensityLevel | null }
          const { intensityFeedback, ...archiveEx } = ex
          extractedExercises.push(archiveEx as Exercise)
          return {
            exerciseId: ex.id,
            section: sectionKey,
            intensityFeedback: intensityFeedback ?? null,
          } satisfies SessionExerciseRef
        })
      }
      return { ...session, sections: newSections }
    })

    setExercises((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]))
      for (const ex of extractedExercises) {
        if (!map.has(ex.id)) map.set(ex.id, ex)
      }
      return deduplicateExercises(Array.from(map.values()))
    })

    setSessions(migratedSessions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <GymProvider>
        <SeasonsProvider>
          <ExercisesProvider>
            <SessionsProvider>
              <SessionFormatMigration />
              {children}
            </SessionsProvider>
          </ExercisesProvider>
        </SeasonsProvider>
      </GymProvider>
    </SettingsProvider>
  )
}
