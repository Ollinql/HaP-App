export type PhaseType = 'Vorbereitung' | 'Wettkampf' | 'Pause'

export interface Microcycle {
  id: string
  phaseId: string
  weekNumber: number
  focusLabel: string
  startDate: string // YYYY-MM-DD (Monday of that week)
}

export interface Phase {
  id: string
  seasonId: string
  type: PhaseType
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  microcycles: Microcycle[]
}

export interface Season {
  id: string
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  phases: Phase[]
}
