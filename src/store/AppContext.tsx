import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Season, Phase, Microcycle } from '../types/season'
import type { TrainingSession, Exercise, SessionExerciseRef, SectionKey } from '../types/session'
import type { Settings, DayKey, Goal } from '../types/settings'
import { generateId } from '../utils/idUtils'

// ── Helpers ─────────────────────────────────────────────────────────────────

function deduplicateExercises(exercises: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>()
  for (const ex of exercises) {
    if (!byId.has(ex.id)) byId.set(ex.id, ex)
  }
  const byNameSection = new Map<string, boolean>()
  const result: Exercise[] = []
  for (const ex of byId.values()) {
    if (!ex.title) { result.push(ex); continue }
    const key = `${ex.title.trim().toLowerCase()}::${ex.section}`
    if (!byNameSection.has(key)) { byNameSection.set(key, true); result.push(ex) }
  }
  return result
}

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

const DEFAULT_SETTINGS: Settings = {
  trainingDays: {
    monday: { enabled: true, duration: 90 },
    tuesday: { enabled: false, duration: 90 },
    wednesday: { enabled: true, duration: 90 },
    thursday: { enabled: false, duration: 90 },
    friday: { enabled: true, duration: 90 },
    saturday: { enabled: false, duration: 90 },
    sunday: { enabled: false, duration: 90 },
  },
  trainingGoals: [],
  globalTags: [],
}

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface AppContextValue {
  // Data slices
  seasons: Season[]
  sessions: TrainingSession[]
  exercises: Exercise[]
  settings: Settings

  // Raw setters (for pages that manage local copies)
  setSeasons: Setter<Season[]>
  setSessions: Setter<TrainingSession[]>
  setExercises: Setter<Exercise[]>
  setSettings: Setter<Settings>

  // Season helpers
  addSeason: (name: string, startDate: string, endDate: string) => Season
  updateSeason: (season: Season) => void
  deleteSeason: (id: string) => void
  addPhase: (seasonId: string, phase: Omit<Phase, 'id' | 'seasonId' | 'microcycles'>) => Phase
  updatePhase: (phase: Phase) => void
  deletePhase: (id: string) => void
  addMicrocycle: (phaseId: string, mc: Omit<Microcycle, 'id' | 'phaseId'>) => Microcycle
  updateMicrocycle: (mc: Microcycle) => void
  deleteMicrocycle: (id: string) => void

  // Session helpers
  addSession: (session: TrainingSession) => void
  updateSession: (session: TrainingSession) => void
  deleteSession: (id: string) => void

  // Exercise helpers
  addExercise: (exercise: Exercise) => void
  updateExercise: (exercise: Exercise) => void
  deleteExercise: (id: string) => void

  // Settings helpers
  updateSettings: (s: Settings) => void
  addGoal: (text: string, tag?: string) => void
  removeGoal: (id: string) => void
  toggleGoal: (id: string) => void
  addGlobalTag: (tag: string) => void
  removeGlobalTag: (tag: string) => void
  setTrainingDay: (day: DayKey, config: { enabled?: boolean; duration?: number }) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useLocalStorage<Season[]>('htp_v1_seasons', [])
  const [sessions, setSessions] = useLocalStorage<TrainingSession[]>('htp_v1_sessions', [])
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('htp_v1_exercises', [])
  const [settings, setSettings] = useLocalStorage<Settings>('htp_v1_settings', DEFAULT_SETTINGS)

  // Migrate legacy string goals to Goal objects (stable IDs via useMemo)
  const migratedGoals = useMemo(
    () =>
      settings.trainingGoals.map((g) =>
        typeof g === 'string'
          ? ({ id: generateId(), text: g as unknown as string, completed: false } as Goal)
          : g,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.trainingGoals],
  )
  const migratedSettings: Settings = useMemo(
    () => ({ ...settings, trainingGoals: migratedGoals }),
    [settings, migratedGoals],
  )

  // Persist migration once if legacy strings are found
  useEffect(() => {
    if (settings.trainingGoals.some((g) => typeof g === 'string')) {
      setSettings(migratedSettings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deduplicate archive on startup (by ID, then by title+section)
  useEffect(() => {
    const deduped = deduplicateExercises(exercises)
    if (deduped.length !== exercises.length) {
      setExercises(deduped)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Migrate old-format sessions (sections had full Exercise objects, not SessionExerciseRef)
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
          // Old Exercise object — extract into archive and create ref
          const ex = raw as unknown as Exercise & { intensityFeedback?: number | null }
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

    // Upsert extracted exercises into archive, then deduplicate
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

  // ── Season helpers ──────────────────────────────────────────────────────────

  function addSeason(name: string, startDate: string, endDate: string): Season {
    const season: Season = { id: generateId(), name, startDate, endDate, phases: [] }
    setSeasons((prev) => [...prev, season])
    return season
  }

  function updateSeason(season: Season) {
    setSeasons((prev) => prev.map((s) => (s.id === season.id ? season : s)))
  }

  function deleteSeason(id: string) {
    setSeasons((prev) => prev.filter((s) => s.id !== id))
  }

  function addPhase(
    seasonId: string,
    phaseData: Omit<Phase, 'id' | 'seasonId' | 'microcycles'>,
  ): Phase {
    const phase: Phase = { ...phaseData, id: generateId(), seasonId, microcycles: [] }
    setSeasons((prev) =>
      prev.map((s) => (s.id === seasonId ? { ...s, phases: [...s.phases, phase] } : s)),
    )
    return phase
  }

  function updatePhase(phase: Phase) {
    setSeasons((prev) =>
      prev.map((s) => ({
        ...s,
        phases: s.phases.map((p) => (p.id === phase.id ? phase : p)),
      })),
    )
  }

  function deletePhase(id: string) {
    setSeasons((prev) =>
      prev.map((s) => ({ ...s, phases: s.phases.filter((p) => p.id !== id) })),
    )
  }

  function addMicrocycle(
    phaseId: string,
    mcData: Omit<Microcycle, 'id' | 'phaseId'>,
  ): Microcycle {
    const mc: Microcycle = { ...mcData, id: generateId(), phaseId }
    setSeasons((prev) =>
      prev.map((s) => ({
        ...s,
        phases: s.phases.map((p) =>
          p.id === phaseId ? { ...p, microcycles: [...p.microcycles, mc] } : p,
        ),
      })),
    )
    return mc
  }

  function updateMicrocycle(mc: Microcycle) {
    setSeasons((prev) =>
      prev.map((s) => ({
        ...s,
        phases: s.phases.map((p) => ({
          ...p,
          microcycles: p.microcycles.map((m) => (m.id === mc.id ? mc : m)),
        })),
      })),
    )
  }

  function deleteMicrocycle(id: string) {
    setSeasons((prev) =>
      prev.map((s) => ({
        ...s,
        phases: s.phases.map((p) => ({
          ...p,
          microcycles: p.microcycles.filter((m) => m.id !== id),
        })),
      })),
    )
  }

  // ── Session helpers ─────────────────────────────────────────────────────────

  function addSession(session: TrainingSession) {
    setSessions((prev) => [...prev, session])
  }

  function updateSession(session: TrainingSession) {
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  // ── Exercise helpers ────────────────────────────────────────────────────────

  function addExercise(exercise: Exercise) {
    setExercises((prev) => {
      const exists = prev.some((e) => e.id === exercise.id)
      if (exists) return prev.map((e) => (e.id === exercise.id ? exercise : e))
      return [...prev, exercise]
    })
  }

  function updateExercise(exercise: Exercise) {
    setExercises((prev) => prev.map((e) => (e.id === exercise.id ? exercise : e)))
  }

  function deleteExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  // ── Settings helpers ────────────────────────────────────────────────────────

  function updateSettings(s: Settings) {
    setSettings(s)
  }

  function addGoal(text: string, tag?: string) {
    const goal: Goal = { id: generateId(), text, completed: false, tag }
    setSettings((prev) => ({ ...prev, trainingGoals: [...prev.trainingGoals, goal] }))
  }

  function removeGoal(id: string) {
    setSettings((prev) => ({
      ...prev,
      trainingGoals: prev.trainingGoals.filter((g) => (typeof g === 'string' ? false : g.id !== id)),
    }))
  }

  function toggleGoal(id: string) {
    setSettings((prev) => ({
      ...prev,
      trainingGoals: prev.trainingGoals.map((g) =>
        typeof g !== 'string' && g.id === id ? { ...g, completed: !g.completed } : g,
      ),
    }))
  }

  function addGlobalTag(tag: string) {
    setSettings((prev) => ({ ...prev, globalTags: [...prev.globalTags, tag] }))
  }

  function removeGlobalTag(tag: string) {
    setSettings((prev) => ({
      ...prev,
      globalTags: prev.globalTags.filter((t) => t !== tag),
    }))
  }

  function setTrainingDay(day: DayKey, config: { enabled?: boolean; duration?: number }) {
    setSettings((prev) => ({
      ...prev,
      trainingDays: {
        ...prev.trainingDays,
        [day]: { ...prev.trainingDays[day], ...config },
      },
    }))
  }

  return (
    <AppContext.Provider
      value={{
        seasons,
        sessions,
        exercises,
        settings: migratedSettings,
        setSeasons,
        setSessions,
        setExercises,
        setSettings,
        addSeason,
        updateSeason,
        deleteSeason,
        addPhase,
        updatePhase,
        deletePhase,
        addMicrocycle,
        updateMicrocycle,
        deleteMicrocycle,
        addSession,
        updateSession,
        deleteSession,
        addExercise,
        updateExercise,
        deleteExercise,
        updateSettings,
        addGoal,
        removeGoal,
        toggleGoal,
        addGlobalTag,
        removeGlobalTag,
        setTrainingDay,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
