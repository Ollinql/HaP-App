import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Season, Phase, Microcycle } from '../types/season'
import { generateId } from '../utils/idUtils'

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface SeasonsContextValue {
  seasons: Season[]
  setSeasons: Setter<Season[]>
  addSeason: (name: string, startDate: string, endDate: string) => Season
  updateSeason: (season: Season) => void
  deleteSeason: (id: string) => void
  addPhase: (seasonId: string, phase: Omit<Phase, 'id' | 'seasonId' | 'microcycles'>) => Phase
  updatePhase: (phase: Phase) => void
  deletePhase: (id: string) => void
  addMicrocycle: (phaseId: string, mc: Omit<Microcycle, 'id' | 'phaseId'>) => Microcycle
  updateMicrocycle: (mc: Microcycle) => void
  deleteMicrocycle: (id: string) => void
}

const SeasonsContext = createContext<SeasonsContextValue | null>(null)

export function SeasonsProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useLocalStorage<Season[]>('htp_v1_seasons', [])

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

  return (
    <SeasonsContext.Provider
      value={{
        seasons,
        setSeasons,
        addSeason,
        updateSeason,
        deleteSeason,
        addPhase,
        updatePhase,
        deletePhase,
        addMicrocycle,
        updateMicrocycle,
        deleteMicrocycle,
      }}
    >
      {children}
    </SeasonsContext.Provider>
  )
}

export function useSeasons(): SeasonsContextValue {
  const ctx = useContext(SeasonsContext)
  if (!ctx) throw new Error('useSeasons must be used inside SeasonsProvider')
  return ctx
}
